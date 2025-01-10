import 'package:flutter/material.dart';
import 'pages/welcome.dart';
import 'pages/home_page.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build (BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Login Screen',
      home: HomePage(),
    );
  }
}
