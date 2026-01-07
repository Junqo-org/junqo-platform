import 'package:flutter/material.dart';
import '../shared/widgets/navbar.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';

class Interview extends StatefulWidget {
  const Interview({super.key});

  @override
  InterviewState createState() => InterviewState();
}

class InterviewState extends State<Interview> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, String>> _messages = [];
  final FocusNode _focusNode = FocusNode();
  bool _isInterviewStarted = false;
  bool _isLoading = false;
  int _questionCount = 0;
  final int _maxQuestions = 5;
  late final ApiService _apiService;

  @override
  void initState() {
    super.initState();
    _apiService = GetIt.instance<ApiService>();
  }

  Future<void> _startInterview() async {
    setState(() {
      _isInterviewStarted = true;
      _isLoading = true;
      _messages.add({
        "sender": "ai",
        "text": "Bonjour ! L'entretien va commencer. Je vais vous poser une série de questions professionnelles. Répondez-y du mieux que vous pouvez."
      });
    });

    // Poser la première question automatiquement
    await _askNextInterviewQuestion();
  }

  Future<void> _askNextInterviewQuestion() async {
    if (_questionCount >= _maxQuestions) {
      setState(() {
        _messages.add({
          "sender": "ai",
          "text": "L'entretien est maintenant terminé. Merci pour votre participation. J'espère que cet exercice vous a été utile pour préparer vos futurs entretiens."
        });
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final String prompt = _questionCount == 0 
          ? "Pose une première question d'entretien d'embauche pertinente et professionnelle."
          : "Pose une nouvelle question d'entretien d'embauche pertinente et différente des précédentes, en tenant compte de la conversation jusqu'à présent.";

      final response = await _apiService.simulateInterview(
        message: prompt,
        context: "recruteur professionnel",
      );

      if (mounted) {
        setState(() {
          _questionCount++;
          _messages.add({
            "sender": "ai",
            "text": response['response'] ?? "Pouvez-vous me parler de votre expérience professionnelle ?"
          });
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({
            "sender": "ai",
            "text": "Pouvez-vous me parler de votre parcours professionnel et de vos compétences clés ?"
          });
          _questionCount++;
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.isNotEmpty) {
      final userMessage = _messageController.text;
      setState(() {
        _messages.add({"sender": "user", "text": userMessage});
        _messageController.clear();
        _isLoading = true;
      });
      _focusNode.requestFocus(); // Redonne le focus au champ de texte

      // Attendre un peu pour simuler le temps de réflexion de l'IA
      await Future.delayed(const Duration(seconds: 1));

      // Poser la question suivante
      await _askNextInterviewQuestion();
    }
  }

  void _showRemarkPopup() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Remarque"),
          content: const Text(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam consectetur orci sed nulla facilisis consequat. Curabitur vel lorem sit amet nulla ullamcorper fermentum.",
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text("Fermer"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Navbar en haut avec l'index 1 pour IA
          const Navbar(currentIndex: 1),

          // Contenu principal
          Expanded(
            child: _isInterviewStarted
                ? _buildInterviewChat()
                : _buildStartInterviewScreen(),
          ),
        ],
      ),
    );
  }

  Widget _buildStartInterviewScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            "assets/images/interview.png",
            width: 220,
          ),
          const SizedBox(height: 24),
          const Text(
            "Entraînez-vous aux entretiens d'embauche",
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              "Notre IA vous accompagne pour améliorer vos compétences en entretien. L'IA vous posera 5 questions professionnelles pour simuler un véritable entretien d'embauche.",
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _startInterview,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              elevation: 5,
              shadowColor: Colors.blueAccent,
            ),
            child: const Text(
              "Commencer l'entretien",
              style: TextStyle(fontSize: 18, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInterviewChat() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Compteur de questions
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              "Question $_questionCount sur $_maxQuestions",
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
          ),
          
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isLoading) {
                  // Afficher un indicateur de chargement
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(
                      child: CircularProgressIndicator(),
                    ),
                  );
                }
                
                final message = _messages[index];
                final isUserMessage = message["sender"] == "user";

                return Column(
                  crossAxisAlignment: isUserMessage
                      ? CrossAxisAlignment.end
                      : CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: isUserMessage
                          ? MainAxisAlignment.end
                          : MainAxisAlignment.start,
                      children: [
                        if (!isUserMessage)
                          const CircleAvatar(
                            backgroundImage:
                                AssetImage("assets/images/ai_avatar.png"),
                            radius: 24,
                          ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isUserMessage
                                  ? Colors.blue
                                  : Colors.grey[200],
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              message["text"]!,
                              style: TextStyle(
                                fontSize: 16,
                                color:
                                    isUserMessage ? Colors.white : Colors.black,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (isUserMessage)
                          const CircleAvatar(
                            backgroundImage: AssetImage(
                                "assets/images/profile_placeholder.jpg"),
                            radius: 24,
                          ),
                      ],
                    ),
                    const SizedBox(height: 8), // Ajout d'une marge
                    if (isUserMessage)
                      Padding(
                        padding: const EdgeInsets.only(top: 8, right: 56),
                        child: ElevatedButton(
                          onPressed: _showRemarkPopup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey[300],
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 2,
                          ),
                          child: const Text(
                            "Afficher la remarque",
                            style: TextStyle(color: Colors.black, fontSize: 14),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    focusNode: _focusNode, // Ajout du FocusNode
                    decoration: const InputDecoration(
                      hintText: "Tapez votre réponse...",
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                    onSubmitted: (value) => _sendMessage(), // Envoi sur Entrée
                    enabled: _questionCount < _maxQuestions && !_isLoading,
                  ),
                ),
                IconButton(
                  onPressed: _isLoading || _questionCount >= _maxQuestions ? null : _sendMessage,
                  icon: Icon(
                    Icons.send, 
                    color: _isLoading || _questionCount >= _maxQuestions ? Colors.grey : Colors.blue
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
