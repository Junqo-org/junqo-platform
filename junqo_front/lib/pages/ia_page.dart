import 'package:flutter/material.dart';
import '../widgets/navbar.dart';
import 'cv.dart';
import 'interview.dart';
import 'motivation.dart';

class IAPage extends StatefulWidget {
  const IAPage({Key? key}) : super(key: key);

  @override
  State<IAPage> createState() => _IAPageState();
}

class _IAPageState extends State<IAPage> {
  String? _hoveredCard;

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
                            image: AssetImage('images/ai_background.png'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned.fill(
                        child: Container(
                          color: Colors.black.withOpacity(0.4),
                        ),
                      ),
                      const Positioned.fill(
                        child: Center(
                          child: Text(
                            "Boostez votre carrière grâce à l'IA",
                            style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Cartes de sélection des outils IA
                  Container(
                    margin: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            _buildSelectionCard(
                              context,
                              title: "Simulateur d'entretien",
                              description:
                                  "Entraînez-vous pour vos entretiens avec notre simulateur interactif.",
                              icon: Icons.person,
                              color: Colors.blue,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => Interview()),
                                );
                              },
                            ),
                            _buildSelectionCard(
                              context,
                              title: "Améliorer votre CV",
                              description:
                                  "Obtenez des conseils personnalisés pour rendre votre CV exceptionnel.",
                              icon: Icons.description,
                              color: Colors.green,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => CV()),
                                );
                              },
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            _buildSelectionCard(
                              context,
                              title: "Lettre de motivation",
                              description:
                                  "Créez une lettre de motivation percutante avec notre assistant IA.",
                              icon: Icons.mail,
                              color: Colors.orange,
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(builder: (_) => Motivation()),
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
                    color: Colors.grey[100],
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    child: Column(
                      children: [
                        const Text(
                          "Comment ça marche ?",
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            // Détecter si l'écran est petit (téléphone)
                            final isMobile = constraints.maxWidth < 1200;

                            return isMobile
                                ? Column(
                                    children: [
                                      _buildStep(
                                        number: "1",
                                        title: "Choisissez un outil",
                                        description:
                                            "Sélectionnez l'outil qui correspond à vos besoins.",
                                      ),
                                      const SizedBox(height: 16),
                                      _buildStep(
                                        number: "2",
                                        title: "Suivez les instructions",
                                        description:
                                            "Répondez aux questions et suivez les conseils IA.",
                                      ),
                                      const SizedBox(height: 16),
                                      _buildStep(
                                        number: "3",
                                        title: "Mettez en pratique",
                                        description:
                                            "Utilisez les recommandations pour réussir.",
                                      ),
                                    ],
                                  )
                                : Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      _buildStep(
                                        number: "1",
                                        title: "Choisissez un outil",
                                        description:
                                            "Sélectionnez l'outil qui correspond à vos besoins.",
                                      ),
                                      _buildStep(
                                        number: "2",
                                        title: "Suivez les instructions",
                                        description:
                                            "Répondez aux questions et suivez les conseils IA.",
                                      ),
                                      _buildStep(
                                        number: "3",
                                        title: "Mettez en pratique",
                                        description:
                                            "Utilisez les recommandations pour réussir.",
                                      ),
                                    ],
                                  );
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
    required Color color,
    required VoidCallback onTap,
  }) {
    final isHovered = _hoveredCard == title;

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
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isHovered ? color.withOpacity(0.1) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isHovered ? color : Colors.transparent,
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                CircleAvatar(
                  backgroundColor: color.withOpacity(0.2),
                  radius: 30,
                  child: Icon(icon, color: color, size: 30),
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isHovered ? color : Colors.black,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 14,
                    color: isHovered ? color : Colors.grey[600],
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
  }) {
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: Colors.blue,
          radius: 20,
          child: Text(
            number,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        Text(
          description,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}