import 'package:flutter/material.dart';

class GraphQLException implements Exception {
  final String message;
  final List<String>? errors;

  GraphQLException(this.message, {this.errors});

  @override
  String toString() {
    if (errors != null && errors!.isNotEmpty) {
      return "$message: ${errors!.join("\n")}";
    }
    return message;
  }

  void printError() {
    debugPrint("[GRAPHQL ERROR] ${toString()}");
  }
}
