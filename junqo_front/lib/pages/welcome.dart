import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter/gestures.dart';
import 'package:get_it/get_it.dart';
import 'dart:math' as math;

import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/core/log_service.dart';
import 'package:junqo_front/shared/errors/show_error_dialog.dart';

const studentsCount = '10K+';
const companiesCount = '500+';
const satisfactionRate = '95%';

class Welcome extends StatefulWidget {
  const Welcome({
    super.key,
  });

  @override
  State<Welcome> createState() => _WelcomeState();
}

class _WelcomeState extends State<Welcome> with TickerProviderStateMixin {
  late final AnimationController _blob1Controller;
  late final AnimationController _blob2Controller;
  late final AnimationController _blob3Controller;
  late final AnimationController _scaleController;

  bool _isHovered = false;

  late final AuthService authService;

  @override
  void initState() {
    super.initState();

    try {
      authService = GetIt.instance<AuthService>();
    } catch (e) {
      LogService.error("Error: Failed to get AuthService - $e");
      Future.microtask(() {
        if (!mounted) return;
        showErrorDialog("Service initialization failed", context);
      });
    }
    _isLoggedIn().then((loggedIn) {
      if (loggedIn && mounted) {
        Navigator.pushReplacementNamed(context, '/home');
      }
    });

    _blob1Controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 15),
    )..repeat();

    _blob2Controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 18),
    )..repeat();

    _blob3Controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();

    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _blob1Controller.dispose();
    _blob2Controller.dispose();
    _blob3Controller.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  Future<bool> _isLoggedIn() async {
    try {
      bool loggedIn = await authService.isLoggedIn();
      return loggedIn;
    } catch (e) {
      LogService.error("Error: Failed to check login status - $e");
      if (!mounted) return false;
      showErrorDialog(e.toString(), context);
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Colors.blue.shade50,
              Colors.white,
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with logo
            Padding(
              padding: const EdgeInsets.fromLTRB(40, 24, 40, 0),
              child: SizedBox(
                height: 60,
                child: Image.asset(
                  'assets/images/junqo_logo.png',
                  fit: BoxFit.contain,
                  alignment: Alignment.centerLeft,
                ),
              ),
            ).animate()
                .fadeIn(duration: 600.ms)
                .slideY(begin: -0.2, end: 0),

            // Main content
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return Row(
                    children: [
                      // Left side - Welcome form
                      Expanded(
                        flex: 7,
                        child: Center(
                          child: Container(
                            width: 440,
                            padding: const EdgeInsets.symmetric(horizontal: 40),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Welcome Text with decorative element
                                Row(
                                  children: [
                                    Container(
                                      width: 4,
                                      height: 80,
                                      margin: const EdgeInsets.only(right: 16),
                                      decoration: BoxDecoration(
                                        color: Colors.blue.shade400,
                                        borderRadius: BorderRadius.circular(2),
                                      ),
                                    ).animate()
                                        .scaleY(
                                          delay: 200.ms,
                                          duration: 600.ms,
                                          begin: 0,
                                          end: 1,
                                          alignment: Alignment.center,
                                          curve: Curves.easeOutCubic,
                                        ),
                                    Expanded(
                                      child: const Text(
                                        'Bienvenue sur la plateforme n°1 de contrats étudiants',
                                        style: TextStyle(
                                          fontSize: 34,
                                          fontWeight: FontWeight.w300,
                                          color: Color(0xFF1A1A1A),
                                          height: 1.2,
                                          letterSpacing: -0.5,
                                        ),
                                      ).animate()
                                          .fadeIn(delay: 300.ms, duration: 700.ms)
                                          .slideX(begin: -0.1, end: 0),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),

                                Text(
                                  'Connectez-vous pour accéder à votre espace personnel',
                                  style: TextStyle(
                                    fontSize: 15,
                                    color: Colors.grey.shade600,
                                    height: 1.5,
                                    letterSpacing: 0.1,
                                  ),
                                ).animate()
                                    .fadeIn(delay: 500.ms, duration: 700.ms),
                                const SizedBox(height: 30),

                                // Email Sign In Button
                                MouseRegion(
                                  onEnter: (_) =>
                                      setState(() => _isHovered = true),
                                  onExit: (_) =>
                                      setState(() => _isHovered = false),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 200),
                                    transform: Matrix4.identity()
                                      ..scale(_isHovered ? 1.02 : 1.0),
                                    child: _buildWelcomeButton(
                                      onPressed: () => Navigator.pushNamed(
                                        context,
                                        '/user-type-selection',
                                      ),
                                      icon: Icon(Icons.mail_outline,
                                          color: Colors.grey.shade700),
                                      label:
                                          'S\'inscrire avec une adresse e-mail',
                                    ),
                                  ),
                                ).animate()
                                    .fadeIn(delay: 700.ms, duration: 700.ms)
                                    .scale(
                                      delay: 700.ms,
                                      duration: 400.ms,
                                      begin: const Offset(0.9, 0.9),
                                      curve: Curves.easeOut,
                                    ),
                                const SizedBox(height: 24),

                                // Welcome link
                                Center(
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        'Vous avez déjà un compte ? ',
                                        style: TextStyle(
                                          color: Colors.grey.shade600,
                                          fontSize: 14,
                                        ),
                                      ),
                                      MouseRegion(
                                        cursor: SystemMouseCursors.click,
                                        child: GestureDetector(
                                          onTap: () {
                                            Navigator.pushNamed(
                                              context,
                                              '/login',
                                            );
                                          },
                                          child: Text(
                                            'Connectez-vous',
                                            style: TextStyle(
                                              color: Colors.blue.shade600,
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ).animate(
                                            onPlay: (controller) => controller.repeat(reverse: true),
                                          ).shimmer(
                                            delay: 2.seconds,
                                            duration: 1.5.seconds,
                                            color: Colors.blue.shade400,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ).animate()
                                    .fadeIn(delay: 900.ms, duration: 700.ms),
                                const SizedBox(height: 24),

                                // Stats row
                                Container(
                                  padding:
                                      const EdgeInsets.symmetric(vertical: 20),
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceAround,
                                    children: [
                                      _buildStat(studentsCount, 'Étudiants', 0),
                                      _buildStat(companiesCount, 'Entreprises', 1),
                                      _buildStat(
                                          satisfactionRate, 'Satisfaction', 2),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 24),

                                // Terms text with better formatting
                                Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade50,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: Colors.grey.shade200,
                                      width: 1,
                                    ),
                                  ),
                                  child: RichText(
                                    textAlign: TextAlign.center,
                                    text: TextSpan(
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.grey.shade600,
                                        height: 1.5,
                                      ),
                                      children: [
                                        const TextSpan(
                                            text:
                                                'En créant un compte ou vous identifiant, vous acceptez nos '),
                                        TextSpan(
                                          text: 'conditions d\'utilisation',
                                          style: TextStyle(
                                            color: Colors.blue.shade600,
                                            decoration:
                                                TextDecoration.underline,
                                          ),
                                          recognizer: TapGestureRecognizer()
                                            ..onTap = () {
                                              Navigator.pushNamed(
                                                context,
                                                '/terms-of-use',
                                              );
                                            },
                                        ),
                                        const TextSpan(text: ' et notre '),
                                        TextSpan(
                                          text: 'politique de confidentialité',
                                          style: TextStyle(
                                            color: Colors.blue.shade600,
                                            decoration:
                                                TextDecoration.underline,
                                          ),
                                          recognizer: TapGestureRecognizer()
                                            ..onTap = () {
                                              Navigator.pushNamed(
                                                context,
                                                '/privacy-policy',
                                              );
                                            },
                                        ),
                                      ],
                                    ),
                                  ),
                                ).animate()
                                    .fadeIn(delay: 1200.ms, duration: 700.ms)
                                    .slideY(begin: 0.1, end: 0),
                              ],
                            ),
                          ),
                        ),
                      ),

                      // Right side - Illustration with animated background
                      if (constraints.maxWidth > 1000)
                        Expanded(
                          flex: 5,
                          child: Stack(
                            children: [
                              _buildAnimatedBlob(
                                animation: _blob1Controller,
                                scaleAnimation: _scaleController,
                                color: Colors.purple.shade100,
                                size: 400,
                                initialOffset: const Offset(50, 100),
                                floatRadius: 60,
                              ),
                              _buildAnimatedBlob(
                                animation: _blob2Controller,
                                scaleAnimation: _scaleController,
                                color: Colors.blue.shade100,
                                size: 380,
                                initialOffset: const Offset(250, 150),
                                floatRadius: 70,
                              ),
                              _buildAnimatedBlob(
                                animation: _blob3Controller,
                                scaleAnimation: _scaleController,
                                color: Colors.green.shade100,
                                size: 240,
                                initialOffset: const Offset(150, 300),
                                floatRadius: 45,
                              ),
                              // Main illustration with subtle animation
                              TweenAnimationBuilder<double>(
                                tween: Tween(begin: 0, end: 1),
                                duration: const Duration(milliseconds: 800),
                                curve: Curves.easeOutCubic,
                                builder: (context, value, child) {
                                  return Transform.translate(
                                    offset: Offset(0, 20 * (1 - value)),
                                    child: Opacity(
                                      opacity: value,
                                      child: Center(
                                        child: Container(
                                          padding: const EdgeInsets.all(32),
                                          child: Image.asset(
                                            'assets/images/login_image.png',
                                            fit: BoxFit.contain,
                                          ),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ).animate()
                                  .fadeIn(delay: 400.ms, duration: 1.seconds)
                                  .scale(
                                    delay: 400.ms,
                                    duration: 800.ms,
                                    begin: const Offset(0.8, 0.8),
                                    curve: Curves.easeOutBack,
                                  ),
                            ],
                          ),
                        ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String value, String label, int index) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w600,
            color: Colors.blue.shade700,
          ),
        ).animate()
            .fadeIn(delay: (1000 + 100 * index).ms, duration: 500.ms)
            .scale(
              delay: (1000 + 100 * index).ms,
              duration: 400.ms,
              begin: const Offset(0.5, 0.5),
              curve: Curves.elasticOut,
            ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey.shade600,
          ),
        ).animate()
            .fadeIn(delay: (1100 + 100 * index).ms, duration: 500.ms),
      ],
    );
  }

  Widget _buildWelcomeButton({
    required VoidCallback onPressed,
    Widget? icon,
    required String label,
  }) {
    return Container(
      width: double.infinity,
      height: 48,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: Colors.white,
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(_isHovered ? 0.08 : 0.04),
            blurRadius: _isHovered ? 16 : 12,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  icon,
                  const SizedBox(width: 12),
                ],
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: Colors.black87,
                    letterSpacing: 0.1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedBlob({
    required AnimationController animation,
    required AnimationController scaleAnimation,
    required Color color,
    required double size,
    required Offset initialOffset,
    required double floatRadius,
  }) {
    return AnimatedBuilder(
      animation: Listenable.merge([animation, scaleAnimation]),
      builder: (context, child) {
        final scaleValue = 0.9 + (scaleAnimation.value * 0.2);
        return Transform.translate(
          offset: Offset(
            initialOffset.dx +
                floatRadius * math.cos(animation.value * 2 * math.pi),
            initialOffset.dy +
                floatRadius * math.sin(animation.value * 2 * math.pi),
          ),
          child: Transform.scale(
            scale: scaleValue,
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: color.withOpacity(0.5),
                borderRadius: BorderRadius.circular(size / 2),
                gradient: RadialGradient(
                  colors: [
                    color.withOpacity(0.5),
                    color.withOpacity(0.3),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
