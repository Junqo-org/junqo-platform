import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/endpoints.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/shared/dto/user_data.dart';
import 'package:junqo_front/shared/enums/user_type.dart';
import 'package:junqo_front/shared/enums/offer_enums.dart';

/// Service centralisé pour effectuer des appels API REST
class ApiService {
  final RestClient client;

  ApiService(this.client);

  // ************ AUTHENTIFICATION ************

  /// Connexion
  Future<Map<String, dynamic>> signIn(String email, String password) async {
    return await client.post(ApiEndpoints.signIn, body: {
      'email': email,
      'password': password,
    });
  }

  /// Inscription
  Future<Map<String, dynamic>> signUp(
      String name, String email, String password, String userType) async {
    return await client.post(ApiEndpoints.signUp, body: {
      'name': name,
      'email': email,
      'password': password,
      'type': userType,
    });
  }

  /// Vérifier si l'utilisateur est connecté
  Future<bool> isLoggedIn() async {
    final response = await client.get(ApiEndpoints.isLoggedIn);
    return response['isLoggedIn'] ?? false;
  }

  // ************ OFFRES D'EMPLOI ************

  /// Récupérer toutes les offres
  Future<List<OfferData>> getAllOffers() async {
    try {
      final response = await client.get(ApiEndpoints.offers);
      
      if (response is List) {
        return (response as List)
            .map((offerJson) => OfferData.fromJson(offerJson as Map<String, dynamic>))
            .toList();
      } else if (response is Map<String, dynamic> && response.containsKey('offers')) {
        final List<dynamic> offersJson = response['offers'];
        return offersJson.map((offerJson) => OfferData.fromJson(offerJson as Map<String, dynamic>)).toList();
      } else {
        return [];
      }
    } catch (e) {
      // Si l'erreur est 404 (not found), on retourne une liste vide
      if (e is RestApiException && e.statusCode == 404) {
        return [];
      }
      rethrow;
    }
  }

  /// Récupérer toutes les offres créées par l'utilisateur connecté
  Future<List<OfferData>> getMyOffers() async {
    try {
      final response = await client.get(ApiEndpoints.myOffers);
      
      if (response is List) {
        return (response as List)
            .map((offerJson) => OfferData.fromJson(offerJson as Map<String, dynamic>))
            .toList();
      } else if (response is Map<String, dynamic> && response.containsKey('offers')) {
        final List<dynamic> offersJson = response['offers'];
        return offersJson.map((offerJson) => OfferData.fromJson(offerJson as Map<String, dynamic>)).toList();
      } else {
        return [];
      }
    } catch (e) {
      // Si l'erreur est 404 (not found), on retourne une liste vide
      if (e is RestApiException && e.statusCode == 404) {
        return [];
      }
      rethrow;
    }
  }

  /// Récupérer une offre par son ID
  Future<OfferData> getOfferById(String id) async {
    final response = await client.get(ApiEndpoints.getOfferById(id));
    return OfferData.fromJson(response);
  }

  /// Créer une instance OfferData à partir d'un JSON
  OfferData _createOfferDataFromJson(Map<String, dynamic> json) {
    return OfferData.fromJson(json);
  }

  /// Convertir un objet en List<String> avec gestion des nulls
  List<String> _parseStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((item) => item.toString()).toList();
    }
    return [];
  }

  /// Créer une offre
  Future<OfferData> createOffer(OfferData offerData) async {
    final body = {
      'offerInput': {
        'userId': offerData.userid,
        'title': offerData.title,
        'description': offerData.description,
        'status': OfferEnumMapper.mapStatusToBackend(offerData.status),
        'offerType': OfferEnumMapper.mapOfferTypeToBackend(offerData.offerType),
        'duration': offerData.duration.isNotEmpty ? int.tryParse(offerData.duration) : null,
        'salary': offerData.salary.isNotEmpty ? int.tryParse(offerData.salary) : null,
        'workLocationType': OfferEnumMapper.mapWorkContextToBackend(offerData.workLocationType),
        'skills': offerData.skills,
        'benefits': offerData.benefits,
        'educationLevel': offerData.educationLevel.isNotEmpty ? int.tryParse(offerData.educationLevel) : null,
      }
    };

    final response = await client.post(ApiEndpoints.offers, body: body);
    return _createOfferDataFromJson(response);
  }

  /// Mettre à jour une offre
  Future<OfferData> updateOffer(String id, OfferData offerData) async {
    final body = {
      'offerInput': {
        'title': offerData.title,
        'description': offerData.description,
        'status': OfferEnumMapper.mapStatusToBackend(offerData.status),
        'offerType': OfferEnumMapper.mapOfferTypeToBackend(offerData.offerType),
        'duration': offerData.duration.isNotEmpty ? int.tryParse(offerData.duration) : null,
        'salary': offerData.salary.isNotEmpty ? int.tryParse(offerData.salary) : null,
        'workLocationType': OfferEnumMapper.mapWorkContextToBackend(offerData.workLocationType),
        'skills': offerData.skills,
        'benefits': offerData.benefits,
        'educationLevel': offerData.educationLevel.isNotEmpty ? int.tryParse(offerData.educationLevel) : null,
      }
    };

    try {
      // Utiliser la méthode PATCH qui est généralement utilisée pour les mises à jour partielles
      final response = await client.patch(ApiEndpoints.updateOffer(id), body: body);
      return _createOfferDataFromJson(response);
    } catch (e) {
      // Si l'erreur est liée à la méthode HTTP (par exemple si PATCH n'est pas supportée), essayer PUT
      if (e is RestApiException) {
        // Log l'erreur pour aider au débogage
        print('Erreur lors de la mise à jour de l\'offre: ${e.message}');
        
        // Si l'erreur est 404, cela peut signifier que l'endpoint n'est pas disponible
        if (e.statusCode == 404) {
          print('Endpoint non trouvé, essai avec URL alternative');
          
          // Essayer avec une URL alternative
          final String alternativeEndpoint = '/offers/$id';
          final response = await client.put(alternativeEndpoint, body: body);
          return _createOfferDataFromJson(response);
        }
      }
      
      // Pour les autres erreurs, simplement les propager
      rethrow;
    }
  }

  /// Supprimer une offre
  Future<bool> deleteOffer(String id) async {
    try {
      final response = await client.delete(ApiEndpoints.deleteOffer(id));
      return response['isSuccessful'] ?? false;
    } catch (e) {
      // Si l'erreur est liée aux permissions (403) ou que l'offre n'existe pas (404)
      // on retourne false pour indiquer l'échec de l'opération
      if (e is RestApiException && (e.statusCode == 403 || e.statusCode == 404)) {
        return false;
      }
      // Pour les autres types d'erreurs, on les propage
      rethrow;
    }
  }

  // ************ UTILISATEURS ************

  /// Récupérer un utilisateur par son ID
  Future<UserData?> getUserById(String id) async {
    final response = await client.get(ApiEndpoints.getUserById(id));

    if (response.isEmpty) {
      return null;
    }

    UserType? userType;
    if (response['type'] != null) {
      userType = stringToUserType(response['type']);
    }

    return UserData(
      id: id,
      name: response['name'],
      email: response['email'],
      type: userType,
    );
  }

  /// Mettre à jour un utilisateur
  Future<UserData?> updateUser(String id, {String? name, String? email}) async {
    final body = {
      if (name != null) 'name': name,
      if (email != null) 'email': email,
    };

    if (body.isEmpty) {
      return null;
    }

    final response = await client.put(ApiEndpoints.updateUser(id), body: body);

    UserType? userType;
    if (response['type'] != null) {
      userType = stringToUserType(response['type']);
    }

    return UserData(
      id: id,
      name: response['name'],
      email: response['email'],
      type: userType,
    );
  }
}
