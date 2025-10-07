import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:intl/intl.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../shared/widgets/navbar.dart';
import '../shared/widgets/navbar_company.dart';
import '../core/messaging_service.dart';
import '../core/auth_service.dart';
import '../core/api/api_service.dart';
import '../shared/dto/conversation_data.dart';
import '../shared/dto/student_profile.dart';
import '../shared/dto/company_profile.dart';
import '../shared/dto/offer_data.dart';

class MessagingPage extends StatefulWidget {
  final bool forCompany;
  const MessagingPage({super.key, this.forCompany = false});

  @override
  State<MessagingPage> createState() => _MessagingPageState();
}

class _MessagingPageState extends State<MessagingPage> {
  final MessagingService _messagingService = GetIt.instance<MessagingService>();
  final AuthService _authService = GetIt.instance<AuthService>();
  final ApiService _apiService = GetIt.instance<ApiService>();
  
  List<ConversationData> _conversations = [];
  ConversationData? _selectedConversation;
  List<MessageData> _messages = [];
  bool _isLoadingConversations = true;
  bool _isLoadingMessages = false;
  bool _isSendingMessage = false;
  String? _currentUserId;
  String _errorMessage = '';
  
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _messagesScrollController = ScrollController();

  final Map<String,String> _nameCache = {};

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _messagesScrollController.dispose();
    super.dispose();
  }

  Future<void> _initializeData() async {
    try {
      _currentUserId = _authService.userId;
      if (_currentUserId == null) {
        setState(() {
          _errorMessage = 'Utilisateur non connecté';
          _isLoadingConversations = false;
        });
        return;
      }
      await _loadConversations();
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors du chargement: $e';
        _isLoadingConversations = false;
      });
    }
  }

  Future<void> _loadConversations() async {
    try {
      setState(() {
        _isLoadingConversations = true;
        _errorMessage = '';
      });
      
      final conversations = await _messagingService.getConversations(
        // Ne transmet plus participantId afin de récupérer toutes les conversations 
        // où l'utilisateur courant est déjà participant (le backend filtre automatiquement)
        limit: 50,
      );
      
      setState(() {
        _conversations = conversations;
        _isLoadingConversations = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors du chargement des conversations: $e';
        _isLoadingConversations = false;
      });
    }
  }

  Future<void> _loadMessages(String conversationId) async {
    try {
      setState(() {
        _isLoadingMessages = true;
        _errorMessage = '';
      });
      
      final messages = await _messagingService.getMessages(conversationId, limit: 100);
      
      setState(() {
        _messages = messages.reversed.toList(); // Show newest at bottom
        _isLoadingMessages = false;
      });
      
      // Scroll to bottom to show latest messages
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_messagesScrollController.hasClients) {
          _messagesScrollController.animateTo(
            _messagesScrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors du chargement des messages: $e';
        _isLoadingMessages = false;
      });
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty || 
        _selectedConversation == null || 
        _currentUserId == null ||
        _isSendingMessage) {
      return;
    }

    final messageContent = _messageController.text.trim();
    _messageController.clear();

    try {
      setState(() {
        _isSendingMessage = true;
      });

      final newMessage = await _messagingService.sendMessage(
        _selectedConversation!.id,
        messageContent,
        _currentUserId!,
      );

      setState(() {
        _messages.add(newMessage);
        _isSendingMessage = false;
      });

      // Scroll to bottom after sending
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_messagesScrollController.hasClients) {
          _messagesScrollController.animateTo(
            _messagesScrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });

      // Refresh conversations to update last message
      await _loadConversations();
    } catch (e) {
      setState(() {
        _errorMessage = 'Erreur lors de l\'envoi du message: $e';
        _isSendingMessage = false;
      });
      
      // Restore message content if sending failed
      _messageController.text = messageContent;
    }
  }

  void _selectConversation(ConversationData conversation) {
    setState(() {
      _selectedConversation = conversation;
      _messages = [];
    });
    _loadMessages(conversation.id);
  }

  String _getConversationTitle(ConversationData conversation) {
    // Determine participant-based title first
    final otherParticipants = conversation.participantsIds
        .where((id) => id != _currentUserId)
        .toList();
    
    if (otherParticipants.isEmpty) {
      return 'Moi';
    }

    if (otherParticipants.length == 1) {
      final otherId = otherParticipants.first;
      if (_nameCache.containsKey(otherId)) return _nameCache[otherId]!;

      // Attempt to fetch name asynchronously
      _fetchParticipantName(otherId);
      return conversation.title != null && conversation.title!.isNotEmpty
          ? conversation.title!
          : 'Conversation';
    }

    if (conversation.title != null && conversation.title!.isNotEmpty) {
      return conversation.title!;
    }

    return 'Conversation de groupe (${otherParticipants.length + 1})';
  }

  Future<void> _fetchParticipantName(String userId) async {
    try {
      // Heuristic: if current user is student then other is company and vice-versa
      // We'll attempt company then student profiles until one succeeds
      String name;
      try {
        final company = await _apiService.getCompanyProfileById(userId);
        name = company.name;
      } catch (_) {
        final student = await _apiService.getStudentProfileById(userId);
        name = student.name;
      }
      if (name.isNotEmpty) {
        _nameCache[userId] = name;
        if (mounted) setState(() {});
      }
    } catch (_) {}
  }

  String _formatMessageTime(DateTime? dateTime) {
    if (dateTime == null) return '';
    
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays == 0) {
      return DateFormat('HH:mm').format(dateTime);
    } else if (difference.inDays == 1) {
      return 'Hier ${DateFormat('HH:mm').format(dateTime)}';
    } else if (difference.inDays < 7) {
      return DateFormat('EEEE HH:mm', 'fr_FR').format(dateTime);
    } else {
      return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
    }
  }

  Future<void> _showInterlocutorProfile() async {
    if (_selectedConversation == null) return;

    final otherParticipants = _selectedConversation!.participantsIds
        .where((id) => id != _currentUserId)
        .toList();
    if (otherParticipants.isEmpty) return;

    if (otherParticipants.length > 1) {
      _showMultipleParticipantsDialog(otherParticipants);
      return;
    }

    final otherUserId = otherParticipants.first;

    OfferData? acceptedOffer;
    try {
      final applications = await _apiService.getMyApplications();
      for (final app in applications) {
        if (app.status != 'ACCEPTED') continue;
        if (widget.forCompany) {
          // Current user is company, other is student
          if (app.studentId == otherUserId) {
            acceptedOffer = await _apiService.getOfferById(app.offerId);
            break;
          }
        } else {
          // Current user is student, other is company
          if (app.companyId == otherUserId) {
            acceptedOffer = await _apiService.getOfferById(app.offerId);
            break;
          }
        }
      }
    } catch (_) {}

    try {
      // Attempt to load profile (company or student) then show dialog including offer
      try {
        final companyProfile = await _apiService.getCompanyProfileById(otherUserId);
        if (mounted) {
          _showCompanyProfileDialog(companyProfile, acceptedOffer);
        }
        return;
      } catch (_) {
        final studentProfile = await _apiService.getStudentProfileById(otherUserId);
        if (mounted) {
          _showStudentProfileDialog(studentProfile, acceptedOffer);
        }
        return;
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du chargement du profil: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showMultipleParticipantsDialog(List<String> participantIds) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Participants de la conversation'),
          content: const Text('Cette conversation contient plusieurs participants. Fonctionnalité à venir.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Fermer'),
            ),
          ],
        );
      },
    );
  }

  void _showStudentProfileDialog(StudentProfile profile, OfferData? offer) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: FractionallySizedBox(
              widthFactor: 0.9,
              heightFactor: 0.85,
              child: Container(
                color: Colors.white,
                child: Column(
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.person,
                            color: Colors.white,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Profil Étudiant',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                    ),
                    // Content
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildStudentProfileContent(profile),
                            if (offer != null) ...[
                              const SizedBox(height: 32),
                              _buildOfferSection(offer),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showCompanyProfileDialog(CompanyProfile profile, OfferData? offer) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: FractionallySizedBox(
              widthFactor: 0.9,
              heightFactor: 0.85,
              child: Container(
                color: Colors.white,
                child: Column(
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                        ),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.business,
                            color: Colors.white,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Profil Entreprise',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildCompanyProfileContent(profile),
                            if (offer != null) ...[
                              const SizedBox(height: 32),
                              _buildOfferSection(offer),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStudentProfileContent(StudentProfile profile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Profile header
        Row(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF6366F1),
                    Color(0xFF8B5CF6),
                  ],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366F1).withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  (profile.name ?? 'U')[0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.name ?? 'Nom non disponible',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (profile.schoolName != null && profile.schoolName!.isNotEmpty)
                    Text(
                      profile.schoolName!,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Color(0xFF6366F1),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        
        // Skills
        if (profile.skills?.isNotEmpty == true) ...[
          const Text(
            "Compétences",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: profile.skills!.map((skill) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  skill,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
        
        // Description if available
        if (profile.description != null && profile.description!.isNotEmpty) ...[
          const SizedBox(height: 24),
          const Text(
            "Description",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFFE2E8F0),
                width: 1,
              ),
            ),
            child: Text(
              profile.description!,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
                height: 1.5,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildCompanyProfileContent(CompanyProfile profile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Profile header
        Row(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF6366F1),
                    Color(0xFF8B5CF6),
                  ],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366F1).withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  (profile.name ?? 'C')[0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile.name ?? 'Nom non disponible',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    "Entreprise",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6366F1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        
        // Website
        if (profile.websiteUrl != null && profile.websiteUrl!.isNotEmpty) ...[
          const Text(
            "Site web",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFFE2E8F0),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.link,
                  color: Color(0xFF6366F1),
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    profile.websiteUrl!,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF6366F1),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
        
        // Description
        if (profile.description != null && profile.description!.isNotEmpty) ...[
          const Text(
            "Description",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: const Color(0xFFE2E8F0),
                width: 1,
              ),
            ),
            child: Text(
              profile.description!,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
                height: 1.5,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildOfferSection(OfferData offer) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Offre associée',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 16),
        _buildMiniOfferCard(offer),
      ],
    );
  }

  Widget _buildMiniOfferCard(OfferData offer) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFFEEF2FF),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(14),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.business_center_outlined, color: Color(0xFF6366F1), size: 24),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        offer.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          _buildTag(offer.offerType, isOfferType: true),
                          if (offer.workLocationType.isNotEmpty) _buildTag(offer.workLocationType),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (offer.description.isNotEmpty) ...[
                  const Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    offer.description,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF334155)),
                  ),
                  const SizedBox(height: 12),
                ],
                if (offer.skills.isNotEmpty) ...[
                  const Text(
                    'Compétences',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: offer.skills.map((s) => _buildTag(s)).toList(),
                  ),
                  const SizedBox(height: 12),
                ],
                Row(
                  children: [
                    if (offer.duration.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                            icon: Icons.access_time,
                            label: 'Durée',
                            value: offer.duration)),
                    if (offer.salary.isNotEmpty)
                      Expanded(
                          child: _buildInfoItem(
                              icon: Icons.euro,
                              label: 'Salaire',
                              value: offer.salary)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String text, {bool isOfferType = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isOfferType ? const Color(0xFF6366F1) : const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: isOfferType ? Colors.white : const Color(0xFF475569),
        ),
      ),
    );
  }

  Widget _buildInfoItem({required IconData icon, required String label, required String value}) {
    return Row(
      children: [
        Icon(icon, size: 14, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
        ),
        Flexible(
          child: Text(
            value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF334155)),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 1000;
    
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          widget.forCompany
              ? const NavbarCompany(currentIndex: 3)
              : const Navbar(currentIndex: 3),
          Expanded(
            child: _buildContent(isMobile),
          ),
        ],
      ).animate().fadeIn(duration: 300.ms),
    );
  }

  Widget _buildContent(bool isMobile) {
    if (_errorMessage.isNotEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red.shade400),
            const SizedBox(height: 16),
            Text(
              _errorMessage,
              style: TextStyle(
                fontSize: 16,
                color: Colors.red.shade700,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _initializeData,
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    }

    if (isMobile) {
      return _buildMobileLayout();
    } else {
      return _buildDesktopLayout();
    }
  }

  Widget _buildMobileLayout() {
    if (_selectedConversation == null) {
      return _buildConversationsList(true);
    } else {
      return _buildChatView(true);
    }
  }

  Widget _buildDesktopLayout() {
    return Row(
      children: [
        SizedBox(
          width: 380,
          child: _buildConversationsList(false),
        ),
        const VerticalDivider(width: 1, color: Color(0xFFE2E8F0)),
        Expanded(
          child: _selectedConversation == null
              ? _buildEmptyState()
              : _buildChatView(false),
        ),
      ],
    );
  }

  Widget _buildConversationsList(bool isMobile) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildConversationsHeader(),
          Expanded(
            child: _isLoadingConversations
                ? _buildLoadingIndicator()
                : _conversations.isEmpty
                    ? _buildEmptyConversationsList()
                    : RefreshIndicator(
                        onRefresh: _loadConversations,
                        color: const Color(0xFF6366F1),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _conversations.length,
                          itemBuilder: (context, index) {
                            final conversation = _conversations[index];
                            return _buildConversationCard(conversation)
                                .animate()
                                .fadeIn(delay: (100 * index).ms, duration: 400.ms)
                                .slideY(begin: 0.2, end: 0);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildConversationsHeader() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.chat_bubble_outline_rounded,
                  color: Color(0xFF6366F1),
                  size: 28,
                ),
              ).animate().scale(delay: 100.ms, duration: 400.ms, curve: Curves.elasticOut),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Conversations",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      "Retrouvez toutes vos discussions",
                      style: TextStyle(
                        fontSize: 16,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildConversationCard(ConversationData conversation) {
    final isSelected = _selectedConversation?.id == conversation.id;
    return InkWell(
      onTap: () => _selectConversation(conversation),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEEF2FF) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFFC7D2FE) : const Color(0xFFE2E8F0),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6366F1).withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: const Color(0xFF6366F1).withOpacity(0.1),
              child: Text(
                _getConversationTitle(conversation).isNotEmpty
                    ? _getConversationTitle(conversation)[0].toUpperCase()
                    : '?',
                style: const TextStyle(
                  fontSize: 20,
                  color: Color(0xFF4338CA),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getConversationTitle(conversation),
                    style: TextStyle(
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      color: const Color(0xFF1E293B),
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    conversation.lastMessage?.content ?? 'Nouvelle conversation',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
            if (conversation.lastMessage?.createdAt != null)
              Text(
                _formatMessageTime(conversation.lastMessage!.createdAt),
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyConversationsList() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.message_outlined,
              color: Color(0xFF94A3B8),
              size: 64,
            ).animate().scale(delay: 100.ms, duration: 500.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            const Text(
              "Aucune conversation pour le moment",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF334155),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Les discussions apparaissent ici une fois qu'une candidature est acceptée.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 500.ms);
  }

  Widget _buildLoadingIndicator() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            color: Color(0xFF6366F1),
          ).animate(onPlay: (controller) => controller.repeat()).rotate(duration: 1.seconds),
          const SizedBox(height: 16),
          const Text(
            "Chargement des conversations...",
            style: TextStyle(
              color: Color(0xFF64748B),
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      color: const Color(0xFFF8FAFC),
      child: Center(
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'Sélectionnez une conversation',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Choisissez une conversation dans la liste pour commencer à échanger.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.9, 0.9)),
      ),
    );
  }

  Widget _buildChatView(bool isMobile) {
    return Column(
      children: [
        // Chat header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
          ),
          child: Row(
            children: [
              if (isMobile)
                IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () {
                    setState(() {
                      _selectedConversation = null;
                    });
                  },
                ),
              CircleAvatar(
                backgroundColor: const Color(0xFF6366F1).withOpacity(0.1),
                child: Text(
                  _getConversationTitle(_selectedConversation!).isNotEmpty
                      ? _getConversationTitle(_selectedConversation!)[0].toUpperCase()
                      : '?',
                  style: const TextStyle(
                    color: Color(0xFF4338CA),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _getConversationTitle(_selectedConversation!),
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'En ligne', // Placeholder, can be dynamic
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.green.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.info_outline_rounded, color: Color(0xFF64748B)),
                onPressed: _showInterlocutorProfile,
                tooltip: 'Voir le profil',
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: Color(0xFF64748B)),
                onPressed: _isLoadingMessages ? null : () => _loadMessages(_selectedConversation!.id),
                tooltip: 'Rafraîchir',
              ),
            ],
          ),
        ),
        
        // Messages area
        Expanded(
          child: Container(
            color: const Color(0xFFF8FAFC),
            child: _isLoadingMessages
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 48,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Aucun message',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Envoyez votre premier message!',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _messagesScrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          final isCurrentUser = message.senderId == _currentUserId;
                          final showTime = index == _messages.length - 1 ||
                              _messages[index + 1].senderId != message.senderId;
                          
                          return _buildMessageBubble(message, isCurrentUser, showTime);
                        },
                      ),
          ),
        ),
        
        // Message input area
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Colors.grey.shade200)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(
                    color: Colors.black87,
                    fontSize: 16,
                  ),
                  decoration: InputDecoration(
                    hintText: 'Tapez votre message...',
                    hintStyle: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(24),
                      borderSide: const BorderSide(color: Color(0xFF2563EB)),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  maxLines: null,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 12),
              SizedBox(
                height: 48,
                width: 48,
                child: FloatingActionButton(
                  onPressed: _isSendingMessage ? null : _sendMessage,
                  backgroundColor: const Color(0xFF6366F1),
                  elevation: 0,
                  child: _isSendingMessage
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Icon(Icons.send_rounded, color: Colors.white, size: 24),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMessageBubble(MessageData message, bool isCurrentUser, bool showTime) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isCurrentUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isCurrentUser) const SizedBox(width: 40),
          Flexible(
            child: Column(
              crossAxisAlignment: isCurrentUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isCurrentUser ? const Color(0xFF6366F1) : Colors.white,
                    borderRadius: BorderRadius.circular(20).copyWith(
                      bottomRight: isCurrentUser ? const Radius.circular(6) : const Radius.circular(20),
                      bottomLeft: !isCurrentUser ? const Radius.circular(6) : const Radius.circular(20),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    message.content,
                    style: TextStyle(
                      color: isCurrentUser ? Colors.white : Colors.black87,
                      fontSize: 14,
                    ),
                  ),
                ),
                if (showTime && message.createdAt != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      _formatMessageTime(message.createdAt),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (isCurrentUser) const SizedBox(width: 40),
        ],
      ),
    );
  }
}
