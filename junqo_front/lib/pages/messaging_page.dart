import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:intl/intl.dart';
import '../shared/widgets/navbar.dart';
import '../shared/widgets/navbar_company.dart';
import '../core/messaging_service.dart';
import '../core/auth_service.dart';
import '../shared/dto/conversation_data.dart';

class MessagingPage extends StatefulWidget {
  final bool forCompany;
  const MessagingPage({super.key, this.forCompany = false});

  @override
  State<MessagingPage> createState() => _MessagingPageState();
}

class _MessagingPageState extends State<MessagingPage> {
  final MessagingService _messagingService = GetIt.instance<MessagingService>();
  final AuthService _authService = GetIt.instance<AuthService>();

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

      final messages =
          await _messagingService.getMessages(conversationId, limit: 100);

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
        _isSendingMessage) return;

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
    if (conversation.title != null && conversation.title!.isNotEmpty) {
      return conversation.title!;
    }

    // If no title, show participants (exclude current user)
    final otherParticipants = conversation.participantsIds
        .where((id) => id != _currentUserId)
        .toList();

    if (otherParticipants.isEmpty) {
      return 'Moi';
    } else if (otherParticipants.length == 1) {
      return 'Conversation'; // You could fetch user names here
    } else {
      return 'Conversation de groupe (${otherParticipants.length + 1})';
    }
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

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 1000;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          widget.forCompany
              ? const NavbarCompany(currentIndex: 3)
              : const Navbar(currentIndex: 3),
          Expanded(
            child: _buildContent(isMobile),
          ),
        ],
      ),
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
            Semantics(
              button: true,
              label: 'TODO: Replace with a meaningful label',
              child: ElevatedButton(
                  onPressed: _initializeData, child: const Text('Réessayer')),
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
          width: 350,
          child: _buildConversationsList(false),
        ),
        const VerticalDivider(width: 1),
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
      color: Colors.grey.shade50,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                if (isMobile && _selectedConversation != null)
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () {
                      setState(() {
                        _selectedConversation = null;
                      });
                    },
                  ),
                const Icon(Icons.message, color: Color(0xFF2563EB)),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Messages',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed:
                      _isLoadingConversations ? null : _loadConversations,
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoadingConversations
                ? const Center(child: CircularProgressIndicator())
                : _conversations.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 64,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Aucune conversation',
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'Les conversations apparaîtront quand\nvos candidatures seront acceptées',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: _conversations.length,
                        itemBuilder: (context, index) {
                          final conversation = _conversations[index];
                          final isSelected =
                              _selectedConversation?.id == conversation.id;

                          return Container(
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? Colors.blue.shade50
                                  : Colors.transparent,
                              border: Border(
                                left: BorderSide(
                                  color: isSelected
                                      ? const Color(0xFF2563EB)
                                      : Colors.transparent,
                                  width: 3,
                                ),
                              ),
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Colors.blue.shade100,
                                child: Icon(
                                  Icons.person,
                                  color: Colors.blue.shade700,
                                ),
                              ),
                              title: Text(
                                _getConversationTitle(conversation),
                                style: TextStyle(
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.w500,
                                  color: Colors.black87,
                                  fontSize: 15,
                                ),
                              ),
                              subtitle: conversation.lastMessage != null
                                  ? Text(
                                      conversation.lastMessage!.content,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: Colors.grey.shade600,
                                      ),
                                    )
                                  : const Text(
                                      'Nouvelle conversation',
                                      style: TextStyle(
                                        color: Colors.grey,
                                      ),
                                    ),
                              trailing: conversation.lastMessage?.createdAt !=
                                      null
                                  ? Text(
                                      _formatMessageTime(
                                          conversation.lastMessage!.createdAt),
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey.shade500,
                                      ),
                                    )
                                  : null,
                              onTap: () => _selectConversation(conversation),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      color: Colors.grey.shade50,
      child: const Center(
        child: Column(
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
              'Choisissez une conversation pour commencer à échanger',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChatView(bool isMobile) {
    return Column(
      children: [
        // Chat header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
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
                backgroundColor: Colors.blue.shade100,
                child: Icon(
                  Icons.person,
                  color: Colors.blue.shade700,
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
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      '${_selectedConversation!.participantsIds.length} participant(s)',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _isLoadingMessages
                    ? null
                    : () => _loadMessages(_selectedConversation!.id),
              ),
            ],
          ),
        ),

        // Messages area
        Expanded(
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
                        final isCurrentUser =
                            message.senderId == _currentUserId;
                        final showTime = index == _messages.length - 1 ||
                            _messages[index + 1].senderId != message.senderId;

                        return _buildMessageBubble(
                            message, isCurrentUser, showTime);
                      },
                    ),
        ),

        // Message input area
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 4,
                offset: const Offset(0, -2),
              ),
            ],
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
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFF2563EB),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: _isSendingMessage
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Icon(Icons.send, color: Colors.white),
                  onPressed: _isSendingMessage ? null : _sendMessage,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMessageBubble(
      MessageData message, bool isCurrentUser, bool showTime) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment:
            isCurrentUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isCurrentUser) const SizedBox(width: 40),
          Flexible(
            child: Column(
              crossAxisAlignment: isCurrentUser
                  ? CrossAxisAlignment.end
                  : CrossAxisAlignment.start,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isCurrentUser
                        ? const Color(0xFF2563EB)
                        : Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(18).copyWith(
                      bottomRight:
                          isCurrentUser ? const Radius.circular(4) : null,
                      bottomLeft:
                          !isCurrentUser ? const Radius.circular(4) : null,
                    ),
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
