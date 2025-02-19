import 'package:flutter/material.dart';
import 'package:junqo_front/core/log_service.dart';

class GraphQLException implements Exception {
  final String message;
  final List<String>? errors;

  GraphQLException(this.message, {this.errors});

  @override
  String toString() {
    if (errors?.isNotEmpty ?? false) {
      return "$message: ${errors!.join("\n")}";
    }
    return message;
  }

  void printError() {
    LogService.error("[GRAPHQL ERROR] ${toString()}");
  }
}
