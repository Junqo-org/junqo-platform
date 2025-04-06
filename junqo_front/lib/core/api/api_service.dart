import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/endpoints.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/shared/dto/user_data.dart';
import 'package:junqo_front/shared/enums/user_type.dart';

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
    final response = await client.get(ApiEndpoints.offers);
    final List<dynamic> offersJson = response['offers'];

    return offersJson
        .map((offerJson) => _createOfferDataFromJson(offerJson))
        .toList();
  }

  /// Récupérer une offre par son ID
  Future<OfferData> getOfferById(String id) async {
    final response = await client.get(ApiEndpoints.getOfferById(id));
    return _createOfferDataFromJson(response);
  }

  /// Créer une instance OfferData à partir d'un JSON
  OfferData _createOfferDataFromJson(Map<String, dynamic> json) {
    return OfferData(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      offerType: json['offerType'] ?? '',
      duration: json['duration'] ?? '',
      salary: json['salary'] ?? '',
      workLocationType: json['workLocationType'] ?? '',
      skills: _parseStringList(json['skills']),
      benefits: _parseStringList(json['benefits']),
      educationLevel: json['educationLevel'] ?? '',
      userid: json['userId'] ?? '',
      status: json['status'] ?? '',
    );
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
      'title': offerData.title,
      'description': offerData.description,
      'offerType': offerData.offerType,
      'duration': offerData.duration,
      'salary': offerData.salary,
      'workLocationType': offerData.workLocationType,
      'skills': offerData.skills,
      'benefits': offerData.benefits,
      'educationLevel': offerData.educationLevel,
      'userId': offerData.userid,
      'status': offerData.status,
    };

    final response = await client.post(ApiEndpoints.offers, body: body);
    return _createOfferDataFromJson(response);
  }

  /// Mettre à jour une offre
  Future<OfferData> updateOffer(String id, OfferData offerData) async {
    final body = {
      'title': offerData.title,
      'description': offerData.description,
      'offerType': offerData.offerType,
      'duration': offerData.duration,
      'salary': offerData.salary,
      'workLocationType': offerData.workLocationType,
      'skills': offerData.skills,
      'benefits': offerData.benefits,
      'educationLevel': offerData.educationLevel,
      'status': offerData.status,
    };

    final response = await client.put(ApiEndpoints.updateOffer(id), body: body);
    return _createOfferDataFromJson(response);
  }

  /// Supprimer une offre
  Future<void> deleteOffer(String id) async {
    await client.delete(ApiEndpoints.deleteOffer(id));
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
