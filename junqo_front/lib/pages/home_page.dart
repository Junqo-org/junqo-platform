import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/core/user_service.dart';
import 'package:junqo_front/pages/recruter_dashboard.dart';
import 'package:junqo_front/shared/dto/user_type.dart';
import '../shared/widgets/navbar.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final AuthService authService = GetIt.instance<AuthService>();
  final UserService userService = GetIt.instance<UserService>();
  UserType? userType;

  Future<void> getUserType() async {
    String? userId = authService.userId;
    if (userId == null) {
      return;
    }
    await userService.fetchUserData(userId);
    setState(() {
      userType = userService.userData?.type;
    });
  }

  @override
  Widget build(BuildContext context) {
    getUserType();

    if (userType == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    } else if (userType == UserType.COMPANY) {
      return RecruiterDashboard();
    }
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          const Navbar(currentIndex: 0),
          Expanded(
            child: SingleChildScrollView(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1200),
                  child: const Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Page d'Accueil",
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
