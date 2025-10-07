import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get_it/get_it.dart';
import '../shared/widgets/navbar_company.dart';
import '../core/api/api_service.dart';
import '../core/auth_service.dart';
import '../core/messaging_service.dart';
import '../shared/dto/offer_data.dart';
import '../shared/dto/application_data.dart';
import '../shared/dto/conversation_data.dart';
import 'offer_creation.dart';
import 'offer_detail.dart';
import 'messaging_page.dart';
import '../core/client.dart';

class RecruiterDashboard extends StatefulWidget {
  const RecruiterDashboard({super.key});

  @override
  RecruiterDashboardState createState() => RecruiterDashboardState();
}

class RecruiterDashboardState extends State<RecruiterDashboard> {
  final ApiService _apiService = GetIt.instance<ApiService>();
  final AuthService _authService = GetIt.instance<AuthService>();
  final MessagingService _messagingService = GetIt.instance<MessagingService>();

  List<OfferData> _myOffers = [];
  List<ApplicationData> _recentApplications = [];
  List<ConversationData> _recentConversations = [];
  
  bool _isLoadingStats = true;
  bool _isLoadingOffers = true;
  bool _isLoadingApplications = true;
  bool _isLoadingConversations = true;
  
  // Stats
  int _totalOffers = 0;
  int _totalApplications = 0;
  int _pendingApplications = 0;
  int _acceptedApplications = 0;
  int _activeConversations = 0;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    await Future.wait([
      _loadMyOffers(),
      _loadRecentApplications(),
      _loadRecentConversations(),
    ]);
  }

  Future<void> _loadMyOffers() async {
    try {
      final offers = await _apiService.getMyOffers();
      if (mounted) {
        setState(() {
          _myOffers = offers;
          _totalOffers = offers.length;
          _isLoadingOffers = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingOffers = false;
        });
      }
    }
  }

  Future<void> _loadRecentApplications() async {
    try {
      final applications = await _apiService.getMyApplications();
      if (mounted) {
        setState(() {
          _recentApplications = applications.take(5).toList(); // 5 plus récentes
          _totalApplications = applications.length;
          _pendingApplications = applications.where((app) => app.status == 'PENDING' || app.status == 'NOT_OPENED').length;
          _acceptedApplications = applications.where((app) => app.status == 'ACCEPTED').length;
          _isLoadingApplications = false;
          _isLoadingStats = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingApplications = false;
          _isLoadingStats = false;
        });
      }
    }
  }

  Future<void> _loadRecentConversations() async {
    try {
      final conversations = await _messagingService.getConversations(limit: 5);
      if (mounted) {
        setState(() {
          _recentConversations = conversations;
          _activeConversations = conversations.length;
          _isLoadingConversations = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingConversations = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50
      body: Column(
        children: [
          const NavbarCompany(currentIndex: 0),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader()
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .slideX(begin: -0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 32),
                  _buildStatsCards()
                      .animate()
                      .fadeIn(delay: 200.ms, duration: 500.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 32),
                  _buildQuickActions()
                      .animate()
                      .fadeIn(delay: 300.ms, duration: 500.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 32),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 2,
                        child: Column(
                          children: [
                            _buildRecentApplications()
                                .animate()
                                .fadeIn(delay: 400.ms, duration: 500.ms)
                                .slideX(begin: -0.1, end: 0, curve: Curves.easeOut),
                            const SizedBox(height: 24),
                            _buildActiveOffers()
                                .animate()
                                .fadeIn(delay: 500.ms, duration: 500.ms)
                                .slideX(begin: -0.1, end: 0, curve: Curves.easeOut),
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      Expanded(
                        flex: 1,
                        child: _buildRecentMessages()
                            .animate()
                            .fadeIn(delay: 600.ms, duration: 500.ms)
                            .slideX(begin: 0.1, end: 0, curve: Curves.easeOut),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Tableau de bord",
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Colors.black87, // Noir pour meilleure visibilité
          ),
        ),
        const SizedBox(height: 8),
        Text(
          "Bonjour ! Voici un aperçu de votre activité de recrutement",
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsCards() {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            title: "Offres actives",
            value: _isLoadingStats ? "..." : _totalOffers.toString(),
            icon: Icons.work_outline,
            color: const Color(0xFF3B82F6), // Blue
            isLoading: _isLoadingStats,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            title: "Candidatures",
            value: _isLoadingStats ? "..." : _totalApplications.toString(),
            icon: Icons.people_outline,
            color: const Color(0xFF10B981), // Green
            isLoading: _isLoadingStats,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            title: "En attente",
            value: _isLoadingStats ? "..." : _pendingApplications.toString(),
            icon: Icons.hourglass_empty,
            color: const Color(0xFFF59E0B), // Amber
            isLoading: _isLoadingStats,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildStatCard(
            title: "Conversations",
            value: _isLoadingStats ? "..." : _activeConversations.toString(),
            icon: Icons.chat_bubble_outline,
            color: const Color(0xFF8B5CF6), // Purple
            isLoading: _isLoadingStats,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required bool isLoading,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 24,
                ),
              ),
              if (isLoading)
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(color),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.black87, // Noir pour meilleure visibilité
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
          const Text(
            "Actions rapides",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  title: "Créer une offre",
                  icon: Icons.add_business,
                  color: const Color(0xFF3B82F6),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => JobOfferForm(
                          client: GetIt.instance<RestClient>(),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  title: "Voir candidatures",
                  icon: Icons.assignment,
                  color: const Color(0xFF10B981),
                  onTap: () {
                    // Navigate to applications page
                    // Navigator.pushNamed(context, '/applications');
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionButton(
                  title: "Messages",
                  icon: Icons.message,
                  color: const Color(0xFF8B5CF6),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const MessagingPage(forCompany: true),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color.withOpacity(0.2),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentApplications() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Candidatures récentes",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              if (_isLoadingApplications)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (_isLoadingApplications)
            const Center(child: CircularProgressIndicator())
          else if (_recentApplications.isEmpty)
            const Center(
              child: Column(
                children: [
                  SizedBox(height: 32),
                  Icon(
                    Icons.assignment_outlined,
                    size: 48,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    "Aucune candidature pour le moment",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 32),
                ],
              ),
            )
          else
            Column(
              children: _recentApplications.map((application) {
                return _buildApplicationItem(application);
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildApplicationItem(ApplicationData application) {
    Color statusColor;
    String statusText;
    
    switch (application.status) {
      case 'NOT_OPENED':
        statusColor = Colors.grey;
        statusText = 'Non ouvert';
        break;
      case 'PENDING':
        statusColor = Colors.orange;
        statusText = 'En attente';
        break;
      case 'ACCEPTED':
        statusColor = Colors.green;
        statusText = 'Accepté';
        break;
      case 'DENIED':
        statusColor = Colors.red;
        statusText = 'Refusé';
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'Inconnu';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1,
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.blue.shade100,
            child: Icon(
              Icons.person,
              color: Colors.blue.shade700,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  application.studentName ?? 'Candidat',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  application.studentEmail ?? '',
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              statusText,
              style: TextStyle(
                color: statusColor,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveOffers() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Mes offres actives",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              if (_isLoadingOffers)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (_isLoadingOffers)
            const Center(child: CircularProgressIndicator())
          else if (_myOffers.isEmpty)
            const Center(
              child: Column(
                children: [
                  SizedBox(height: 32),
                  Icon(
                    Icons.work_outline,
                    size: 48,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    "Aucune offre active",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 32),
                ],
              ),
            )
          else
            Column(
              children: _myOffers.take(3).map((offer) {
                return _buildOfferItem(offer);
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildOfferItem(OfferData offer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => OfferDetail(offer: offer),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.grey.shade200,
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.work_outline,
                  color: Colors.blue.shade700,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      offer.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      offer.offerType,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                color: Colors.grey.shade400,
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRecentMessages() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Messages récents",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const MessagingPage(forCompany: true),
                    ),
                  );
                },
                child: Text(
                  "Voir tout",
                  style: TextStyle(
                    color: Colors.blue.shade600,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_isLoadingConversations)
            const Center(child: CircularProgressIndicator())
          else if (_recentConversations.isEmpty)
            const Center(
              child: Column(
                children: [
                  SizedBox(height: 32),
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 48,
                    color: Colors.grey,
                  ),
                  SizedBox(height: 16),
                  Text(
                    "Aucun message",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 32),
                ],
              ),
            )
          else
            Column(
              children: _recentConversations.map((conversation) {
                return _buildConversationItem(conversation);
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildConversationItem(ConversationData conversation) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const MessagingPage(forCompany: true),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.grey.shade200,
              width: 1,
            ),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.purple.shade100,
                radius: 16,
                child: Icon(
                  Icons.person,
                  color: Colors.purple.shade700,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      conversation.title ?? 'Conversation',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                        color: Colors.black87,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      conversation.lastMessage?.content ?? 'Nouvelle conversation',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
