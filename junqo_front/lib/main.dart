import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/core/log_service.dart';
import 'package:junqo_front/core/user_service.dart';
import 'package:junqo_front/pages/not_found_page.dart';
import 'package:junqo_front/router.dart';
import 'pages/welcome.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/shared/theme.dart';
import 'package:junqo_front/services/offer_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/core/student_profile_service.dart';
import 'package:junqo_front/core/company_profile_service.dart';
import 'package:junqo_front/core/cv_improvement_service.dart';
import 'package:junqo_front/services/pdf_processing_service.dart';
import 'package:junqo_front/core/messaging_service.dart';

void main() async {
  try {
    WidgetsFlutterBinding.ensureInitialized();
    await Hive.initFlutter();
    await dotenv.load(fileName: "config/.env", isOptional: true);

    // Initialize the REST client and register it first
    final client = RestClient();
    await client.initialize();
    GetIt.instance.registerSingleton<RestClient>(client);

    // Create and register API service second
    final apiService = ApiService(client);
    GetIt.instance.registerSingleton<ApiService>(apiService);

    // Then initialize all other services that depend on the API service
    final authService = AuthService(client);
    await authService.initialize();
    final userService = UserService(client);
    final offerService = OfferService(client);

    // Register the remaining services
    GetIt.instance.registerSingleton<AuthService>(authService);
    GetIt.instance.registerSingleton<UserService>(userService);
    GetIt.instance.registerSingleton<OfferService>(offerService);

    // Register profile services
    GetIt.instance.registerLazySingleton<StudentProfileService>(
        () => StudentProfileService());
    GetIt.instance.registerLazySingleton<CompanyProfileService>(
        () => CompanyProfileService());
        
    // Register CV improvement service
    GetIt.instance.registerLazySingleton<CvImprovementService>(
        () => CvImprovementService());
        
    // Register PDF processing service
    GetIt.instance.registerLazySingleton<PdfProcessingService>(
        () => PdfProcessingService());
        
    // Register messaging service
    GetIt.instance.registerLazySingleton<MessagingService>(
        () => MessagingService(client));

    runApp(const JunqoApp());
  } catch (e) {
    LogService.error('Failed to initialize application: $e');
    runApp(ErrorApp(error: e.toString()));
  }
}

class JunqoApp extends StatefulWidget {
  const JunqoApp({super.key});

  @override
  State<JunqoApp> createState() => _JunqoAppState();
}

class _JunqoAppState extends State<JunqoApp> {
  ThemeMode _themeMode = ThemeMode.system; // Uses system theme by default

  void toggleTheme() {
    setState(() {
      _themeMode =
          _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Junqo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _themeMode,
      initialRoute: '/',
      onGenerateRoute: AppRouter.generateRoute,
      onUnknownRoute: (settings) {
        return MaterialPageRoute(builder: (context) => const NotFoundPage());
      },
      home: const Welcome(),
    );
  }
}

class ErrorApp extends StatelessWidget {
  final String error;

  const ErrorApp({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Junqo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: Scaffold(
        body: Center(
          child: Text(
            'An error occurred: $error',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ),
      ),
    );
  }
}
