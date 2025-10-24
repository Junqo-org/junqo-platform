import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';

/// Service dédié à l'extraction et au traitement du texte à partir de fichiers PDF
class PdfProcessingService {
  /// Extraire le texte d'un document PDF avec des options avancées
  Future<String> extractTextFromPdf(Uint8List pdfBytes, {
    bool preserveFormatting = true,
    bool cleanupText = true,
  }) async {
    try {
      // Charger le document PDF
      final PdfDocument document = PdfDocument(inputBytes: pdfBytes);
      final int pageCount = document.pages.count;
      
      debugPrint('Traitement de PDF: $pageCount pages détectées');
      
      // Extraire le texte avec le PdfTextExtractor
      final PdfTextExtractor extractor = PdfTextExtractor(document);
      final StringBuffer textBuffer = StringBuffer();
      
      // Extraire et traiter chaque page
      for (int i = 1; i <= pageCount; i++) {
        try {
          String pageText = extractor.extractText(startPageIndex: i - 1, endPageIndex: i - 1);
          
          if (cleanupText) {
            pageText = _cleanupExtractedText(pageText);
          }
          
          if (pageText.trim().isNotEmpty) {
            if (preserveFormatting) {
              textBuffer.writeln('--- Page $i ---');
            }
            
            textBuffer.writeln(pageText);
            
            if (preserveFormatting) {
              textBuffer.writeln();
            }
          }
        } catch (e) {
          debugPrint('Erreur lors de l\'extraction de la page $i: $e');
          textBuffer.writeln('Impossible d\'extraire le texte de la page $i.');
        }
      }
      
      // Libérer les ressources
      document.dispose();
      
      String result = textBuffer.toString().trim();
      
      // Si aucun texte n'a été extrait, c'est peut-être un PDF scanné/image
      if (result.isEmpty) {
        return "Ce PDF ne contient pas de texte extractible. Il s'agit probablement d'un document scanné ou d'images. Pour l'analyser, il faudrait un OCR (reconnaissance optique de caractères).";
      }
      
      debugPrint('Extraction PDF terminée : ${result.length} caractères extraits');
      return result;
    } catch (e) {
      debugPrint('Erreur critique lors de l\'extraction du PDF: $e');
      return "Erreur lors de l'extraction du texte du PDF: $e";
    }
  }
  
  /// Obtenir une version optimisée du texte pour l'analyse par IA
  String prepareTextForAI(String extractedText, {String? jobContext}) {
    try {
      // Si le texte est vide ou trop court
      if (extractedText.trim().length < 50) {
        return extractedText;
      }
      
      // Nettoyer davantage le texte pour éliminer tout formatage problématique
      String cleanedText = extractedText
          .replaceAll(RegExp(r'--- Page \d+ ---'), '') // Supprimer les marqueurs de page
          .replaceAll(RegExp(r'\n{3,}'), '\n\n')      // Normaliser les sauts de ligne
          .trim();
      
      // Limiter la taille du texte pour éviter les problèmes d'API
      const int maxLength = 3000; // Réduire la limite pour plus de sécurité
      if (cleanedText.length > maxLength) {
        cleanedText = cleanedText.substring(0, maxLength) + 
            "\n...\n[Contenu tronqué - texte trop long pour l'analyse complète]";
      }
      
      debugPrint('Texte préparé pour l\'IA : ${cleanedText.length} caractères');
      return cleanedText;
    } catch (e) {
      debugPrint('Erreur lors de la préparation du texte pour l\'IA: $e');
      // En cas d'erreur, retourner une version simplifiée du texte original
      if (extractedText.length > 3000) {
        return extractedText.substring(0, 3000);
      }
      return extractedText;
    }
  }
  
  /// Nettoyer le texte extrait pour améliorer sa qualité
  String _cleanupExtractedText(String text) {
    if (text.isEmpty) return text;
    
    String result = text;
    
    // Supprimer les caractères non imprimables
    result = result.replaceAll(RegExp(r'[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]'), '');
    
    // Normaliser les espaces
    result = result.replaceAll(RegExp(r'\s+'), ' ');
    
    // Normaliser les sauts de ligne (garder les doubles sauts de ligne pour les paragraphes)
    result = result.replaceAll(RegExp(r'\n{3,}'), '\n\n');
    
    // Supprimer les espaces en début/fin de ligne
    final lines = result.split('\n');
    result = lines.map((line) => line.trim()).join('\n');
    
    // Supprimer les lignes vides consécutives
    result = result.replaceAll(RegExp(r'^\s*$\n', multiLine: true), '');
    
    return result;
  }
} 