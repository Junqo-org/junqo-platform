import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/endpoints.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/shared/dto/user_data.dart';
import 'package:junqo_front/shared/enums/user_type.dart';
import 'package:junqo_front/shared/enums/offer_enums.dart';
import 'package:junqo_front/shared/dto/student_profile.dart';
import 'package:junqo_front/shared/dto/company_profile.dart';
import 'package:flutter/foundation.dart';
import 'package:junqo_front/shared/dto/application_data.dart';
import 'package:junqo_front/shared/dto/application_query_result_data.dart';

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

  Future<Map<String, dynamic>> getAllStudentsQuery(
      Map<String, String> query) async {
    try {
      final response =
          await client.getQuery(ApiEndpoints.studentProfiles, query: query);
      // The response is already a Map, no need to access .data
      final rows = response['rows'] as List<dynamic>;
      final count = response['count'] ?? 0;

      // Convert each row to an OfferData object
      final offers = rows.map((item) => StudentProfile.fromJson(item)).toList();

      return {
        'rows': offers,
        'count': count,
      };
    } catch (e) {
      debugPrint('Error fetching offers: $e');
      return {
        'rows': <StudentProfile>[],
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

  Future<Map<String, dynamic>> recruitStudent(String sId) async {
    try {
      final response =
          await client.post(ApiEndpoints.enterprisesWantToRecruitStudents(sId));
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

  // ************ CANDIDATURES (APPLICATIONS) ************

  /// Récupérer toutes les candidatures pour une offre spécifique (pour l'entreprise propriétaire)
  Future<ApplicationQueryResultData> getApplicationsForOffer(String offerId, {int offset = 0, int limit = 10}) async {
    try {
      final Map<String, String> queryParams = {
        'offerId': offerId,
        'offset': offset.toString(),
        'limit': limit.toString(),
      };
      final response = await client.getQuery(
        ApiEndpoints.getApplicationsForOffer,
        query: queryParams,
      );
      // Assuming the response is directly the JSON for ApplicationQueryResultData
      return ApplicationQueryResultData.fromJson(response);
    } catch (e) {
      debugPrint('Error getting applications for offer $offerId: $e');
      // Return an empty result on error or rethrow based on how you handle errors
      if (e is RestApiException && e.statusCode == 404) {
         return ApplicationQueryResultData(rows: [], count: 0);
      }
      rethrow;
    }
  }

  /// Mettre à jour le statut d'une candidature
  Future<ApplicationData> updateApplicationStatus(String applicationId, String newStatus) async {
    try {
      final requestData = {
        'status': newStatus,
      };
      
      debugPrint('Updating application $applicationId with status: $newStatus');
      
      final response = await client.patch(
        ApiEndpoints.updateApplication(applicationId),
        body: requestData,
      );
      
      debugPrint('Application status updated successfully');
      return ApplicationData.fromJson(response);
    } catch (e) {
      debugPrint('Error updating application status: $e');
      rethrow;
    }
  }

  /// Récupérer mes candidatures (pour les entreprises)
  Future<List<ApplicationData>> getMyApplications() async {
    try {
      final response = await client.get('/applications/my');
      
      if (response is List) {
        return response.map((json) => ApplicationData.fromJson(json as Map<String, dynamic>)).toList();
      }
      
      return [];
    } catch (e) {
      debugPrint('Error getting my applications: $e');
      rethrow;
    }
  }

  // ************ SIMULATION D'ENTRETIEN ************

  /// Appel à l'API de simulation d'entretien pour générer une réponse
  Future<Map<String, dynamic>> simulateInterview({
    required String message,
    String? context,
  }) async {
    final body = {
      'message': message,
      if (context != null) 'context': context,
    };

    try {
      final response = await client.post(ApiEndpoints.interviewSimulation, body: body);
      return response;
    } catch (e) {
      debugPrint('Erreur lors de la simulation d\'entretien: $e');
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
      // Only include fields expected by the backend UpdateStudentProfileDTO
      var requestData = {
        if (profileData.containsKey('name')) 'name': profileData['name'],
        if (profileData.containsKey('avatar')) 'avatar': profileData['avatar'],
        if (profileData.containsKey('skills')) 'skills': profileData['skills'],
      };

      // Filtrer les compétences vides ou templates (if needed, backend might handle this)
      if (requestData.containsKey('skills')) {
        var skills = requestData['skills'];
        if (skills is List) {
          var filteredSkills = skills
              .map((s) => s.toString().trim())
              .where((s) => s.isNotEmpty && s != 'Nouvelle compétence')
              .toList();
          if (filteredSkills.isNotEmpty) {
            requestData['skills'] = filteredSkills;
          } else {
            requestData.remove('skills'); // Remove if empty after filtering
          }
        } else {
          requestData.remove('skills'); // Remove if not a list
        }
      }

      // Removed filtering for education and experiences as they are managed separately

      // Debug info
      debugPrint('Sending student profile update data: $requestData');

      // Use PATCH for partial updates
      apiResponse = await client.patch(ApiEndpoints.updateMyStudentProfile,
          body: requestData);

      // Handle response (assuming it returns the updated profile)
      if (apiResponse is Map<String, dynamic>) {
        return StudentProfile.fromJson(apiResponse);
      }
      // Handle unexpected list response (similar to getMyStudentProfile)
      else if (apiResponse is List &&
          apiResponse.isNotEmpty &&
          apiResponse[0] is Map<String, dynamic>) {
        return StudentProfile.fromJson(apiResponse[0] as Map<String, dynamic>);
      } else {
        throw FormatException(
            'Unexpected response format updating student profile: ${apiResponse?.runtimeType}');
      }
    } catch (e) {
      // Handle API errors more robustly
      String errorMessage = 'Failed to update student profile';
      if (e is RestApiException) {
        // Use the message already parsed by RestClient._handleResponse
        errorMessage = e.message;
        // Optional: Log additional details if available
        // if (e.errors != null) { debugPrint('Error details: ${e.errors}'); }
        debugPrint(
            'API Error (${e.statusCode}) during updateMyStudentProfile: $errorMessage');
      } else {
        // Handle other types of errors (network, etc.)
        errorMessage = e.toString();
        debugPrint(
            'Non-API Error during updateMyStudentProfile: $errorMessage');
      }
      // Rethrow a standard exception with a clearer message
      throw Exception(errorMessage);
    }
  }

  // ************ EXPERIENCES ************

  /// Create a new experience for the logged in student profile
  Future<ExperienceDTO> createExperience(
      Map<String, dynamic> experienceData) async {
    try {
      debugPrint('Sending create experience data: $experienceData');
      // Use the correct endpoint for creating user-specific experience
      final response = await client.post(
        ApiEndpoints.createMyExperience, // Updated endpoint
        body: experienceData,
      );
      // Assuming the backend returns the created experience object
      return ExperienceDTO.fromJson(response);
    } catch (e) {
      debugPrint('API Error during createExperience: $e');
      throw Exception('Failed to create experience: $e');
    }
  }

  /// Delete an experience belonging to the logged in user
  Future<bool> deleteExperience(String experienceId) async {
    try {
      // Use the correct endpoint for deleting user-specific experience
      await client.delete(
          ApiEndpoints.deleteMyExperience(experienceId)); // Updated endpoint
      // Assume success if no error is thrown
      // Backend might return { success: true } or just 204 No Content
      return true;
    } catch (e) {
      debugPrint('API Error during deleteExperience: $e');
      // Check for specific errors like 404 Not Found or 403 Forbidden if needed
      if (e is RestApiException &&
          (e.statusCode == 404 || e.statusCode == 403)) {
        return false;
      }
      // Rethrow for unexpected errors
      throw Exception('Failed to delete experience: $e');
    }
  }

  // ************ PROFILS ENTREPRISES ************

  /// Get company profiles based on query parameters
  Future<Map<String, dynamic>> getCompanyProfiles({
    List<String>? skills,
    String mode = 'any',
    int? offset,
    int? limit,
  }) async {
    try {
      final Map<String, String> queryParams = {};

      if (skills != null && skills.isNotEmpty) {
        // Backend expects skills as comma-separated list
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

      final response = await client.getQuery(ApiEndpoints.companyProfiles,
          query: queryParams);

      final List<dynamic> rows = response['rows'] as List<dynamic>;
      final int count = response['count'] as int;

      final List<CompanyProfile> profiles = rows
          .map((item) => CompanyProfile.fromJson(item as Map<String, dynamic>))
          .toList();

      return {
        'rows': profiles,
        'count': count,
      };
    } catch (e) {
      debugPrint('Error fetching company profiles: $e');
      return {
        'rows': <CompanyProfile>[],
        'count': 0,
      };
    }
  }

  /// Get my company profile
  Future<CompanyProfile> getMyCompanyProfile() async {
    try {
      final response = await client.get(ApiEndpoints.myCompanyProfile);
      return CompanyProfile.fromJson(response);
    } catch (e) {
      debugPrint('Error fetching my company profile: $e');
      rethrow;
    }
  }

  /// Get company profile by ID
  Future<CompanyProfile> getCompanyProfileById(String id) async {
    try {
      final response = await client.get(ApiEndpoints.getCompanyProfileById(id));
      return CompanyProfile.fromJson(response);
    } catch (e) {
      debugPrint('Error fetching company profile: $e');
      rethrow;
    }
  }

  /// Update company profile method (correct implementation)
  Future<CompanyProfile> updateMyCompanyProfile(
      Map<String, dynamic> profileData) async {
    try {
      // Explicitly filter out 'name' to avoid the API error
      final Map<String, dynamic> filteredData = {
        // Do NOT include 'name' here as per the API error
        if (profileData.containsKey('avatar')) 'avatar': profileData['avatar'],
        if (profileData.containsKey('description'))
          'description': profileData['description'],
        if (profileData.containsKey('websiteUrl'))
          'websiteUrl': profileData['websiteUrl'],
      };

      // Log what we're sending to help with debugging
      debugPrint('Sending update to company profile: $filteredData');

      // Make the API call
      final response = await client.patch(ApiEndpoints.updateMyCompanyProfile,
          body: filteredData);

      // Log the response
      debugPrint('API response: $response');

      // Parse and return the response
      return CompanyProfile.fromJson(response);
    } catch (e) {
      debugPrint('Error updating company profile: $e');
      rethrow;
    }
  }

  // ************ INTERVIEW SIMULATION ************

  /// Envoyer un message à la simulation d'entretien
  Future<Map<String, dynamic>> sendInterviewMessage(List<Map<String, String>> conversationHistory, String? context) async {
    return await client.post(ApiEndpoints.interviewSimulation, body: {
      'conversation': conversationHistory,
      'context': context,
    });
  }
  
  // ************ AMÉLIORATION CV ************
  
  /// Analyser un CV et obtenir des recommandations d'amélioration
  Future<Map<String, dynamic>> analyzeCv(String cvContent, {String? jobContext}) async {
    try {
      debugPrint('API Service: Préparation de la requête pour l\'analyse du CV');
      
      // Créer un objet de requête simple et conforme aux attentes du backend
      final Map<String, dynamic> requestData = {
        'cvContent': cvContent,
      };
      
      // Ajouter le jobContext uniquement s'il est spécifié
      if (jobContext != null && jobContext.isNotEmpty) {
        requestData['jobContext'] = jobContext;
      }
      
      debugPrint('API Service: Envoi de la requête, taille du contenu: ${cvContent.length} caractères');
      
      try {
        // S'assurer que l'endpoint est correct
        final response = await client.post(ApiEndpoints.analyzeCv, body: requestData);
        debugPrint('API Service: Réponse reçue avec succès');
        return response;
      } catch (e) {
        debugPrint('API Service: Erreur lors de la requête POST: $e');
        if (e is RestApiException && e.statusCode == 500) {
          debugPrint('API Service: Erreur 500 détectée, détails: ${e.message}');
        }
        rethrow;
      }
    } catch (e) {
      debugPrint('API Service: Erreur d\'analyse du CV: $e');
      rethrow;
    }
  }
}
