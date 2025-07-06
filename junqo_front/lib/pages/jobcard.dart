import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:junqo_front/shared/widgets/navbar.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/client.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:junqo_front/shared/widgets/animated_widgets.dart';
import 'package:junqo_front/shared/theme/app_theme.dart';

class CardData {
  final String companyName;
  final String companyLogo;
  final String jobTitle;
  final String contractType;
  final String duration;
  final String location;
  final String salary;
  final List<String> benefits;
  final List<String> technicalSkills;
  final String companyDescription;
  final String companyWebsite;
  final bool showDetails;
  final String details;
  final String id;
  final String userid;
  final String status;
  final bool isPlaceHolder;

  CardData({
    required this.companyName,
    required this.companyLogo,
    required this.jobTitle,
    required this.contractType,
    required this.duration,
    required this.location,
    required this.salary,
    required this.benefits,
    required this.technicalSkills,
    required this.companyDescription,
    required this.companyWebsite,
    required this.details,
    this.showDetails = false,
    required this.id,
    required this.userid,
    required this.status,
    required this.isPlaceHolder,
  });
}

//
class JobCardSwipe extends StatefulWidget {
  final RestClient client = GetIt.instance<RestClient>();

  JobCardSwipe({super.key});

  @override
  State<JobCardSwipe> createState() => _JobCardSwipeState();
}

class _JobCardSwipeState extends State<JobCardSwipe>
    with SingleTickerProviderStateMixin {
  // Ajout d'une clé globale pour le ScaffoldMessenger
  final GlobalKey<ScaffoldMessengerState> _scaffoldKey =
      GlobalKey<ScaffoldMessengerState>();

  CardData? cardData;
  late final ApiService _apiService;
  late final RestClient client;
  bool isLoading = true;

  bool initialized = false;
  List<CardData> cardDataList = [];
  bool outOfData = false;
  int currentIndex = 0;
  int offsetIndex = 0;

  // Set pour garder une trace des offres postulées
  final Set<String> _appliedOffers = {};

  // Animation controller for card transitions
  late final AnimationController _animationController;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  // App theme colors
  static const Color _indigoColor = Color(0xFF6366F1);
  static const Color _indigoLight = Color(0xFFEEF2FF);
  static const Color _slate800 = Color(0xFF1E293B);
  static const Color _slate500 = Color(0xFF64748B);
  static const Color _slate50 = Color(0xFFF8FAFC);

  bool _actionLocked = false;
  // Cache for company names to minimize API calls
  final Map<String, String> _companyNameCache = {};

  @override
  void initState() {
    super.initState();
    _apiService = GetIt.instance<ApiService>();
    client = widget.client;

    // Setup animation controller
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.0).animate(
        CurvedAnimation(
            parent: _animationController, curve: Curves.easeOutCubic));

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: _animationController, curve: Curves.easeOut));

    _initCardData();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _initCardData() async {
    try {
      final data = await setCardData();
      if (mounted) {
        setState(() {
          cardData = data;
          isLoading = false;
        });
        // Start animation when card is loaded
        _animationController.forward(from: 0.0);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          cardData = placeholderCardData()[0];
          isLoading = false;
        });
        // Still animate for placeholder
        _animationController.forward(from: 0.0);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load job data: ${e.toString()}'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(8),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final bool isWideScreen = screenSize.width > 1000;
    final bool isMediumScreen =
        screenSize.width > 650 && screenSize.width <= 1000;

    return ScaffoldMessenger(
      key: _scaffoldKey,
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFFF8FAFC),
                Color(0xFFE2E8F0),
                Color(0xFFF1F5F9),
              ],
            ),
          ),
          child: Stack(
            children: [
              // Floating particles background
              const FloatingParticles(
                numberOfParticles: 12,
                color: AppTheme.primaryColor,
                maxSize: 5.0,
              ),
              
              Column(
                children: [
                  const Navbar(currentIndex: 0),
                  Expanded(
                    child: isWideScreen 
                        ? _buildWideLayout() 
                        : isMediumScreen 
                            ? _buildMediumLayout()
                            : _buildMobileLayout(),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWideLayout() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          // Left side panel - can add stats or help text here
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedCard(
                    delay: 200.ms,
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AppTheme.primaryColor.withOpacity(0.1),
                            AppTheme.secondaryColor.withOpacity(0.1),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                      ),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(
                              Icons.swipe,
                              size: 40,
                              color: AppTheme.primaryColor,
                            ),
                          ).animate()
                              .scale(delay: 400.ms, duration: 600.ms, curve: Curves.elasticOut),
                          const SizedBox(height: 20),
                          const Text(
                            "Découvrez de nouvelles opportunités",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: _slate800,
                            ),
                            textAlign: TextAlign.center,
                          ).animate()
                              .fadeIn(delay: 600.ms, duration: 600.ms),
                          const SizedBox(height: 12),
                          const Text(
                            "Balayez à droite pour accepter ou à gauche pour rejeter",
                            style: TextStyle(
                              fontSize: 14,
                              color: _slate500,
                            ),
                            textAlign: TextAlign.center,
                          ).animate()
                              .fadeIn(delay: 800.ms, duration: 600.ms),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  AnimatedButton(
                    text: "Rejeter",
                    icon: Icons.close,
                    isPrimary: false,
                    customColor: AppTheme.errorColor,
                    onPressed: isLoading ? null : () => _handleAction(false),
                  ),
                ],
              ),
            ),
          ),
          
          // Center panel - card
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              child: Center(
                child: isLoading
                    ? _buildLoadingIndicator()
                    : _buildAnimatedCard(),
              ),
            ),
          ),
          
          // Right side panel
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  AnimatedCard(
                    delay: 400.ms,
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AppTheme.successColor.withOpacity(0.1),
                            AppTheme.accentColor.withOpacity(0.1),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.successColor.withOpacity(0.2)),
                      ),
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppTheme.successColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Icon(
                              Icons.check_circle_outline,
                              size: 40,
                              color: AppTheme.successColor,
                            ),
                          ).animate()
                              .scale(delay: 600.ms, duration: 600.ms, curve: Curves.elasticOut),
                          const SizedBox(height: 20),
                          const Text(
                            "Postuler en un clic",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: _slate800,
                            ),
                            textAlign: TextAlign.center,
                          ).animate()
                              .fadeIn(delay: 800.ms, duration: 600.ms),
                          const SizedBox(height: 12),
                          const Text(
                            "Votre profil sera automatiquement envoyé à l'employeur",
                            style: TextStyle(
                              fontSize: 14,
                              color: _slate500,
                            ),
                            textAlign: TextAlign.center,
                          ).animate()
                              .fadeIn(delay: 1000.ms, duration: 600.ms),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                  AnimatedButton(
                    text: "Accepter",
                    icon: Icons.check,
                    customColor: AppTheme.successColor,
                    onPressed: isLoading ? null : () => _handleAction(true),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMediumLayout() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Top section - instructions
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: AnimatedCard(
              delay: 200.ms,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient.scale(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.info_outline,
                        color: AppTheme.primaryColor,
                        size: 24,
                      ),
                    ).animate()
                        .scale(delay: 400.ms, duration: 400.ms, curve: Curves.elasticOut),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Text(
                        "Découvrez des offres adaptées à votre profil. Acceptez ou passez selon vos préférences.",
                        style: TextStyle(
                          color: _slate800,
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ).animate()
                        .fadeIn(delay: 600.ms, duration: 600.ms),
                  ],
                ),
              ),
            ),
          ),
          
          // Center section - card
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              child: Center(
                child: isLoading
                    ? _buildLoadingIndicator()
                    : _buildAnimatedCard(),
              ),
            ),
          ),
          
          // Bottom section - action buttons
          Padding(
            padding: const EdgeInsets.only(top: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                  child: AnimatedButton(
                    text: "Rejeter",
                    icon: Icons.close,
                    isPrimary: false,
                    customColor: AppTheme.errorColor,
                    onPressed: isLoading ? null : () => _handleAction(false),
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: AnimatedButton(
                    text: "Accepter",
                    icon: Icons.check,
                    customColor: AppTheme.successColor,
                    onPressed: isLoading ? null : () => _handleAction(true),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileLayout() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Top info card
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AnimatedCard(
              delay: 200.ms,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient.scale(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.swipe,
                        size: 20,
                        color: AppTheme.primaryColor,
                      ),
                    ).animate()
                        .scale(delay: 400.ms, duration: 400.ms, curve: Curves.elasticOut),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        "Balayez pour découvrir des offres",
                        style: TextStyle(
                          color: _slate800,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ).animate()
                        .fadeIn(delay: 600.ms, duration: 600.ms),
                  ],
                ),
              ),
            ),
          ),
          
          // Card section
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
              child: Center(
                child: isLoading
                    ? _buildLoadingIndicator()
                    : _buildAnimatedCard(),
              ),
            ),
          ),
          
          // Action buttons
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Row(
              children: [
                Expanded(
                  child: AnimatedButton(
                    text: "Rejeter",
                    icon: Icons.close,
                    isPrimary: false,
                    customColor: AppTheme.errorColor,
                    onPressed: isLoading ? null : () => _handleAction(false),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: AnimatedButton(
                    text: "Accepter",
                    icon: Icons.check,
                    customColor: AppTheme.successColor,
                    onPressed: isLoading ? null : () => _handleAction(true),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedCard() {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: Dismissible(
              key: UniqueKey(),
              direction: DismissDirection.horizontal,
              resizeDuration: const Duration(milliseconds: 200),
              movementDuration: const Duration(milliseconds: 200),
              onDismissed: (direction) {
                if (_actionLocked) return;
                final accepted = direction == DismissDirection.startToEnd; // Right swipe
                _handleAction(accepted);
              },
              background: Container(
                alignment: Alignment.centerLeft,
                padding: const EdgeInsets.only(left: 24),
                decoration: BoxDecoration(
                  color: AppTheme.successColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(Icons.check, color: AppTheme.successColor, size: 32),
              ),
              secondaryBackground: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 24),
                decoration: BoxDecoration(
                  color: AppTheme.errorColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Icon(Icons.close, color: AppTheme.errorColor, size: 32),
              ),
              child: JobCard(data: cardData!),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoadingIndicator() {
    return AnimatedCard(
      delay: 100.ms,
      child: Container(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient.scale(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  strokeWidth: 4,
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                ),
              ),
            ).animate()
                .scale(delay: 200.ms, duration: 600.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            const Text(
              "Chargement des offres...",
              style: TextStyle(
                color: _slate800,
                fontSize: 18,
                fontWeight: FontWeight.w500,
              ),
            ).animate()
                .fadeIn(delay: 400.ms, duration: 600.ms),
            const SizedBox(height: 12),
            const Text(
              "Préparation de votre sélection personnalisée",
              style: TextStyle(
                color: _slate500,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ).animate()
                .fadeIn(delay: 600.ms, duration: 600.ms),
          ],
        ),
      ),
    );
  }

  // Méthode pour afficher les Snackbars de manière sécurisée
  void _showSnackBar(String message, {bool isError = false}) {
    // Utiliser la clé globale pour accéder au ScaffoldMessenger
    _scaffoldKey.currentState?.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                isError ? Icons.error_outline : Icons.check_circle_outline,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        backgroundColor: isError ? AppTheme.errorColor : AppTheme.successColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 8,
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 4),
      ),
    );
  }

  Future<void> _postulate(String id) async {
    if (cardData!.isPlaceHolder) {
      debugPrint('Cannot postulate for placeholder data');
      return;
    }

    if (_appliedOffers.contains(id)) {
      _showSnackBar('Vous avez déjà postulé à cette offre');
      return;
    }

    debugPrint('Postulating for offer with ID: $id');
    try {
      final response = await _apiService.postulateOffer(id);

      if (response['id'] != null || response['status'] == 'OPENED') {
        _appliedOffers.add(id);
        _showSnackBar('Candidature envoyée avec succès !');
      } else {
        _showSnackBar('Échec de la candidature. Veuillez réessayer.',
            isError: true);
      }
    } catch (error) {
      _showSnackBar('Erreur: ${error.toString()}', isError: true);
    }
  }

  Future<void> _handleAction(bool accepted) async {
    // Animate out current card
    await _animationController.reverse();

    setState(() {
      isLoading = true;
      _actionLocked = true;
    });

    // Handle action for current card if it's not a placeholder
    if (cardData != null && !cardData!.isPlaceHolder) {
      if (accepted) {
        if (!_appliedOffers.contains(cardData!.id)) {
          await _postulate(cardData!.id);
        } else {
          _showSnackBar('Vous avez déjà postulé à cette offre');
        }
      } else {
        debugPrint('Rejected offer with ID: ${cardData!.id}');
      }
    }

    try {
      final newData = await setCardData();
      if (!mounted) return;

      setState(() {
        cardData = newData;
        isLoading = false;
        _actionLocked = false;
      });
      // Animate in new card
      _animationController.forward(from: 0.0);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        cardData = placeholderCardData()[0];
        isLoading = false;
        _actionLocked = false;
      });
      // Animate in placeholder
      _animationController.forward(from: 0.0);

      _showSnackBar('Error loading next job: ${e.toString()}', isError: true);
    }
  }

  Future<CardData> setCardData() async {
    if (!initialized) {
      initialized = true;
      cardDataList = await getOfferQuery(0);
      // Filtrer les offres déjà postulées
      cardDataList = cardDataList
          .where((card) => !_appliedOffers.contains(card.id))
          .toList();

      if (cardDataList.isEmpty) {
        outOfData = true;
        currentIndex = 0;
        return placeholderCardData()[0];
      }
      debugPrint('Card Data initialized with ${cardDataList.length} items');
      return cardDataList[currentIndex];
    }

    if (outOfData) {
      debugPrint('No more data available');
      if (currentIndex == 0) {
        currentIndex = 1;
        return placeholderCardData()[1];
      } else {
        currentIndex = 0;
        return placeholderCardData()[0];
      }
    }

    currentIndex++;
    debugPrint('Current index: $currentIndex');
    debugPrint('Card data list length: ${cardDataList.length}');

    if (currentIndex >= cardDataList.length) {
      debugPrint('Fetching more data');
      offsetIndex = offsetIndex + currentIndex;
      currentIndex = 0;
      final newCards = await getOfferQuery(offsetIndex);
      // Filtrer les nouvelles offres pour exclure celles déjà postulées
      cardDataList =
          newCards.where((card) => !_appliedOffers.contains(card.id)).toList();

      if (cardDataList.isEmpty) {
        outOfData = true;
        currentIndex = 0;
        return placeholderCardData()[0];
      }
      return cardDataList[currentIndex];
    }

    return cardDataList[currentIndex];
  }

  Future<List<CardData>> getOfferQuery(int offset) async {
    try {
      final query = {
        'offset': offset.toString(),
        'limit': '10', // Add limit for pagination
      };

      final response = await _apiService.getAllOffersQuery(query);
      final List<OfferData> offers = response['rows'];
      
      // Convert offers to CardData first (placeholder company name)
      final List<CardData> cards = transformOffersToCards(offers);

      // Prefetch company info for cards and update in place
      await _prefetchCompanyNames(cards);

      if (cards.isEmpty) {
        return placeholderCardData();
      }

      return cards;
    } catch (e) {
      throw Exception('Failed to load offers: $e');
    }
  }

  CardData transformOfferToCard(OfferData offer) {
    // Properly handle nullable lists and strings
    final List<String> benefitsList =
        offer.benefits.isNotEmpty ? List<String>.from(offer.benefits) : [];
    if (offer.workLocationType.isNotEmpty) {
      benefitsList.add(offer.workLocationType);
    }

    final List<String> skillsList =
        offer.skills.isNotEmpty ? List<String>.from(offer.skills) : [];
    if (offer.educationLevel.isNotEmpty) {
      skillsList.add(offer.educationLevel);
    }

    return CardData(
      id: offer.id ?? '',
      userid: offer.userid,
      jobTitle: offer.title,
      contractType: offer.offerType,
      duration: offer.duration,
      salary: offer.salary,
      benefits: benefitsList,
      technicalSkills: skillsList,
      details: offer.description,
      status: offer.status,
      companyName: 'Company name not available',
      companyLogo: '',
      location: 'Location currently not available',
      showDetails: false,
      isPlaceHolder: false,
      companyDescription: '',
      companyWebsite: '',
    );
  }

  List<CardData> transformOffersToCards(List<OfferData> offers) {
    return offers.map(transformOfferToCard).toList();
  }

  List<CardData> placeholderCardData() {
    return [
      CardData(
        companyName: 'Fin des offres',
        companyLogo: '',
        jobTitle: 'Aucune offre disponible',
        contractType: '-',
        duration: '-',
        location: '-',
        salary: '-',
        benefits: const [],
        technicalSkills: const [],
        details: 'Il n\'y a plus d\'offres disponibles pour le moment.',
        id: 'placeholder_1',
        userid: 'placeholder',
        status: 'placeholder',
        isPlaceHolder: true,
        companyDescription: '',
        companyWebsite: '',
      ),
      CardData(
        companyName: 'Recherchez plus tard',
        companyLogo: '',
        jobTitle: 'Revenez bientôt',
        contractType: '-',
        duration: '-',
        location: '-',
        salary: '-',
        benefits: const [],
        technicalSkills: const [],
        details: 'De nouvelles offres seront bientôt disponibles.',
        id: 'placeholder_2',
        userid: 'placeholder',
        status: 'placeholder',
        isPlaceHolder: true,
        companyDescription: '',
        companyWebsite: '',
      )
    ];
  }

  // Fetch company info for cards and update in place
  Future<void> _prefetchCompanyNames(List<CardData> cards) async {
    final List<Future<void>> futures = [];
    for (final card in cards) {
      final String userId = card.userid;

      // Determine if we already have complete info
      final bool infoComplete = card.companyDescription.isNotEmpty && card.companyWebsite.isNotEmpty && !card.companyName.startsWith('Company name');
      if (infoComplete) continue;

      // Check cache first
      if (_companyNameCache.containsKey(userId)) {
        final cachedName = _companyNameCache[userId]!;
        _replaceCompanyData(cards, card, cachedName, card.companyDescription, card.companyWebsite);
        continue;
      }

      futures.add(_apiService.getCompanyProfileById(userId).then((profile) {
        _companyNameCache[userId] = profile.name;
        _replaceCompanyData(cards, card, profile.name, profile.description ?? '', profile.websiteUrl ?? '');
      }).catchError((_) {
        // ignore errors
      }));
    }
    await Future.wait(futures);
  }

  void _replaceCompanyData(List<CardData> list, CardData card, String name, String desc, String site) {
    if (card.companyName == name && card.companyDescription == desc && card.companyWebsite == site) return;
    // Replace by creating a new CardData and updating list if needed
    final int idx = list.indexOf(card);
    if (idx >= 0) {
      list[idx] = CardData(
        companyName: name,
        companyLogo: card.companyLogo,
        jobTitle: card.jobTitle,
        contractType: card.contractType,
        duration: card.duration,
        location: card.location,
        salary: card.salary,
        benefits: card.benefits,
        technicalSkills: card.technicalSkills,
        details: card.details,
        id: card.id,
        userid: card.userid,
        status: card.status,
        showDetails: card.showDetails,
        companyDescription: desc,
        companyWebsite: site,
        isPlaceHolder: card.isPlaceHolder,
      );
      if (mounted && cardData?.id == card.id) {
        setState(() {
          cardData = list[idx];
        });
      }
    }
  }
}

// Enhance the JobCard to use consistent theming and better styling
class JobCard extends StatefulWidget {
  final CardData data;

  const JobCard({super.key, required this.data});

  @override
  State<JobCard> createState() => _JobCardState();
}

class _JobCardState extends State<JobCard> {
  bool _showFullDetails = false;

  // App theme colors
  static const Color _indigoColor = Color(0xFF6366F1);
  static const Color _indigoLight = Color(0xFFEEF2FF);
  static const Color _slate800 = Color(0xFF1E293B);
  static const Color _slate600 = Color(0xFF475569);
  static const Color _slate500 = Color(0xFF64748B);
  static const Color _slate200 = Color(0xFFE2E8F0);
  static const Color _slate50 = Color(0xFFF8FAFC);

  @override
  Widget build(BuildContext context) {
    return AnimatedCard(
      delay: 100.ms,
      child: Container(
        width: 420,
        constraints: const BoxConstraints(
          minHeight: 320,
          maxHeight: 600,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.white,
              Colors.white.withOpacity(0.95),
            ],
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              spreadRadius: 0,
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(
            color: AppTheme.primaryColor.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with logo and company name
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient.scale(0.1),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(24),
                    topRight: Radius.circular(24),
                  ),
                ),
                child: Row(
                  children: [
                    _buildCompanyLogo(widget.data.companyLogo)
                        .animate()
                        .scale(delay: 200.ms, duration: 400.ms, curve: Curves.elasticOut),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        widget.data.companyName,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: _slate800,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ).animate()
                          .fadeIn(delay: 300.ms, duration: 600.ms)
                          .slideX(begin: -0.2, end: 0),
                    ),
                  ],
                ),
              ),

              // Content (only offre)
              _buildOfferContent(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOfferContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Job title
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
          child: Text(
            widget.data.jobTitle,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: _slate800,
              height: 1.2,
            ),
          ).animate()
              .fadeIn(delay: 400.ms, duration: 600.ms)
              .slideY(begin: 0.2, end: 0),
        ),
        // Main info grid (2x2)
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: AnimatedListItem(
                      index: 0,
                      delay: const Duration(milliseconds: 100),
                      child: _buildInfoItem(
                        icon: Icons.work_outline,
                        label: "Type",
                        value: widget.data.contractType,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: AnimatedListItem(
                      index: 1,
                      delay: const Duration(milliseconds: 100),
                      child: _buildInfoItem(
                        icon: Icons.calendar_today,
                        label: "Durée",
                        value: widget.data.duration,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: AnimatedListItem(
                      index: 2,
                      delay: const Duration(milliseconds: 100),
                      child: _buildInfoItem(
                        icon: Icons.location_on_outlined,
                        label: "Lieu",
                        value: widget.data.location,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: AnimatedListItem(
                      index: 3,
                      delay: const Duration(milliseconds: 100),
                      child: _buildInfoItem(
                        icon: Icons.euro_outlined,
                        label: "Salaire",
                        value: widget.data.salary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Skills section
        if (widget.data.technicalSkills.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.lightbulb_outline,
                        color: AppTheme.primaryColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      "Compétences requises",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _slate800,
                      ),
                    ),
                  ],
                ).animate()
                    .fadeIn(delay: 600.ms, duration: 500.ms),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: widget.data.technicalSkills.asMap().entries
                      .map(
                        (entry) => AnimatedListItem(
                          index: entry.key,
                          delay: const Duration(milliseconds: 50),
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: AppTheme.primaryGradient,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.primaryColor.withOpacity(0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Chip(
                              label: Text(
                                entry.value,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Colors.white,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              backgroundColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide.none,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            ),
          ),

        // Benefits section
        if (widget.data.benefits.isNotEmpty)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.successColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.star_outline,
                        color: AppTheme.successColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      "Avantages",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _slate800,
                      ),
                    ),
                  ],
                ).animate()
                    .fadeIn(delay: 700.ms, duration: 500.ms),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: widget.data.benefits.asMap().entries
                      .map(
                        (entry) => AnimatedListItem(
                          index: entry.key,
                          delay: const Duration(milliseconds: 50),
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: AppTheme.successGradient.scale(0.3),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: AppTheme.successColor.withOpacity(0.3),
                              ),
                            ),
                            child: Chip(
                              avatar: Icon(
                                Icons.check_circle,
                                size: 18,
                                color: AppTheme.successColor,
                              ),
                              label: Text(
                                entry.value,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppTheme.successColor,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              backgroundColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide.none,
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                            ),
                          ),
                        ),
                      )
                      .toList(),
                ),
              ],
            ),
          ),

        // Description
        if (widget.data.details.isNotEmpty)
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.accentColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.description_outlined,
                        color: AppTheme.accentColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      "Description du poste",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _slate800,
                      ),
                    ),
                  ],
                ).animate()
                    .fadeIn(delay: 800.ms, duration: 500.ms),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: _slate50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _slate200,
                      width: 1,
                    ),
                  ),
                  child: Text(
                    _showFullDetails
                        ? widget.data.details
                        : widget.data.details.length > 150
                            ? '${widget.data.details.substring(0, 150)}...'
                            : widget.data.details,
                    style: const TextStyle(
                      fontSize: 14,
                      color: _slate600,
                      height: 1.6,
                    ),
                  ),
                ).animate()
                    .fadeIn(delay: 900.ms, duration: 600.ms),
                if (widget.data.details.length > 150)
                  Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: AnimatedButton(
                      text: _showFullDetails ? 'Voir moins' : 'Voir plus',
                      icon: _showFullDetails ? Icons.expand_less : Icons.expand_more,
                      isPrimary: false,
                      customColor: AppTheme.accentColor,
                      onPressed: () {
                        setState(() {
                          _showFullDetails = !_showFullDetails;
                        });
                      },
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildCompanyLogo(String logoPath) {
    return Container(
      height: 60,
      width: 60,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            AppTheme.primaryColor.withOpacity(0.05),
          ],
        ),
        shape: BoxShape.circle,
        border: Border.all(
          color: AppTheme.primaryColor.withOpacity(0.2),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.1),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: logoPath.isEmpty || logoPath.contains('placeholder')
            ? Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient.scale(0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.business,
                  size: 28,
                  color: AppTheme.primaryColor,
                ),
              )
            : _getLogoWidget(logoPath),
      ),
    );
  }

  Widget _getLogoWidget(String logoPath) {
    try {
      if (logoPath.toLowerCase().endsWith('.svg')) {
        return SvgPicture.asset(
          logoPath,
          placeholderBuilder: (context) =>
              const Icon(Icons.business, size: 24, color: _slate500),
          height: 30,
          width: 30,
        );
      } else {
        return Image.asset(
          logoPath,
          height: 30,
          width: 30,
          errorBuilder: (context, error, stackTrace) {
            return const Icon(Icons.business, size: 24, color: _slate500);
          },
        );
      }
    } catch (e) {
      return const Icon(Icons.business, size: 24, color: _slate500);
    }
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            AppTheme.primaryColor.withOpacity(0.02),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.primaryColor.withOpacity(0.1),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient.scale(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  size: 18,
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: _slate800,
              height: 1.2,
            ),
            overflow: TextOverflow.ellipsis,
            maxLines: 2,
          ),
        ],
      ),
    );
  }
}
