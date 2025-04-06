import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';

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
  Future<void> deleteOffer(String id) async {
    try {
      await _apiService.deleteOffer(id);
    } catch (e) {
      debugPrint('Error deleting offer: $e');
      rethrow;
    }
  }
}

