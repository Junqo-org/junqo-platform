import 'package:go_router/go_router.dart';
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

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const Welcome(), routes: [
      GoRoute(
          path: 'app',
          builder: (context, state) =>
              const PrivatePage(child: const HomePage()),
          routes: [
            GoRoute(
                path: 'cv',
                builder: (context, state) =>
                    const PrivatePage(child: const CV())),
            GoRoute(
                path: 'ia',
                builder: (context, state) =>
                    const PrivatePage(child: const IAPage())),
            GoRoute(
                path: 'interview',
                builder: (context, state) =>
                    const PrivatePage(child: const Interview())),
            GoRoute(path: 'login', builder: (context, state) => const Login()),
            GoRoute(
                path: 'messaging',
                builder: (context, state) =>
                    const PrivatePage(child: const MessagingPage())),
            GoRoute(
                path: 'profile',
                builder: (context, state) =>
                    const PrivatePage(child: const ProfilePage())),
          ]),
      GoRoute(
          path: 'privacy-policy',
          builder: (context, state) => const PrivacyPolicy()),
      GoRoute(path: 'terms-of-use', builder: (context, state) => const Terms()),
      GoRoute(
          path: 'user-type-selection',
          builder: (context, state) => const UserTypeSelection(),
          routes: [
            GoRoute(
                path: 'register/:user_type',
                builder: (context, state) {
                  if (state.pathParameters['user_type'] == null) {
                    return const NotFoundPage();
                  }
                  return Register(
                      userType: state.pathParameters['user_type'] as String);
                }),
          ]),
    ]),
  ],
  errorBuilder: (context, state) {
    return const NotFoundPage();
  },
);
