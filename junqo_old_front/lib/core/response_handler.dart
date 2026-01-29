import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:junqo_front/core/client.dart';

/// Classe utilitaire pour gérer les erreurs et les réponses de l'API REST
class ResponseHandler {
  /// Vérifie si une réponse contient des erreurs
  static void checkForErrors(Map<String, dynamic> response, String operationName) {
    if (response.containsKey('error') || response.containsKey('errors')) {
      final errorMessages = response.containsKey('error') 
          ? [response['error']] 
          : (response['errors'] as List<dynamic>).map((e) => e.toString()).toList();
          
      throw RestApiException(
        statusCode: 400,
        message: 'Error in $operationName: ${errorMessages.join(", ")}',
        errors: errorMessages,
      );
    }
  }
  
  /// Analyse une chaîne JSON en Map et vérifie les erreurs
  static Map<String, dynamic> parseAndCheckJson(String jsonString, String operationName) {
    try {
      final Map<String, dynamic> response = jsonDecode(jsonString) as Map<String, dynamic>;
      checkForErrors(response, operationName);
      return response;
    } catch (e) {
      if (e is RestApiException) {
        rethrow;
      }
      throw RestApiException(
        statusCode: 500,
        message: 'Failed to parse JSON response: $e',
      );
    }
  }

  /// Gère une exception d'API REST
  static void handleException(RestApiException e, {String? context}) {
    final errorMessage = context != null 
        ? '$context: ${e.message}' 
        : e.message;
        
    debugPrint('API Error: $errorMessage');
    if (e.errors != null) {
      for (final error in e.errors) {
        debugPrint('  - $error');
      }
    }
    
    // Ici, on peut ajouter des comportements spécifiques en fonction du code d'erreur
    // Par exemple: gérer différemment les erreurs 401 (non autorisé), 404 (non trouvé), etc.
    switch (e.statusCode) {
      case 401:
        debugPrint('Authentication error: User is not authorized');
        break;
      case 404:
        debugPrint('Resource not found');
        break;
      case 500:
        debugPrint('Server error');
        break;
    }
    
    // On peut également envoyer l'erreur à un service de monitoring
    // LogService.logError(e);
    
    // Relance l'exception pour qu'elle soit gérée en amont
    throw e;
  }
}
