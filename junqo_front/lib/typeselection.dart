import 'package:flutter/material.dart';
import 'package:junqo_front/hired_tools.dart';

class Typeselection extends StatelessWidget {
  const Typeselection({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Container(
          margin: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _header(context),
              _buttons(context),
            ],
          ),
        ),
      ),
    );
  }

  _header(context) {
    return const Column(
      children: [
        Text(
          "Comment junqo peut vous aider ?",
          style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  _buttons(context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      const SizedBox(height: 32),
      ElevatedButton(
        onPressed: (
        ) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ToolsPage()),
          );
        },
        style: ElevatedButton.styleFrom(
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Color.fromARGB(255, 134, 159, 241),
        ),
        child: const Text(
          "Trouvez un stage",
          style: TextStyle(fontSize: 20),
        ),
      ),
      const SizedBox(height: 32),
      ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Color.fromARGB(255, 134, 159, 241),
        ),
        child: const Text(
          "Trouvez un stage",
          style: TextStyle(fontSize: 20),
        ),
      ),
      const SizedBox(height: 32),
      ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Color.fromARGB(255, 134, 159, 241),
        ),
        child: const Text(
          "Trouvez un stage",
          style: TextStyle(fontSize: 20),
        ),
      ),
      const SizedBox(height: 32),
      ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(vertical: 16),
          backgroundColor: Color.fromARGB(255, 134, 159, 241),
        ),
        child: const Text(
          "Trouvez un stage",
          style: TextStyle(fontSize: 20),
        ),
      ),
    ],
  );
}
}