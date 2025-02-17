import 'package:flutter/material.dart';
import '../shared/widgets/navbar.dart';

class CV extends StatelessWidget {
  const CV({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Navbar en haut avec l'index 1 pour IA
          Navbar(currentIndex: 1),

          // Contenu principal
          Expanded(
            child: Center(
              child: Text(
                "Page d'amélioration de CV",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
