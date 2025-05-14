import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';

class CvImprovementService {
  final ApiService _apiService;
  
  CvImprovementService() : _apiService = GetIt.instance<ApiService>();
  
  /// Analyser un CV et obtenir des recommandations d'amélioration
  Future<String> analyzeCv(String cvContent, {String? jobContext}) async {
    try {
      debugPrint('Envoi du texte à l\'API (longueur: ${cvContent.length} caractères)');
      
      // Si le texte est trop long, le tronquer automatiquement
      String processedContent = cvContent;
      if (cvContent.length > 4000) {
        processedContent = cvContent.substring(0, 4000) + '... (texte tronqué)';
        debugPrint('Texte tronqué de ${cvContent.length} à 4000 caractères');
      }
      
      final response = await _apiService.analyzeCv(processedContent, jobContext: jobContext);
      
      if (response.containsKey('recommendations')) {
        debugPrint('Réponse reçue avec succès, longueur: ${response['recommendations'].length}');
        return response['recommendations'];
      } else {
        debugPrint('Format de réponse inattendu: $response');
        throw Exception('Format de réponse inattendu: ${response.keys.join(', ')}');
      }
    } catch (e) {
      debugPrint('Erreur lors de l\'analyse du CV: $e');
      
      // Si l'erreur contient une réponse HTTP 413 (payload too large), essayer avec un contenu plus court
      if (e.toString().contains('413')) {
        debugPrint('Erreur 413 - Contenu trop volumineux, nouvelle tentative avec contenu réduit');
        
        // Réduire davantage la taille du texte
        String shorterContent = cvContent.substring(0, cvContent.length > 2000 ? 2000 : cvContent.length) + 
            '... (texte considérablement tronqué en raison de limitations de taille)';
            
        try {
          final response = await _apiService.analyzeCv(shorterContent, jobContext: jobContext);
          
          if (response.containsKey('recommendations')) {
            return response['recommendations'] + 
                "\n\nNote: L'analyse a été effectuée sur une version tronquée de votre CV en raison de limitations techniques.";
          } else {
            throw Exception('Format de réponse inattendu après troncation');
          }
        } catch (retryError) {
          throw Exception('Échec de l\'analyse même après troncation du contenu: $retryError');
        }
      }
      
      // Pour les autres types d'erreurs, les relancer
      rethrow;
    }
  }
} 