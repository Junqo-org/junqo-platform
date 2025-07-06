import 'package:flutter/material.dart';
import '../shared/widgets/navbar.dart';

class IAPage extends StatefulWidget {
  const IAPage({super.key});

  @override
  State<IAPage> createState() => _IAPageState();
}

class _IAPageState extends State<IAPage> {
  String? _hoveredCard;

  // Consistent color palette
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate900 = Color(0xFF0F172A);
  static const Color indigo600 = Color(0xFF4F46E5);
  static const Color skyBlue500 = Color(0xFF0EA5E9); // For "Simulateur d'entretien"
  static const Color emerald500 = Color(0xFF10B981); // For "Améliorer votre CV"
  static const Color amber500 = Color(0xFFF59E0B); // For "Lettre de motivation"

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
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Section en-tête
                  Stack(
                    children: [
                      Container(
                        height: 220,
                        decoration: const BoxDecoration(
                          image: DecorationImage(
                            image:
                                AssetImage('assets/images/ai_background.png'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned.fill(
                        child: Container(
                          color: Colors.black.withOpacity(0.45),
                        ),
                      ),
                      Positioned.fill(
                        child: Center(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0),
                            child: Text(
                              "Boostez votre carrière grâce à l'IA",
                              style: TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                shadows: [
                                  Shadow(
                                    offset: Offset(0, 1),
                                    blurRadius: 3.0,
                                    color: Colors.black.withOpacity(0.5),
                                  ),
                                ],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Cartes de sélection des outils IA
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
                    child: Column(
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSelectionCard(
                              context,
                              title: "Simulateur d'entretien",
                              description:
                                  "Entraînez-vous pour vos entretiens avec notre simulateur interactif.",
                              icon: Icons.question_answer_outlined,
                              baseColor: skyBlue500,
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  '/interview-simulation-select',
                                );
                              },
                            ),
                            const SizedBox(width: 16),
                            _buildSelectionCard(
                              context,
                              title: "Améliorer votre CV",
                              description:
                                  "Obtenez des conseils personnalisés pour rendre votre CV exceptionnel.",
                              icon: Icons.description_outlined,
                              baseColor: emerald500,
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  '/cv',
                                );
                              },
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSelectionCard(
                              context,
                              title: "Lettre de motivation",
                              description:
                                  "Créez une lettre de motivation percutante avec notre assistant IA.",
                              icon: Icons.mail_outline_rounded,
                              baseColor: amber500,
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  '/motivation',
                                );
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Section "Comment ça marche"
                  Container(
                    color: slate50,
                    padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                    child: Column(
                      children: [
                        Text(
                          "Comment ça marche ?",
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: slate900,
                          ),
                        ),
                        const SizedBox(height: 24),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final isMobile = constraints.maxWidth < 1200;

                            Widget step1 = _buildStep(
                              number: "1",
                              title: "Choisissez un outil",
                              description:
                                  "Sélectionnez l'outil qui correspond à vos besoins.",
                              icon: Icons.touch_app_outlined,
                            );
                            Widget step2 = _buildStep(
                              number: "2",
                              title: "Suivez les instructions",
                              description:
                                  "Répondez aux questions et suivez les conseils IA.",
                              icon: Icons.lightbulb_outline_rounded,
                            );
                            Widget step3 = _buildStep(
                              number: "3",
                              title: "Mettez en pratique",
                              description:
                                  "Utilisez les recommandations pour réussir.",
                              icon: Icons.check_circle_outline_rounded,
                            );

                            if (isMobile) {
                              return Column(
                                children: [
                                  step1,
                                  const SizedBox(height: 24),
                                  step2,
                                  const SizedBox(height: 24),
                                  step3,
                                ],
                              );
                            } else {
                              return Row(
                                mainAxisAlignment: MainAxisAlignment.spaceAround,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(child: step1),
                                  const SizedBox(width: 20),
                                  Expanded(child: step2),
                                  const SizedBox(width: 20),
                                  Expanded(child: step3),
                                ],
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectionCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color baseColor,
    required VoidCallback onTap,
  }) {
    final isHovered = _hoveredCard == title;
    final Color iconBackgroundColor = isHovered ? baseColor.withOpacity(0.15) : baseColor.withOpacity(0.1);
    final Color cardBackgroundColor = isHovered ? baseColor.withOpacity(0.03) : Colors.white;
    final Color borderColor = isHovered ? baseColor.withOpacity(0.7) : slate200;

    return Expanded(
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        onEnter: (_) => setState(() => _hoveredCard = title),
        onExit: (_) => setState(() => _hoveredCard = null),
        child: GestureDetector(
          onTap: onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.all(8),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
            decoration: BoxDecoration(
              color: cardBackgroundColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: borderColor,
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: isHovered ? baseColor.withOpacity(0.1) : Colors.black.withOpacity(0.05),
                  blurRadius: isHovered ? 12 : 8,
                  offset: isHovered ? const Offset(0, 6) : const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                CircleAvatar(
                  backgroundColor: iconBackgroundColor,
                  radius: 32,
                  child: Icon(icon, color: baseColor, size: 30),
                ),
                const SizedBox(height: 16),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: isHovered ? baseColor : slate800,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14,
                    color: isHovered ? baseColor.withOpacity(0.9) : slate600,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStep({
    required String number,
    required String title,
    required String description,
    required IconData icon,
  }) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: indigo600,
          radius: 24,
          child: Text(
            number,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Icon(icon, color: indigo600, size: 36),
        const SizedBox(height: 12),
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: slate900,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        Text(
          description,
          style: TextStyle(
            fontSize: 15,
            color: slate600,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
