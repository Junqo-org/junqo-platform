import 'package:flutter/material.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profil"),
        BottomNavigationBarItem(icon: Icon(Icons.work), label: "Offres"),
        BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: "Entraînement"),
        BottomNavigationBarItem(icon: Icon(Icons.chat), label: "Chat"),
      ],
      selectedItemColor: const Color.fromARGB(255, 134, 159, 241),
      unselectedItemColor: Colors.grey,
    );
  }
}
