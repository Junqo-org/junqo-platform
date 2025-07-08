import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/widgets/navbar.dart';
import 'package:flutter/services.dart'; // Import for HapticFeedback

class InterviewSimulation extends StatefulWidget {
  final String? initialContext;
  const InterviewSimulation({super.key, this.initialContext});

  @override
  State<InterviewSimulation> createState() => _InterviewSimulationState();
}

// Add SingleTickerProviderStateMixin for animations
class _InterviewSimulationState extends State<InterviewSimulation> with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final TextEditingController _contextController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  final ApiService _apiService = GetIt.instance<ApiService>();
  
  bool _isLoading = false;
  bool _isLoadingTip = false;
  List<Map<String, dynamic>> _conversation = [];
  int _questionCount = 0;
  bool _isFirstMessage = true;
  String _lastAiQuestion = '';
  String _lastUserAnswer = '';

  // Animation controller for typing indicator dots
  late AnimationController _dotAnimationController;
  late List<Animation<double>> _dotAnimations;

  late final bool _contextFixed;
  bool _interviewStarted = false;

  @override
  void initState() {
    super.initState();
    _contextFixed = widget.initialContext != null;
    if (widget.initialContext != null && widget.initialContext!.isNotEmpty) {
      _contextController.text = widget.initialContext!;
    }

    // Improved welcome message
    _conversation.add({
      'role': 'assistant',
      'content': 'Bonjour! Prêt à simuler votre entretien?\nIndiquez le poste ou le contexte ci-dessus puis cliquez sur « Démarrer l\'entretien ».',
      'showTipButton': false,
    });

    // Initialize animation controller for typing dots
    _dotAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _dotAnimations = List.generate(3, (index) {
      return TweenSequence<double>([
        TweenSequenceItem(tween: Tween(begin: 0.3, end: 1.0), weight: 50),
        TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.3), weight: 50),
      ]).animate(CurvedAnimation(
        parent: _dotAnimationController,
        curve: Interval(index * 0.15, (index * 0.15) + 0.7, curve: Curves.easeInOut),
      ));
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _contextController.dispose();
    _scrollController.dispose();
    _dotAnimationController.dispose(); // Dispose animation controller
    super.dispose();
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    if (!_interviewStarted) return; // prevent manual send before start

    // Require context if not fixed and first message
    if (!_contextFixed && _isFirstMessage && _contextController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez saisir un contexte avant de commencer.'), backgroundColor: Colors.redAccent),
      );
      return;
    }

    final userMessage = _messageController.text;
    final contextText = _contextController.text.trim().isNotEmpty
        ? _contextController.text
        : "entretien général";

    // Haptic feedback for interaction
    HapticFeedback.lightImpact();

    setState(() {
      _isLoading = true;
      _dotAnimationController.repeat(); // Start dot animation
      _conversation.add({
        'role': 'user',
        'content': userMessage,
        'showTipButton': !_isFirstMessage, // Show tip button for user responses (except first)
        'tip': null, // Will be filled when tip is requested
      });
      _messageController.clear();
      if (!_isFirstMessage) {
        _questionCount++;
        _lastUserAnswer = userMessage; // Store user answer for tip generation
      }
    });

    _scrollToBottom();

    try {
      // Initial prompt generation if it's the first message
      final String promptToSend = _isFirstMessage
          ? "Commence une simulation d'entretien pour le poste de '$contextText'. Agis comme un recruteur et pose la première question pertinente."
          : userMessage;

      final response = await _apiService.simulateInterview(
        message: promptToSend,
        context: contextText, // Pass context for better AI responses
      );

      final aiResponse = response['response'] ?? 'Désolé, je n\'ai pas pu générer de réponse.';

      setState(() {
        _isLoading = false;
        _dotAnimationController.stop(); // Stop dot animation
        _conversation.add({
          'role': 'assistant',
          'content': aiResponse,
          'showTipButton': false,
        });
        _isFirstMessage = false; // Mark that the first message cycle is complete
        _lastAiQuestion = aiResponse; // Store AI question for tip generation
      });

      _scrollToBottom();
    } catch (e) {
      setState(() {
        _isLoading = false;
        _dotAnimationController.stop(); // Stop dot animation
        _conversation.add({
          'role': 'assistant',
          'content': 'Erreur: Impossible de contacter l\'assistant. Veuillez réessayer.',
          'showTipButton': false,
        });
      });

      if (mounted) {
        ScaffoldMessenger.of(this.context).showSnackBar(
          SnackBar(
            content: Text('Erreur API: ${e.toString()}'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating, // Floating snackbar
          ),
        );
      }
       _scrollToBottom();
    }
  }

  Future<void> _getTip(int messageIndex) async {
    if (_isLoadingTip) return;

    setState(() {
      _isLoadingTip = true;
    });

    try {
      final userMessage = _conversation[messageIndex];
      final userAnswer = userMessage['content'] as String;
      
      // Find the AI question that preceded this user answer
      String aiQuestion = '';
      for (int i = messageIndex - 1; i >= 0; i--) {
        if (_conversation[i]['role'] == 'assistant') {
          aiQuestion = _conversation[i]['content'] as String;
          break;
        }
      }

      final contextText = _contextController.text.trim().isNotEmpty
          ? _contextController.text
          : "entretien général";

      // Create a specific prompt for generating tips
      final tipPrompt = '''
Analyse cette réponse d'entretien et donne des conseils d'amélioration spécifiques et constructifs.

Contexte du poste: $contextText
Question posée: $aiQuestion
Réponse du candidat: $userAnswer

Donne 2-3 conseils concrets et pratiques pour améliorer cette réponse, en français. Sois bienveillant mais précis sur les points d'amélioration.
''';

      final response = await _apiService.simulateInterview(
        message: tipPrompt,
        context: "conseiller en recrutement expert",
      );

      final tip = response['response'] ?? 'Conseil non disponible pour le moment.';

      setState(() {
        _conversation[messageIndex]['tip'] = tip;
        _isLoadingTip = false;
      });

      HapticFeedback.lightImpact();
      _scrollToBottom();
      
    } catch (e) {
      setState(() {
        _conversation[messageIndex]['tip'] = 'Erreur lors de la génération du conseil. Veuillez réessayer.';
        _isLoadingTip = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la génération du conseil: ${e.toString()}'),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _resetSimulation() {
    setState(() {
      _conversation = [
        {
          'role': 'assistant',
          'content': 'Simulation réinitialisée. Indiquez le contexte et commencez quand vous êtes prêt.',
          'showTipButton': false,
        }
      ];
      _isFirstMessage = true;
      _questionCount = 0;
      _contextController.clear();
      _messageController.clear();
      _isLoading = false;
      _isLoadingTip = false;
      _lastAiQuestion = '';
      _lastUserAnswer = '';
      _dotAnimationController.stop(); // Stop animation on reset
      _interviewStarted = false;
    });
     HapticFeedback.mediumImpact();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients && _scrollController.position.maxScrollExtent > 0) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 400), // Slightly faster scroll
          curve: Curves.easeOutCubic, // Smoother curve
        );
      }
    });
  }

  // Trigger interview start with predefined message
  void _startInterview() {
    if (_isLoading || !_messageController.text.isEmpty) return;
    _messageController.text = 'je souhaite commencer l\'entretien';
    _interviewStarted = true;
    _sendMessage();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        // Background Gradient
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.blueGrey.shade50, Colors.white], // Softer gradient
            stops: const [0.0, 0.6],
          ),
        ),
        child: Column(
          children: [
            const Navbar(currentIndex: 1), // Ensure correct Navbar index for IA section
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16), // Adjusted padding
                child: Column(
                  children: [
                    // --- Header Banner ---
                    _buildHeaderBanner(),
                    const SizedBox(height: 12), // Reduced space

                    // --- Chat Area ---
                    Expanded(
                      child: Card(
                        elevation: 2, // Softer shadow
                        margin: EdgeInsets.zero,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20), // More rounded corners
                        ),
                        clipBehavior: Clip.antiAlias, // Clip content
                        child: Column(
                          children: [
                            // --- Messages List ---
                            Expanded(child: _buildMessagesList()),
                            _interviewStarted ? _buildInputArea() : _buildStartButtonArea(),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- Helper Widgets ---

  Widget _buildHeaderBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), // Adjusted padding
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.indigo.shade600, Colors.indigo.shade800], // Deeper indigo
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18), // Slightly more rounded
        boxShadow: [
          BoxShadow(
            color: Colors.indigo.withOpacity(0.25),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Back button
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
              const SizedBox(width: 4),
              // Icon background
              Container(
                padding: const EdgeInsets.all(8), // Smaller padding
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.model_training_outlined, color: Colors.indigo.shade700, size: 26), // Different icon
              ),
              const SizedBox(width: 10),
              // Title and Subtitle
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Simulation d'entretien",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 1),
                    Text(
                      "Préparez-vous avec l'IA", // Shorter subtitle
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
              // Question Counter & Reset Button
               if (_questionCount > 0)
                 Container(
                   padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                   decoration: BoxDecoration(
                     color: Colors.white.withOpacity(0.15),
                     borderRadius: BorderRadius.circular(10),
                   ),
                   child: Text(
                     "Q: $_questionCount",
                     style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12),
                   ),
                 ),
                 const SizedBox(width: 6), // Space between counter and reset
                 IconButton(
                   icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                   onPressed: _resetSimulation,
                   tooltip: 'Réinitialiser',
                   iconSize: 22, // Slightly smaller icon
                   padding: const EdgeInsets.all(4), // Reduced padding for denser layout
                   constraints: const BoxConstraints(), // Remove extra padding
                 )
            ],
          ),
          const SizedBox(height: 12),
          // Context Input Field & Start Button
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9), // Slightly more transparent
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                TextField(
                  controller: _contextController,
                  readOnly: _contextFixed,
                  enabled: !_contextFixed,
                  style: TextStyle(color: Colors.blueGrey.shade800, fontSize: 14), // Darker text
                  decoration: InputDecoration(
                    hintText: "Contexte (ex: Développeur Mobile)",
                    hintStyle: TextStyle(color: Colors.blueGrey.shade400, fontSize: 14),
                    prefixIcon: Icon(Icons.cases_outlined, color: Colors.indigo.shade400, size: 18), // Different icon
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10), // Adjusted padding
                    isDense: true,
                  ),
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessagesList() {
     return Container( // Add background color to message list area
        color: Colors.white,
        child: ListView.builder(
         controller: _scrollController,
         padding: const EdgeInsets.only(left:12, right: 12, top: 16, bottom: 8), // Consistent padding
         itemCount: _conversation.length + (_isLoading ? 1 : 0), // +1 for loading indicator
         itemBuilder: (context, index) {
           // --- Loading Indicator ---
           if (index == _conversation.length && _isLoading) {
             return _buildTypingIndicator();
           }
           // --- Message Bubble ---
           if (index < _conversation.length) {
            final item = _conversation[index];
            final isUser = item['role'] == 'user';
            return _buildMessageBubble(item, isUser);
           }
           return const SizedBox.shrink(); // Should not happen
         },
       ),
     );
  }

  Widget _buildTypingIndicator() {
     // More subtle typing indicator
     return Padding(
       padding: const EdgeInsets.symmetric(vertical: 12.0), // Adjusted padding
       child: Row(
         children: [
           CircleAvatar(
             backgroundColor: Colors.indigo.shade50,
             radius: 16, // Smaller avatar
             child: Icon(Icons.smart_toy_outlined, color: Colors.indigo.shade600, size: 18), // AI icon
           ),
           const SizedBox(width: 10),
           Container(
             padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8), // Smaller padding
             decoration: BoxDecoration(
               color: Colors.grey.shade200, // Lighter grey
               borderRadius: BorderRadius.circular(14),
             ),
             child: Row(
               mainAxisSize: MainAxisSize.min,
               children: List.generate(3, (i) => _buildAnimatedDot(i)), // Use List.generate
             ),
           ),
         ],
       ),
     );
  }

  // Simple animated dots for typing indicator
  Widget _buildAnimatedDot(int index) {
    return FadeTransition(
      opacity: _dotAnimations[index],
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 2.0), // Reduced margin
        width: 6, // Smaller dots
        height: 6,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.indigo.shade300,
        ),
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> item, bool isUser) {
    final messageIndex = _conversation.indexOf(item);
    final showTipButton = item['showTipButton'] == true;
    final tip = item['tip'] as String?;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          // Main message row
          Row(
            mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // AI Avatar
              if (!isUser)
                CircleAvatar(
                  backgroundColor: Colors.indigo.shade50,
                  radius: 16,
                  child: Icon(Icons.smart_toy_outlined, color: Colors.indigo.shade600, size: 18),
                ),
              if (!isUser) const SizedBox(width: 8),

              // Message Content Bubble
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isUser ? Colors.indigo.shade600 : Colors.grey.shade200,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(14),
                      topRight: const Radius.circular(14),
                      bottomLeft: Radius.circular(isUser ? 14 : 4),
                      bottomRight: Radius.circular(isUser ? 4 : 14),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      )
                    ]
                  ),
                  child: SelectableText(
                    item['content'] ?? '',
                    style: TextStyle(
                      fontSize: 14.5,
                      color: isUser ? Colors.white : Colors.black.withOpacity(0.85),
                      height: 1.35,
                    ),
                  ),
                ),
              ),

              // User Avatar
              if (isUser) const SizedBox(width: 8),
              if (isUser)
                 CircleAvatar(
                   backgroundColor: Colors.indigo.shade600,
                   radius: 16,
                  child: Icon(Icons.person_outline_rounded, color: Colors.white, size: 18),
                 ),
            ],
          ),

          // Tip button and tip display (only for user messages)
          if (showTipButton) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (tip == null) ...[
                  // Show tip button
                  Container(
                    margin: const EdgeInsets.only(right: 40), // Account for avatar space
                    child: Semantics(
  button: true,
  label: 'TODO: Replace with a meaningful label',
  child: ElevatedButton.icon(onPressed: _isLoadingTip ? null : () => _getTip(messageIndex), icon: _isLoadingTip ? SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.orange.shade600))) : Icon(Icons.lightbulb_outline, size: 16, color: Colors.orange.shade600), label: Text(_isLoadingTip ? "Génération..." : "Conseil", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.orange.shade600)), style: ElevatedButton.styleFrom(backgroundColor: Colors.orange.shade50, foregroundColor: Colors.orange.shade600, elevation: 1, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: Colors.orange.shade200, width: 1)), minimumSize: const Size(0, 32))),
),
                  ),
                ] else ...[
                  // Show tip content
                  Flexible(
                    child: Container(
                      margin: const EdgeInsets.only(right: 40), // Account for avatar space
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.orange.shade50,
                            Colors.orange.shade100,
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange.shade200, width: 1),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.orange.withOpacity(0.1),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.lightbulb,
                                size: 16,
                                color: Colors.orange.shade600,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                "Conseil d'amélioration",
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.orange.shade700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          SelectableText(
                            tip,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.orange.shade800,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    // Input area with slight elevation and border
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), // Compact padding
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey.shade300, width: 0.8)), // Thinner border
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end, // Align button properly with multi-line text
        children: [
          // Text Field
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade100, // Consistent light grey
                borderRadius: BorderRadius.circular(20), // More rounded
              ),
              child: TextField(
                controller: _messageController,
                style: TextStyle(fontSize: 15, color: Colors.blueGrey.shade900, height: 1.3),
                maxLines: 4, // Reduced max lines
                minLines: 1,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: "Votre réponse...",
                  hintStyle: TextStyle(color: Colors.blueGrey.shade400, fontSize: 15),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), // Adjusted padding
                  isDense: true,
                ),
                onSubmitted: _isLoading ? null : (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 6), // Reduced space
          // Send Button
          Container(
            margin: const EdgeInsets.only(bottom: 1), // Align button better
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _isLoading
                    ? [Colors.grey.shade400, Colors.grey.shade500] // Disabled gradient
                    : [Colors.indigo.shade500, Colors.indigo.shade700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: _isLoading
                  ? []
                  : [
                      BoxShadow(
                        color: Colors.indigo.withOpacity(0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
            ),
            child: IconButton(
              onPressed: _isLoading ? null : _sendMessage,
              icon: Icon(
                  _isLoading ? Icons.hourglass_bottom_rounded : Icons.send_rounded,
                  size: 20), // Smaller icon
              color: Colors.white,
              padding: const EdgeInsets.all(10), // Adjusted padding
              tooltip: 'Envoyer',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStartButtonArea() {
    return Container(
      padding: const EdgeInsets.all(24),
      color: Colors.white,
      child: Center(
        child: Semantics(
  button: true,
  label: 'TODO: Replace with a meaningful label',
  child: ElevatedButton.icon(onPressed: _startInterview, icon: const Icon(Icons.play_arrow, size: 32), label: const Text("Démarrer l'entretien", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(60), backgroundColor: Colors.indigo.shade600, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)))),
),
      ),
    );
  }
} 