import 'package:flutter/material.dart';

class LogService {
  static void log(String message) async {
    debugPrint('LOG: $message');
  }

  static void info(String message) async {
    debugPrint('INFO: $message');
  }

  static void warning(String message) async {
    debugPrint('WARNING: $message');
  }

  static void error(String message) async {
    debugPrint('ERROR: $message');
  }
}
