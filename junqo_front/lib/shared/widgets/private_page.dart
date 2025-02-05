import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:go_router/go_router.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/shared/errors/show_error_dialog.dart';

class PrivatePage extends StatefulWidget {
  final Widget child;

  const PrivatePage({super.key, required this.child});

  @override
  _PrivatePageState createState() => _PrivatePageState();
}

class _PrivatePageState extends State<PrivatePage> {
  final authService = GetIt.instance<AuthService>();

  Future<bool> _isLoggedIn() async {
    try {
      bool loggedIn = await authService.isLoggedIn();
      return loggedIn;
    } catch (e) {
      debugPrint("Error: $e");
      showErrorDialog(e.toString(), context);
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _isLoggedIn(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()), // Loading UI
          );
        }

        if (snapshot.hasError || snapshot.data == false) {
          // Navigate if not logged in
          Future.microtask(() {
            context.go('/login');
          });
          return SizedBox(); // Avoid UI flickering before navigation
        }

        return widget.child; // Render the actual page if logged in
      },
    );
  }
}
