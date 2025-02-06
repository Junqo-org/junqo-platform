import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:ferry/ferry.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/pages/not_found_page.dart';
import 'package:junqo_front/router.dart';
import 'pages/welcome.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/shared/theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  final client = await initClient();

  GetIt.instance.registerLazySingleton<Client>(() => client);
  GetIt.instance.registerLazySingleton<AuthService>(() => AuthService(client));
  runApp(const JunqoApp());
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
          _themeMode == ThemeMode.dark ? ThemeMode.dark : ThemeMode.light;
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
