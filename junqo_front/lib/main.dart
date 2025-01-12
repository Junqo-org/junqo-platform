import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:ferry/ferry.dart';
import 'pages/welcome.dart';
import 'package:junqo_front/client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final client = await initClient();
  // Register the client to be accessible globally
  GetIt.instance.registerLazySingleton<Client>(() => client);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  
  @override
  Widget build (BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Login Screen',
      home: Welcome(),
    );
  }
}
