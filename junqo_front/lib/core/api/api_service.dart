import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/endpoints.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/shared/dto/user_data.dart';
import 'package:junqo_front/shared/enums/user_type.dart';
import 'package:junqo_front/shared/enums/offer_enums.dart';
import 'package:junqo_front/shared/dto/student_profile.dart';
import 'package:junqo_front/shared/dto/company_profile.dart';
import 'package:flutter/foundation.dart';
import 'dart:convert'; // To be removed when getmyapplications is implemented correctly

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
        return (response)
            .map((offerJson) =>
                OfferData.fromJson(offerJson as Map<String, dynamic>))
            .toList();
      } else if (response is Map<String, dynamic> &&
          response.containsKey('offers')) {
        final List<dynamic> offersJson = response['offers'];
        return offersJson
            .map((offerJson) =>
                OfferData.fromJson(offerJson as Map<String, dynamic>))
            .toList();
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

  Future<Map<String, dynamic>> getAllOffersQuery(
      Map<String, String> query) async {
    try {
      final response = await client.getQuery(ApiEndpoints.offers, query: query);
      // The response is already a Map, no need to access .data
      final rows = response['rows'] as List<dynamic>;
      final count = response['count'] ?? 0;

      // Convert each row to an OfferData object
      final offers = rows.map((item) => OfferData.fromJson(item)).toList();

      return {
        'rows': offers,
        'count': count,
      };
    } catch (e) {
      debugPrint('Error fetching offers: $e');
      return {
        'rows': <OfferData>[],
        'count': 0,
      };
    }
  }

  /// Récupérer toutes les offres créées par l'utilisateur connecté
  Future<List<OfferData>> getMyOffers() async {
    try {
      final response = await client.get(ApiEndpoints.myOffers);

      if (response is List) {
        return (response)
            .map((offerJson) =>
                OfferData.fromJson(offerJson as Map<String, dynamic>))
            .toList();
      } else if (response is Map<String, dynamic> &&
          response.containsKey('offers')) {
        final List<dynamic> offersJson = response['offers'];
        return offersJson
            .map((offerJson) =>
                OfferData.fromJson(offerJson as Map<String, dynamic>))
            .toList();
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

  Future<Map<String, dynamic>> postulateOffer(String offerId) async {
    try {
      final response = await client.post(ApiEndpoints.postulateOffer(offerId));
      return response;
    } catch (e) {
      if (e is RestApiException &&
          (e.statusCode == 403 || e.statusCode == 404)) {
        // Peut-être que l'utilisateur n'est pas un étudiant ou l'offre n'existe pas
        return {'error': e.message};
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

  /// Créer une offre
  Future<OfferData> createOffer(OfferData offerData) async {
    final body = {
      'userId': offerData.userid,
      'title': offerData.title,
      'description': offerData.description,
      'status': OfferEnumMapper.mapStatusToBackend(offerData.status),
      'offerType': OfferEnumMapper.mapOfferTypeToBackend(offerData.offerType),
      'duration': offerData.duration.isNotEmpty
          ? int.tryParse(offerData.duration)
          : null,
      'salary':
          offerData.salary.isNotEmpty ? int.tryParse(offerData.salary) : null,
      'workLocationType':
          OfferEnumMapper.mapWorkContextToBackend(offerData.workLocationType),
      'skills': offerData.skills,
      'benefits': offerData.benefits,
      'educationLevel': offerData.educationLevel.isNotEmpty
          ? int.tryParse(offerData.educationLevel)
          : null,
    };

    final response = await client.post(ApiEndpoints.offers, body: body);
    return _createOfferDataFromJson(response);
  }

  /// Mettre à jour une offre
  Future<OfferData> updateOffer(String id, OfferData offerData) async {
    final body = {
      'title': offerData.title,
      'description': offerData.description,
      'status': OfferEnumMapper.mapStatusToBackend(offerData.status),
      'offerType': OfferEnumMapper.mapOfferTypeToBackend(offerData.offerType),
      'duration': offerData.duration.isNotEmpty
          ? int.tryParse(offerData.duration)
          : null,
      'salary':
          offerData.salary.isNotEmpty ? int.tryParse(offerData.salary) : null,
      'workLocationType':
          OfferEnumMapper.mapWorkContextToBackend(offerData.workLocationType),
      'skills': offerData.skills,
      'benefits': offerData.benefits,
      'educationLevel': offerData.educationLevel.isNotEmpty
          ? int.tryParse(offerData.educationLevel)
          : null,
    };

    try {
      // Utiliser la méthode PATCH qui est généralement utilisée pour les mises à jour partielles
      final response =
          await client.patch(ApiEndpoints.updateOffer(id), body: body);
      return _createOfferDataFromJson(response);
    } catch (e) {
      // Si l'erreur est liée à la méthode HTTP (par exemple si PATCH n'est pas supportée), essayer PUT
      if (e is RestApiException) {
        // Log l'erreur pour aider au débogage
        debugPrint('Erreur lors de la mise à jour de l\'offre: ${e.message}');

        // Si l'erreur est 404, cela peut signifier que l'endpoint n'est pas disponible
        if (e.statusCode == 404) {
          debugPrint('Endpoint non trouvé, essai avec URL alternative');

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
      if (e is RestApiException &&
          (e.statusCode == 403 || e.statusCode == 404)) {
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

  // ************ PROFILS ÉTUDIANTS ************

  /// Récupérer des profils étudiants avec filtrage
  Future<Map<String, dynamic>> getStudentProfiles({
    List<String>? skills,
    String mode = 'any',
    int? offset,
    int? limit,
  }) async {
    final Map<String, dynamic> queryParams = {};

    if (skills != null && skills.isNotEmpty) {
      queryParams['skills'] = skills.join(',');
    }

    if (mode == 'all' || mode == 'any') {
      queryParams['mode'] = mode;
    }

    if (offset != null) {
      queryParams['offset'] = offset.toString();
    }

    if (limit != null) {
      queryParams['limit'] = limit.toString();
    }

    String endpoint = ApiEndpoints.studentProfiles;
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');
      endpoint = '$endpoint?$queryString';
    }

    final response = await client.get(endpoint);

    if (response is Map<String, dynamic>) {
      final List<dynamic> rows = response['rows'] ?? [];
      final count = response['count'] ?? 0;

      final studentProfiles = rows
          .map((profile) =>
              StudentProfile.fromJson(profile as Map<String, dynamic>))
          .toList();

      return {
        'rows': studentProfiles,
        'count': count,
      };
    }

    return {
      'rows': <StudentProfile>[],
      'count': 0,
    };
  }

  /// Récupérer mon profil étudiant
  Future<StudentProfile> getMyStudentProfile() async {
    try {
      final response = await client.get(ApiEndpoints.myStudentProfile);

      // Handle case when response is a List instead of a Map
      if (response is List && response.isNotEmpty) {
        // If the first item is a Map containing student profile data, use it
        if (response[0] is Map<String, dynamic>) {
          return StudentProfile.fromJson(response[0] as Map<String, dynamic>);
        }
        // Otherwise throw an error about unexpected response format
        throw const FormatException(
            'Unexpected response format: Expected a Map or a List containing a Map');
      }

      return StudentProfile.fromJson(response);
    } catch (e) {
      // Re-throw with clearer error message
      if (e is TypeError) {
        throw FormatException('Error parsing API response: ${e.toString()}');
      }
      rethrow;
    }
  }

  /// Récupérer un profil étudiant par son ID
  Future<StudentProfile> getStudentProfileById(String id) async {
    try {
      final response = await client.get(ApiEndpoints.getStudentProfileById(id));

      // Handle case when response is a List instead of a Map
      if (response is List && response.isNotEmpty) {
        // If the first item is a Map containing student profile data, use it
        if (response[0] is Map<String, dynamic>) {
          return StudentProfile.fromJson(response[0] as Map<String, dynamic>);
        }
        // Otherwise throw an error about unexpected response format
        throw const FormatException(
            'Unexpected response format: Expected a Map or a List containing a Map');
      }

      return StudentProfile.fromJson(response);
    } catch (e) {
      // Re-throw with clearer error message
      if (e is TypeError) {
        throw FormatException('Error parsing API response: ${e.toString()}');
      }
      rethrow;
    }
  }

  /// Mettre à jour mon profil étudiant
  Future<StudentProfile> updateMyStudentProfile(
      Map<String, dynamic> profileData) async {
    dynamic apiResponse;
    try {
      // Préparer les données du profil pour le backend
      var requestData = Map<String, dynamic>.from(profileData);

      // Filtrer les compétences vides ou templates
      if (requestData.containsKey('skills')) {
        var skills = requestData['skills'];
        if (skills is List) {
          // Filtrer les compétences non vides
          var filteredSkills = skills
              .map((s) => s.toString().trim())
              .where((s) => s.isNotEmpty && s != 'Nouvelle compétence')
              .toList();

          // Ne mettre à jour les compétences que si la liste n'est pas vide
          if (filteredSkills.isNotEmpty) {
            requestData['skills'] = filteredSkills;
          } else {
            // Si toutes les compétences sont vides ou des templates, supprimer la clé
            requestData.remove('skills');
          }
        }
      }

      // Filtrer les formations vides ou templates
      if (requestData.containsKey('education')) {
        var education = requestData['education'];
        if (education is List) {
          // Filtrer les formations avec au moins une vraie valeur
          var filteredEducation = education
              .map((edu) {
                if (edu is Map) {
                  // Filtrer les champs vides
                  return Map<String, dynamic>.from(edu)
                    ..removeWhere((key, value) =>
                        value == null ||
                        (value is String && value.trim().isEmpty) ||
                        value == 'Nouvelle formation');
                } else if (edu is Education) {
                  var eduJson = edu.toJson();
                  // Filtrer les champs vides
                  eduJson.removeWhere((key, value) =>
                      value == null ||
                      (value is String && value.trim().isEmpty) ||
                      value == 'Nouvelle formation');
                  return eduJson;
                } else {
                  var val = edu.toString().trim();
                  return val.isNotEmpty && val != 'Nouvelle formation'
                      ? {'school': val}
                      : <String, dynamic>{};
                }
              })
              .where((edu) => edu.isNotEmpty)
              .toList();

          // Ne mettre à jour les formations que si la liste n'est pas vide
          if (filteredEducation.isNotEmpty) {
            requestData['education'] = filteredEducation;
          } else {
            // Si toutes les formations sont vides ou des templates, supprimer la clé
            requestData.remove('education');
          }
        }
      }

      // Debug info
      debugPrint('Sending filtered student profile data: $requestData');

      apiResponse = await client.patch(ApiEndpoints.updateMyStudentProfile,
          body: requestData);

      // Handle case when response is a List instead of a Map
      if (apiResponse is List) {
        if (apiResponse.isEmpty) {
          throw const FormatException('Empty response from API');
        }

        var firstItem = apiResponse[0];
        if (firstItem is Map<String, dynamic>) {
          return StudentProfile.fromJson(firstItem);
        } else {
          // Create a minimal profile with available data
          return StudentProfile(
            userId: profileData['userId'] ?? '',
            name: profileData['name'] ?? 'Unknown',
          );
        }
      }

      return StudentProfile.fromJson(apiResponse);
    } catch (e) {
      // Re-throw with clearer error message
      if (e is TypeError || e is FormatException) {
        // Print detailed debug info
        debugPrint('Error in updateMyStudentProfile: ${e.toString()}');
        debugPrint('Response type: ${apiResponse?.runtimeType}');
        debugPrint('Response data: $apiResponse');
        debugPrint('Request data: $profileData');

        // For dev debugging only: return a dummy profile to prevent app crash
        return StudentProfile(
          userId: profileData['userId'] ?? '',
          name: profileData['name'] ?? 'Error Profile',
          description: 'Error occurred: ${e.toString()}',
        );
      }
      rethrow;
    }
  }

  // ************ PROFILS ENTREPRISES ************

  /// Récupérer des profils d'entreprises avec filtrage
  Future<Map<String, dynamic>> getCompanyProfiles({
    List<String>? skills,
    String mode = 'any',
    int? offset,
    int? limit,
  }) async {
    final Map<String, dynamic> queryParams = {};

    if (skills != null && skills.isNotEmpty) {
      queryParams['skills'] = skills.join(',');
    }

    if (mode == 'all' || mode == 'any') {
      queryParams['mode'] = mode;
    }

    if (offset != null) {
      queryParams['offset'] = offset.toString();
    }

    if (limit != null) {
      queryParams['limit'] = limit.toString();
    }

    String endpoint = ApiEndpoints.companyProfiles;
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');
      endpoint = '$endpoint?$queryString';
    }

    final response = await client.get(endpoint);

    if (response is Map<String, dynamic>) {
      final List<dynamic> rows = response['rows'] ?? [];
      final count = response['count'] ?? 0;

      final companyProfiles = rows
          .map((profile) =>
              CompanyProfile.fromJson(profile as Map<String, dynamic>))
          .toList();

      return {
        'rows': companyProfiles,
        'count': count,
      };
    }

    return {
      'rows': <CompanyProfile>[],
      'count': 0,
    };
  }

  /// Récupérer mon profil entreprise
  Future<CompanyProfile> getMyCompanyProfile() async {
    try {
      final response = await client.get(ApiEndpoints.myCompanyProfile);

      // Handle case when response is a List instead of a Map
      if (response is List && response.isNotEmpty) {
        // If the first item is a Map containing company profile data, use it
        if (response[0] is Map<String, dynamic>) {
          return CompanyProfile.fromJson(response[0] as Map<String, dynamic>);
        }
        // Otherwise throw an error about unexpected response format
        throw const FormatException(
            'Unexpected response format: Expected a Map or a List containing a Map');
      }

      return CompanyProfile.fromJson(response);
    } catch (e) {
      // Re-throw with clearer error message
      if (e is TypeError) {
        throw FormatException('Error parsing API response: ${e.toString()}');
      }
      rethrow;
    }
  }

  /// Récupérer un profil entreprise par son ID
  Future<CompanyProfile> getCompanyProfileById(String id) async {
    try {
      final response = await client.get(ApiEndpoints.getCompanyProfileById(id));

      // Handle case when response is a List instead of a Map
      if (response is List && response.isNotEmpty) {
        // If the first item is a Map containing company profile data, use it
        if (response[0] is Map<String, dynamic>) {
          return CompanyProfile.fromJson(response[0] as Map<String, dynamic>);
        }
        // Otherwise throw an error about unexpected response format
        throw const FormatException(
            'Unexpected response format: Expected a Map or a List containing a Map');
      }

      return CompanyProfile.fromJson(response);
    } catch (e) {
      // Re-throw with clearer error message
      if (e is TypeError) {
        throw FormatException('Error parsing API response: ${e.toString()}');
      }
      rethrow;
    }
  }

  /// Mettre à jour mon profil entreprise
  Future<CompanyProfile> updateMyCompanyProfile(
      Map<String, dynamic> profileData) async {
    dynamic apiResponse;
    try {
      apiResponse = await client.patch(ApiEndpoints.updateMyCompanyProfile,
          body: profileData);

      // Handle case when response is a List instead of a Map
      if (apiResponse is List) {
        if (apiResponse.isEmpty) {
          throw const FormatException('Empty response from API');
        }

        var firstItem = apiResponse[0];
        if (firstItem is Map<String, dynamic>) {
          return CompanyProfile.fromJson(firstItem);
        } else {
          // Create a minimal profile with available data
          return CompanyProfile(
            userId: profileData['userId'] ?? '',
            name: profileData['name'] ?? 'Unknown',
          );
        }
      }

      return CompanyProfile.fromJson(apiResponse);
    } catch (e) {
      // Re-throw with clearer error message
      if (e is TypeError || e is FormatException) {
        // Print detailed debug info
        debugPrint('Error in updateMyCompanyProfile: ${e.toString()}');
        debugPrint('Response type: ${apiResponse?.runtimeType}');
        debugPrint('Response data: $apiResponse');

        // For dev debugging only: return a dummy profile to prevent app crash
        return CompanyProfile(
          userId: profileData['userId'] ?? '',
          name: profileData['name'] ?? 'Error Profile',
          description: 'Error occurred: ${e.toString()}',
        );
      }
      rethrow;
    }
  }

  bool isTestClient(int id) {
    //Should not be pushed , this is a test function
    if (id == 1) {
      return true;
    } else {
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getMyApplications() async {
    try {
      final response = await client.get(ApiEndpoints.getMyApplicationss());

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        // Format each item into a Map<String, dynamic>
        final List<Map<String, dynamic>> applications =
            data.map((item) => Map<String, dynamic>.from(item)).toList();

        return applications;
      } else {
        throw Exception(
          'Failed to fetch applications: ${response.statusCode} ${response.reasonPhrase}',
        );
      }
    } catch (e) {
      debugPrint(' Error in getMyApplications: $e');
      rethrow;
    }
  }
}
