import 'package:flutter/material.dart';
import '../pages/home_page.dart';
import '../pages/ia_page.dart';
import '../pages/messaging_page.dart';
import '../pages/profile_page.dart';

class Navbar extends StatefulWidget {
  final int currentIndex;
  const Navbar({Key? key, required this.currentIndex}) : super(key: key);

  @override
  State<Navbar> createState() => _NavbarState();
}

class _NavbarState extends State<Navbar> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.currentIndex;
  }

  void _navigateToPage(BuildContext context, int index) {
    Widget page;
    switch (index) {
      case 0:
        page = const HomePage();
        break;
      case 1:
        page = const IAPage();
        break;
      case 2:
        // Page notifications à implémenter
        return;
      case 3:
        page = const MessagingPage();
        break;
      case 4:
        page = const ProfilePage();
        break;
      default:
        return;
    }

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => page),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          // Logo
          Image.asset(
            'assets/images/template_logo.png',
            height: 35,
            fit: BoxFit.contain,
          ),
          const SizedBox(width: 16),

          // Navigation items
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                _buildNavItem(context, 0, Icons.home_outlined, 'Accueil'),
                _buildNavItem(context, 1, Icons.smart_toy, 'IA'),
                _buildNavItem(context, 2, Icons.notifications_outlined, 'Notifications'),
                _buildNavItem(context, 3, Icons.message_outlined, 'Messagerie'),
                _buildNavItem(context, 4, Icons.person_outline, 'Profil'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, int index, IconData icon, String label) {
    final isSelected = _selectedIndex == index;

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedIndex = index;
          });
          _navigateToPage(context, index);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: isSelected ? Colors.blue.shade700 : Colors.grey.shade600,
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? Colors.blue.shade700 : Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}