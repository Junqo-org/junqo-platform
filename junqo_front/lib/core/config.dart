import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String apiUrl = dotenv.env['API_URL'] ??
      const String.fromEnvironment('API_URL',
          defaultValue: 'http://localhost:4200/api/v1');

  // Nom des Box Hive
  static const String authBox = "auth";
  static const String graphqlCacheBox = "graphql";

  // Timeout pour les requêtes HTTP
  static const Duration httpTimeout = Duration(seconds: 10);

  // Activer/Désactiver les logs (utile en debug)
  static const bool enableLogging = kDebugMode;
}
