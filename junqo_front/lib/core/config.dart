class AppConfig {
  // API GraphQL URL
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:4200/graphql',
  );

  // Nom des Box Hive
  static const String authBox = "auth";
  static const String graphqlCacheBox = "graphql";

  // Timeout pour les requêtes HTTP
  static const Duration httpTimeout = Duration(seconds: 10);

  // Activer/Désactiver les logs (utile en debug)
  static const bool enableLogging = true;
}
