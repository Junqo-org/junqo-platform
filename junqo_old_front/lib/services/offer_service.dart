import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/shared/dto/application_query_result_data.dart';

class OfferService {
  final RestClient client;
  final ApiService _apiService;

  OfferService(this.client) : _apiService = GetIt.instance<ApiService>();

  /// Crée une nouvelle offre d'emploi
  Future<OfferData> createOffer(OfferData offerData) async {
    try {
      return await _apiService.createOffer(offerData);
    } catch (e) {
      debugPrint('Error creating offer: $e');
      rethrow;
    }
  }

  /// Récupère toutes les offres d'emploi
  Future<List<OfferData>> getAllOffers() async {
    try {
      return await _apiService.getAllOffers();
    } catch (e) {
      debugPrint('Error getting offers: $e');
      rethrow;
    }
  }

  /// Récupère toutes les offres créées par l'utilisateur connecté
  Future<List<OfferData>> getMyOffers() async {
    try {
      return await _apiService.getMyOffers();
    } catch (e) {
      debugPrint('Error getting my offers: $e');
      rethrow;
    }
  }

  /// Récupère une offre d'emploi par son ID
  Future<OfferData> getOfferById(String id) async {
    try {
      return await _apiService.getOfferById(id);
    } catch (e) {
      debugPrint('Error getting offer by ID: $e');
      rethrow;
    }
  }

  /// Met à jour une offre d'emploi existante
  Future<OfferData> updateOffer(String id, OfferData offerData) async {
    try {
      return await _apiService.updateOffer(id, offerData);
    } catch (e) {
      debugPrint('Error updating offer: $e');
      rethrow;
    }
  }

  /// Supprime une offre d'emploi
  Future<bool> deleteOffer(String id) async {
    try {
      return await _apiService.deleteOffer(id);
    } catch (e) {
      debugPrint('Error deleting offer: $e');
      rethrow;
    }
  }

  /// Récupère les candidatures pour une offre spécifique
  Future<ApplicationQueryResultData> getApplicationsForOffer(String offerId, {int offset = 0, int limit = 10}) async {
    try {
      return await _apiService.getApplicationsForOffer(offerId, offset: offset, limit: limit);
    } catch (e) {
      debugPrint('Error in OfferService getting applications for offer $offerId: $e');
      // Depending on your error handling strategy, you might return an empty list or rethrow
      // For consistency, let's rethrow or return a default empty object
      return ApplicationQueryResultData(rows: [], count: 0); // Or rethrow
    }
  }
}
