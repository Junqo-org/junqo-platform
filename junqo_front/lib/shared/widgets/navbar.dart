import 'package:flutter/material.dart';
import 'notification.dart';

class Navbar extends StatefulWidget {
  final int currentIndex;
  const Navbar({super.key, required this.currentIndex});

  @override
  State<Navbar> createState() => _NavbarState();
}

class _NavbarState extends State<Navbar> {
  late int _selectedIndex;
  OverlayEntry? _notificationOverlay;
  bool _isNotificationVisible = false;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.currentIndex;
  }

  @override
  void dispose() {
    _hideNotificationPopup();
    super.dispose();
  }

  void _navigateToPage(BuildContext context, int index) {
    if (_selectedIndex == index) return;
    
    // Ne pas naviguer si c'est l'index des notifications
    if (index == 2) return;
    
    setState(() {
      _selectedIndex = index;
    });

    String routeName;
    switch (index) {
      case 0:
        routeName = '/home';
        break;
      case 1:
        routeName = '/ia';
        break;
      case 3:
        routeName = '/messaging';
        break;
      case 4:
        routeName = '/profile';
        break;
      default:
        return;
    }

    Navigator.pushReplacementNamed(
      context,
      routeName,
    );
  }

  void _toggleNotificationPopup(BuildContext context, GlobalKey buttonKey) {
    if (_isNotificationVisible) {
      _hideNotificationPopup();
    } else {
      _showNotificationPopup(context, buttonKey);
    }
  }

  void _showNotificationPopup(BuildContext context, GlobalKey buttonKey) {
    final RenderBox button = buttonKey.currentContext!.findRenderObject() as RenderBox;
    final RenderBox overlay = Overlay.of(context).context.findRenderObject() as RenderBox;
    final buttonPosition = button.localToGlobal(Offset.zero, ancestor: overlay);

    _notificationOverlay = OverlayEntry(
      builder: (context) => Positioned(
        top: buttonPosition.dy + button.size.height + 8,
        right: 20,
        child: Material(
          elevation: 8,
          borderRadius: BorderRadius.circular(8),
          child: NotificationPopup(
            onClose: _hideNotificationPopup,
          ),
        ),
      ),
    );

    setState(() {
      _isNotificationVisible = true;
    });

    Overlay.of(context).insert(_notificationOverlay!);
  }

  void _hideNotificationPopup() {
    _notificationOverlay?.remove();
    _notificationOverlay = null;
    
    setState(() {
      _isNotificationVisible = false;
    });
  }

  Widget _buildNavItem(int index, {bool showLabel = false}) {
    final isSelected = _selectedIndex == index;
    final iconColor = isSelected ? const Color(0xFF2563EB) : Colors.grey.shade600;
    
    // Si c'est l'index des notifications
    if (index == 2) {
      final notificationKey = GlobalKey();
      return Material(
        key: notificationKey,
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _toggleNotificationPopup(context, notificationKey),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: showLabel ? 12 : 8,
              vertical: 6,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.notifications_outlined,
                  size: 24,
                  color: _isNotificationVisible ? const Color(0xFF2563EB) : Colors.grey.shade600,
                ),
                if (showLabel) ...[
                  const SizedBox(width: 6),
                  Text(
                    'Notifications',
                    style: TextStyle(
                      fontSize: 14,
                      color: iconColor,
                      fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      );
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _navigateToPage(context, index),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: showLabel ? 12 : 8,
            vertical: 6,
          ),
          child: showLabel
              ? Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_getIcon(index), size: 20, color: iconColor),
                    const SizedBox(width: 6),
                    Text(
                      _getLabel(index),
                      style: TextStyle(
                        fontSize: 14,
                        color: iconColor,
                        fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                  ],
                )
              : Icon(_getIcon(index), size: 22, color: iconColor),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 1000;

    return Material(
      elevation: 2,
      color: Colors.white,
      child: Container(
        height: isMobile ? 56 : 64,
        padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 24),
        child: isMobile ? _buildMobileNav() : _buildDesktopNav(),
      ),
    );
  }

  Widget _buildMobileNav() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        SizedBox(
          height: 32,
          child: Image.asset(
            'assets/images/junqo_logo.png',
            fit: BoxFit.contain,
          ),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < 5; i++) ...[
              if (i > 0) const SizedBox(width: 16),
              _buildNavItem(i),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildDesktopNav() {
    return Row(
      children: [
        SizedBox(
          height: 36,
          child: Image.asset(
            'assets/images/junqo_logo.png',
            fit: BoxFit.contain,
          ),
        ),
        const Spacer(),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < 5; i++) ...[
              if (i > 0) const SizedBox(width: 24),
              _buildNavItem(i, showLabel: true),
            ],
          ],
        ),
      ],
    );
  }

  IconData _getIcon(int index) {
    switch (index) {
      case 0:
        return Icons.home_outlined;
      case 1:
        return Icons.smart_toy_outlined;
      case 2:
        return Icons.notifications_outlined;
      case 3:
        return Icons.message_outlined;
      case 4:
        return Icons.person_outline;
      default:
        return Icons.home_outlined;
    }
  }

  String _getLabel(int index) {
    switch (index) {
      case 0:
        return 'Accueil';
      case 1:
        return 'IA';
      case 2:
        return 'Notifications';
      case 3:
        return 'Messagerie';
      case 4:
        return 'Profil';
      default:
        return '';
    }
  }
}