import 'package:flutter/material.dart';
import 'widget/bottom_bar.dart';
import 'simulator_page.dart';

class ToolsPage extends StatefulWidget {
  const ToolsPage({super.key});

  @override
  State<ToolsPage> createState() => _ToolsPageState();
}

class _ToolsPageState extends State<ToolsPage> {
  int _currentIndex = 2;

  void _onNavBarTap(int index) {
    setState(() {
      _currentIndex = index;
    });
    switch (index) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 134, 159, 241),
        title: const Text(
          "Entraînement",
          style: TextStyle(color: Colors.black),
        ),
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Outils d'améliorations",
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 8),
                Text(
                  "Maximise les chances de réussir ton processus de recrutement",
                  style: TextStyle(fontSize: 16),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildToolCard(
                  icon: Icons.people,
                  title: "Simulateur d'entretien",
                  description: "Outils permettant de t'entraîner pour tes entretiens à venir",
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SimulatorPage()),
                    );
                  },
                ),
                const SizedBox(height: 16),
                _buildToolCard(
                  icon: Icons.article,
                  title: "Aide création/amélioration CV",
                  description: "Outils permettant de te conseiller pour améliorer ton CV",
                  onTap: () {},
                ),
                const SizedBox(height: 16),
                _buildToolCard(
                  icon: Icons.edit,
                  title: "Aide création/amélioration lettre de motivation",
                  description: "Outils permettant de te conseiller pour améliorer ta lettre de motivation",
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _currentIndex,
        onTap: _onNavBarTap,
      ),
    );
  }

  Widget _buildToolCard({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, size: 40, color: const Color.fromARGB(255, 134, 159, 241)),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: const TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
          ],
        ),
      ),
    );
  }
}
