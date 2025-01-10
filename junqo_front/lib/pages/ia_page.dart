import 'package:flutter/material.dart';
import '../widgets/navbar.dart';

class IAPage extends StatefulWidget {
  const IAPage({Key? key}) : super(key: key);

  @override
  State<IAPage> createState() => _IAPageState();
}

class _IAPageState extends State<IAPage> {
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
                children: [
                  // En-tête avec image de fond et texte
                  Container(
                    height: 200,
                    decoration: const BoxDecoration(
                      image: DecorationImage(
                        image: AssetImage('images/ai_background.png'),
                        fit: BoxFit.cover,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        "Boostez votre carrière grâce à l'IA",
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              color: Colors.black.withOpacity(0.5),
                              blurRadius: 4,
                              offset: const Offset(2, 2),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),

                  // Cartes de sélection
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Expanded(
                          child: _buildSelectionCard(
                            context,
                            title: "Simulateur d'entretien",
                            description:
                                "Entraînez-vous pour vos entretiens avec notre simulateur interactif.",
                            icon: Icons.person,
                            color: Colors.blue,
                            onTap: () {
                              // Navigation vers la page du simulateur d'entretien
                            },
                          ),
                        ),
                        const SizedBox(width: 24),
                        Expanded(
                          child: _buildSelectionCard(
                            context,
                            title: "Aide création/amélioration CV",
                            description:
                                "Obtenez des conseils personnalisés pour améliorer votre CV.",
                            icon: Icons.description,
                            color: Colors.green,
                            onTap: () {
                              // Navigation vers la page d'aide à la création/amélioration de CV
                            },
                          ),
                        ),
                        const SizedBox(width: 24),
                        Expanded(
                          child: _buildSelectionCard(
                            context,
                            title: "Aide création/amélioration lettre de motivation",
                            description:
                                "Créez une lettre de motivation percutante avec notre assistant IA.",
                            icon: Icons.mail,
                            color: Colors.orange,
                            onTap: () {
                              // Navigation vers la page d'aide à la création/amélioration de lettre de motivation
                            },
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Section "Comment ça marche"
                  Container(
                    color: Colors.grey[100],
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.all(24),
                          child: const Text(
                            "Comment ça marche ?",
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: _buildStep(
                                number: '1',
                                title: 'Choisissez un outil',
                                description:
                                    'Sélectionnez l\'outil qui correspond à vos besoins.',
                              ),
                            ),
                            const SizedBox(width: 24),
                            Expanded(
                              child: _buildStep(
                                number: '2',
                                title: 'Suivez les instructions',
                                description:
                                    'Répondez aux questions et suivez les conseils de notre IA.',
                              ),
                            ),
                            const SizedBox(width: 24),
                            Expanded(
                              child: _buildStep(
                                number: '3',
                                title: 'Améliorez vos compétences',
                                description:
                                    'Mettez en pratique les recommandations pour réussir.',
                              ),
                            ),
                          ],
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
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 32, color: color),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
          ],
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
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.blue,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 5,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Center(
            child: Text(
              number,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
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
