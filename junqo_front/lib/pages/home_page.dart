import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/core/user_service.dart';
import 'package:junqo_front/pages/jobcard.dart';
import 'package:junqo_front/pages/recruter_dashboard.dart';
import 'package:junqo_front/shared/enums/user_type.dart';
import 'package:junqo_front/shared/errors/show_error_dialog.dart';
import 'package:junqo_front/shared/widgets/animated_widgets.dart';
import 'package:junqo_front/shared/theme/app_theme.dart';
import '../shared/widgets/navbar.dart';
import 'dart:math' as math;

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  final AuthService authService = GetIt.instance<AuthService>();
  final UserService userService = GetIt.instance<UserService>();
  UserType? userType;
  
  // Animation controllers
  late AnimationController _floatingController;
  late AnimationController _pulseController;
  late AnimationController _rotationController;

  @override
  void initState() {
    super.initState();
    getUserType();
    
    // Initialize animation controllers
    _floatingController = AnimationController(
      duration: const Duration(seconds: 6),
      vsync: this,
    )..repeat(reverse: true);
    
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    
    _rotationController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _floatingController.dispose();
    _pulseController.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  Future<void> getUserType() async {
    String? userId = authService.userId;

    if (userId == null) {
      return;
    }
    try {
      await userService.fetchUserData(userId);
      if (!mounted) return;
      setState(() {
        userType = userService.userData?.type;
      });
    } catch (e) {
      debugPrint('Error fetching user type: $e');
      if (!mounted) return;

      RegExpMatch? match = RegExp(r'.*not\s*found').firstMatch(e.toString());

      if (match != null) {
        await authService.logout();
        if (!mounted) return;
        Navigator.pushReplacementNamed(context, '/login');
        return;
      }
      showErrorDialog(e.toString(), context);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (userType == null) {
      return Scaffold(
        body: Container(
          decoration: const BoxDecoration(
            gradient: AppTheme.primaryGradient,
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 60,
                  height: 60,
                  child: CircularProgressIndicator(
                    strokeWidth: 4,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
                SizedBox(height: 24),
                Text(
                  'Chargement de votre profil...',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    } else if (userType == UserType.COMPANY) {
      return RecruiterDashboard();
    } else if (userType == UserType.STUDENT) {
      return JobCardSwipe();
    }
    
    return Scaffold(
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
              numberOfParticles: 15,
              color: AppTheme.primaryColor,
              maxSize: 6.0,
            ),
            
            // Animated background shapes
            _buildAnimatedBackgroundShapes(),
            
            // Main content
            Column(
              children: [
                const Navbar(currentIndex: 0),
                Expanded(
                  child: SingleChildScrollView(
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 1200),
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildWelcomeSection(),
                              const SizedBox(height: 40),
                              _buildStatsSection(),
                              const SizedBox(height: 40),
                              _buildFeaturesSection(),
                              const SizedBox(height: 40),
                              _buildQuickActionsSection(),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedBackgroundShapes() {
    return Positioned.fill(
      child: AnimatedBuilder(
        animation: _rotationController,
        builder: (context, child) {
          return Stack(
            children: [
              // Large rotating circle
              Positioned(
                top: -100,
                right: -100,
                child: Transform.rotate(
                  angle: _rotationController.value * 2 * math.pi,
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          AppTheme.primaryColor.withOpacity(0.1),
                          AppTheme.primaryColor.withOpacity(0.05),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              // Medium floating circle
              Positioned(
                bottom: -50,
                left: -50,
                child: AnimatedBuilder(
                  animation: _floatingController,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(
                        30 * math.sin(_floatingController.value * 2 * math.pi),
                        20 * math.cos(_floatingController.value * 2 * math.pi),
                      ),
                      child: Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              AppTheme.secondaryColor.withOpacity(0.1),
                              AppTheme.secondaryColor.withOpacity(0.05),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return AnimatedCard(
      delay: 200.ms,
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          gradient: AppTheme.primaryGradient,
          borderRadius: BorderRadius.circular(AppTheme.borderRadiusXLarge),
          boxShadow: AppTheme.elevatedShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Transform.scale(
                      scale: 1.0 + (_pulseController.value * 0.1),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Icon(
                          Icons.waving_hand,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Bienvenue sur Junqo !',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ).animate()
                          .fadeIn(delay: 300.ms, duration: 600.ms)
                          .slideX(begin: -0.2, end: 0),
                      const SizedBox(height: 8),
                      const Text(
                        'Découvrez les meilleures opportunités de stage et d\'emploi étudiant',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          fontWeight: FontWeight.w300,
                        ),
                      ).animate()
                          .fadeIn(delay: 500.ms, duration: 600.ms)
                          .slideX(begin: -0.2, end: 0),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    return Row(
      children: [
        Expanded(
          child: AnimatedCard(
            delay: 400.ms,
            child: _buildStatCard(
              icon: Icons.business_center,
              title: '500+',
              subtitle: 'Offres d\'emploi',
              color: AppTheme.primaryColor,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: AnimatedCard(
            delay: 500.ms,
            child: _buildStatCard(
              icon: Icons.people,
              title: '10K+',
              subtitle: 'Étudiants',
              color: AppTheme.secondaryColor,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: AnimatedCard(
            delay: 600.ms,
            child: _buildStatCard(
              icon: Icons.star,
              title: '95%',
              subtitle: 'Satisfaction',
              color: AppTheme.successColor,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              return Transform.scale(
                scale: 1.0 + (_pulseController.value * 0.05),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    icon,
                    color: color,
                    size: 32,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTheme.headingMedium.copyWith(color: color),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: AppTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Fonctionnalités principales',
          style: AppTheme.headingMedium,
        ).animate()
            .fadeIn(delay: 700.ms, duration: 600.ms)
            .slideY(begin: 0.2, end: 0),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: AnimatedCard(
                delay: 800.ms,
                child: _buildFeatureCard(
                  icon: Icons.search,
                  title: 'Recherche intelligente',
                  description: 'Trouvez les offres qui correspondent parfaitement à votre profil',
                  color: AppTheme.primaryColor,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: AnimatedCard(
                delay: 900.ms,
                child: _buildFeatureCard(
                  icon: Icons.psychology,
                  title: 'IA Personnalisée',
                  description: 'Notre intelligence artificielle vous aide à optimiser vos candidatures',
                  color: AppTheme.secondaryColor,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
              size: 28,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: AppTheme.headingSmall,
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: AppTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionsSection() {
    return AnimatedCard(
      delay: 1000.ms,
      child: Container(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Actions rapides',
              style: AppTheme.headingMedium,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: AnimatedButton(
                    text: 'Voir les offres',
                    icon: Icons.work,
                    onPressed: () {
                      Navigator.pushNamed(context, '/jobs');
                    },
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: AnimatedButton(
                    text: 'Mon profil',
                    icon: Icons.person,
                    isPrimary: false,
                    onPressed: () {
                      Navigator.pushNamed(context, '/profile');
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
