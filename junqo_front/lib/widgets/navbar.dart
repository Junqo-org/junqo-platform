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
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => page),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 600;

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
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: isMobile
          ? Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Logo visible en mode mobile
                Image.asset(
                  'assets/images/template_logo.png',
                  height: 35,
                  fit: BoxFit.contain,
                ),
                Row(
                  children: [
                    _buildNavItem(context, 0, Icons.home_outlined),
                    const SizedBox(width: 16),
                    _buildNavItem(context, 1, Icons.smart_toy),
                    const SizedBox(width: 16),
                    _buildNavItem(context, 2, Icons.notifications_outlined),
                    const SizedBox(width: 16),
                    _buildNavItem(context, 3, Icons.message_outlined),
                    const SizedBox(width: 16),
                    _buildNavItem(context, 4, Icons.person_outline),
                  ],
                ),
              ],
            )
          : Row(
              children: [
                // Logo à gauche
                Image.asset(
                  'assets/images/template_logo.png',
                  height: 35,
                  fit: BoxFit.contain,
                ),
                const Spacer(),
                // Espacement entre les items
                Row(
                  children: [
                    _buildNavItemWithLabel(context, 0, Icons.home_outlined, 'Accueil'),
                    const SizedBox(width: 24),
                    _buildNavItemWithLabel(context, 1, Icons.smart_toy, 'IA'),
                    const SizedBox(width: 24),
                    _buildNavItemWithLabel(context, 2, Icons.notifications_outlined, 'Notifications'),
                    const SizedBox(width: 24),
                    _buildNavItemWithLabel(context, 3, Icons.message_outlined, 'Messagerie'),
                    const SizedBox(width: 24),
                    _buildNavItemWithLabel(context, 4, Icons.person_outline, 'Profil'),
                  ],
                ),
              ],
            ),
    );
  }

  Widget _buildNavItem(BuildContext context, int index, IconData icon) {
    final isSelected = _selectedIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        _navigateToPage(context, index);
      },
      child: Icon(
        icon,
        color: isSelected ? Colors.blue.shade700 : Colors.grey.shade600,
        size: 24,
      ),
    );
  }

  Widget _buildNavItemWithLabel(BuildContext context, int index, IconData icon, String label) {
    final isSelected = _selectedIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        _navigateToPage(context, index);
      },
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
    );
  }
}
