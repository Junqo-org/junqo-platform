import 'package:flutter/material.dart';
import '../widgets/navbar.dart';

class Motivation extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Navbar en haut avec l'index 1 pour IA
          const Navbar(currentIndex: 1),
          
          // Contenu principal
          Expanded(
            child: Center(
              child: Text(
                "Page de lettre de motivation",
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