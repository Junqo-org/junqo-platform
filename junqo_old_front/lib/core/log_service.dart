import 'package:flutter/material.dart';

class LogService {
  static void log(String message) {
    debugPrint('LOG: $message');
  }

  static void info(String message) {
    debugPrint('INFO: $message');
  }

  static void warning(String message) {
    debugPrint('WARNING: $message');
  }

  static void error(String message) {
    debugPrint('ERROR: $message');
  }
}
