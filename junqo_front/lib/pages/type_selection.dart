import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'register.dart';
import 'welcome.dart';
import 'login.dart';

class Selection extends StatefulWidget {
  const Selection({Key? key}) : super(key: key);

  @override
  State<Selection> createState() => _SelectionState();
}

class _SelectionState extends State<Selection> with TickerProviderStateMixin {
  late final AnimationController _blob1Controller;
  late final AnimationController _blob2Controller;
  late final AnimationController _blob3Controller;
  late final AnimationController _scaleController;

  String? _hoveredButton;

  @override
  void initState() {
    super.initState();
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
        child: Stack(
          children: [
            // Animated blobs
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
              size: 400,
              initialOffset: const Offset(150, 300),
              floatRadius: 65,
            ),

            // Main content
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 24, 40, 16),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back, color: Colors.blue.shade400),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const Welcome()),
                        ),
                      ),
                      const SizedBox(width: 16),
                      SizedBox(
                        height: 35,
                        child: Image.asset(
                          'assets/images/template_logo.png',
                          fit: BoxFit.contain,
                          alignment: Alignment.centerLeft,
                        ),
                      ),
                    ],
                  ),
                ),

                // Selection content
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Je souhaite m\'inscrire en tant que',
                            style: TextStyle(
                              fontSize: MediaQuery.of(context).size.width < 600 ? 24 : 34,
                              fontWeight: FontWeight.w300,
                              color: const Color(0xFF1A1A1A),
                              height: 1.2,
                              letterSpacing: -0.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 60),

                          // Selection buttons
                          LayoutBuilder(
                            builder: (context, constraints) {
                              if (constraints.maxWidth < 600) {
                                return Column(
                                  children: [
                                    _buildSelectionButton(
                                      title: 'École',
                                      description: 'Gérer mes étudiants',
                                      icon: Icons.school,
                                      color: Colors.blue.shade400,
                                    ),
                                    const SizedBox(height: 24),
                                    _buildSelectionButton(
                                      title: 'Entreprise',
                                      description: 'Recruter des talents',
                                      icon: Icons.business,
                                      color: Colors.purple.shade400,
                                    ),
                                    const SizedBox(height: 24),
                                    _buildSelectionButton(
                                      title: 'Étudiant',
                                      description: 'Trouver un stage',
                                      icon: Icons.person,
                                      color: Colors.green.shade400,
                                    ),
                                  ],
                                );
                              } else {
                                return Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Expanded(
                                      child: _buildSelectionButton(
                                        title: 'École',
                                        description: 'Gérer mes étudiants',
                                        icon: Icons.school,
                                        color: Colors.blue.shade400,
                                      ),
                                    ),
                                    const SizedBox(width: 24),
                                    Expanded(
                                      child: _buildSelectionButton(
                                        title: 'Entreprise',
                                        description: 'Recruter des talents',
                                        icon: Icons.business,
                                        color: Colors.purple.shade400,
                                      ),
                                    ),
                                    const SizedBox(width: 24),
                                    Expanded(
                                      child: _buildSelectionButton(
                                        title: 'Étudiant',
                                        description: 'Trouver un stage',
                                        icon: Icons.person,
                                        color: Colors.green.shade400,
                                      ),
                                    ),
                                  ],
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Login link
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Center(
                    child: GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const Login()),
                        );
                      },
                      child: Text.rich(
                        TextSpan(
                          text: 'Vous avez déjà un compte ? ',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey.shade700,
                          ),
                          children: [
                            TextSpan(
                              text: 'Connectez-vous',
                              style: TextStyle(
                                color: Colors.blue.shade600,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
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

  Widget _buildSelectionButton({
    required String title,
    required String description,
    required IconData icon,
    required Color color,
  }) {
    final isHovered = _hoveredButton == title;

    return MouseRegion(
      onEnter: (_) => setState(() => _hoveredButton = title),
      onExit: (_) => setState(() => _hoveredButton = null),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 300,
        transform: Matrix4.identity()..scale(isHovered ? 1.02 : 1.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isHovered ? color : Colors.grey.shade200,
            width: isHovered ? 2 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(isHovered ? 0.1 : 0.05),
              blurRadius: isHovered ? 20 : 10,
              offset: const Offset(0, 4),
              spreadRadius: isHovered ? 2 : 0,
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              String userType = '';
              switch (title) {
                case 'École':
                  userType = 'school';
                  break;
                case 'Entreprise':
                  userType = 'company';
                  break;
                case 'Étudiant':
                  userType = 'student';
                  break;
              }
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => Register(userType: userType),
                ),
              );
            },
            borderRadius: BorderRadius.circular(24),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    icon,
                    size: 64,
                    color: color,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF1A1A1A),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    description,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
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
        return Positioned(
          left: MediaQuery.of(context).size.width < 600
              ? initialOffset.dx / 2
              : initialOffset.dx,
          top: initialOffset.dy,
          child: Transform.translate(
            offset: Offset(
              floatRadius * math.cos(animation.value * 2 * math.pi),
              floatRadius * math.sin(animation.value * 2 * math.pi),
            ),
            child: Transform.scale(
              scale: scaleValue,
              child: Container(
                width: MediaQuery.of(context).size.width < 600 ? size / 2 : size,
                height: MediaQuery.of(context).size.width < 600 ? size / 2 : size,
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
          ),
        );
      },
    );
  }
}