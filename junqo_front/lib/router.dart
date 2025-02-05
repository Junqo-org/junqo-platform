import 'package:flutter/material.dart';
import 'package:junqo_front/pages/cv.dart';
import 'package:junqo_front/pages/home_page.dart';
import 'package:junqo_front/pages/ia_page.dart';
import 'package:junqo_front/pages/interview.dart';
import 'package:junqo_front/pages/login.dart';
import 'package:junqo_front/pages/messaging_page.dart';
import 'package:junqo_front/pages/not_found_page.dart';
import 'package:junqo_front/pages/privacy_policy.dart';
import 'package:junqo_front/pages/profile_page.dart';
import 'package:junqo_front/pages/register.dart';
import 'package:junqo_front/pages/terms_of_use.dart';
import 'package:junqo_front/pages/user_type_selection.dart';
import 'package:junqo_front/pages/welcome.dart';
import 'package:junqo_front/shared/widgets/private_page.dart';

class AppRouter {
  // Fonction pour générer les routes de l'application
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const Welcome());
      case '/home':
        return MaterialPageRoute(
            builder: (_) => const PrivatePage(child: const HomePage()));
      case '/cv':
        return MaterialPageRoute(
            builder: (_) => const PrivatePage(child: const CV()));
      case '/ia':
        return MaterialPageRoute(
            builder: (_) => const PrivatePage(child: const IAPage()));
      case '/interview':
        return MaterialPageRoute(
            builder: (_) => const PrivatePage(child: const Interview()));
      case '/login':
        return MaterialPageRoute(builder: (_) => const Login());
      case '/messaging':
        return MaterialPageRoute(
            builder: (_) => const PrivatePage(child: const MessagingPage()));
      case '/privacy-policy':
        return MaterialPageRoute(builder: (_) => const PrivacyPolicy());
      case '/profile':
        return MaterialPageRoute(
            builder: (_) => const PrivatePage(child: const ProfilePage()));
      case '/register':
        final userType = settings.arguments as String;
        return MaterialPageRoute(
            builder: (_) => Register(
                  userType: userType,
                ));
      case '/terms-of-use':
        return MaterialPageRoute(builder: (_) => const Terms());
      case '/user-type-selection':
        return MaterialPageRoute(builder: (_) => const UserTypeSelection());
      default:
        return MaterialPageRoute(builder: (_) => const NotFoundPage());
    }
  }
}
