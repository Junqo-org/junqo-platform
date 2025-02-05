import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

void showErrorDialog(String errorMessage, BuildContext context) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text(
        "Error",
        style: TextStyle(color: Colors.red),
      ),
      content: Text(
        errorMessage,
        style: const TextStyle(color: Colors.red),
      ),
      actions: [
        TextButton(
          onPressed: () => context.pop(),
          child: Text("OK"),
        ),
      ],
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
    ),
  );
}
