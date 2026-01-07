import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:hive_flutter/hive_flutter.dart';
import 'package:junqo_front/core/config.dart';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

/// Client HTTP pour les appels à l'API REST
class RestClient {
  final http.Client _httpClient;
  late final Box<String> _authBox;

  RestClient() : _httpClient = http.Client();

  /// Initialise le client avec le stockage local pour l'authentification
  Future<void> initialize({bool clearBox = false}) async {
    int retries = 5;
    final int initialRetries = retries;
    int delayMs = 100;

    while (retries > 0) {
      try {
        _authBox = await Hive.openBox<String>('auth');

        if (clearBox) {
          await _authBox.clear();
        }

        debugPrint('Auth storage initialized successfully');
        return;
      } catch (e, stack) {
        retries--;
        debugPrint(
            'Error initializing auth storage (attempt ${initialRetries - retries}/$initialRetries): $e');

        if (retries == 0) {
          debugPrint('Stack trace: $stack');
          throw Exception(
              'Failed to initialize auth storage after multiple attempts: $e');
        }

        await Future.delayed(
            Duration(milliseconds: delayMs * (initialRetries - retries + 1)));
      }
    }
  }

  /// Retourne le token d'authentification s'il existe
  String? get token => _authBox.get('token');

  /// Sauvegarde le token d'authentification
  Future<void> saveToken(String token) async {
    await _authBox.put('token', token);
  }

  /// Supprime le token d'authentification
  Future<void> clearToken() async {
    await _authBox.delete('token');
  }

  /// Headers par défaut pour toutes les requêtes
  Map<String, String> get _headers {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  /// Envoie une requête GET
  Future<dynamic> get(String endpoint) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');

    debugPrint('GET request to: $url');
    try {
      final response = await _httpClient.get(
        url,
        headers: _headers,
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during GET request: $e');
      rethrow;
    }
  }

  Future<dynamic> getQuery(String endpoint,
      {Map<String, dynamic>? query}) async {
    Uri url = Uri.parse('${AppConfig.apiUrl}$endpoint');

    if (query != null && query.isNotEmpty) {
      url = url.replace(
          queryParameters:
              query.map((key, value) => MapEntry(key, value.toString())));
    }

    debugPrint('GET (with query) request to: $url');

    try {
      final response = await _httpClient.get(
        url,
        headers: _headers,
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during GET (with query) request: $e');
      rethrow;
    }
  }

  /// Envoie une requête POST
  Future<Map<String, dynamic>> post(String endpoint,
      {Map<String, dynamic>? body}) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');

    debugPrint('POST request to: $url');
    debugPrint('POST body: $body');

    try {
      final response = await _httpClient.post(
        url,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during POST request: $e');
      rethrow;
    }
  }

  /// Envoie une requête PUT
  Future<Map<String, dynamic>> put(String endpoint,
      {Map<String, dynamic>? body}) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');

    debugPrint('PUT request to: $url');
    debugPrint('PUT body: $body');

    try {
      final response = await _httpClient.put(
        url,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during PUT request: $e');
      rethrow;
    }
  }

  /// Envoie une requête PATCH
  Future<Map<String, dynamic>> patch(String endpoint,
      {Map<String, dynamic>? body}) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');

    debugPrint('PATCH request to: $url');
    debugPrint('PATCH headers to: $_headers');
    debugPrint('PATCH body: $body');

    try {
      final response = await _httpClient.patch(
        url,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during PATCH request: $e');
      rethrow;
    }
  }

  /// Envoie une requête DELETE
  Future<Map<String, dynamic>> delete(String endpoint) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');

    debugPrint('DELETE request to: $url');

    try {
      final response = await _httpClient.delete(
        url,
        headers: _headers,
      );

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during DELETE request: $e');
      rethrow;
    }
  }

  /// Gère les réponses HTTP et les erreurs
  dynamic _handleResponse(http.Response response) {
    debugPrint('Response status code: ${response.statusCode}');
    debugPrint('Response headers: ${response.headers}');
    debugPrint('Response body: ${response.body}');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        return {};
      }

      final decoded = jsonDecode(response.body);
      // Return the decoded JSON as is (can be Map or List)
      return decoded;
    } else {
      Map<String, dynamic> errorBody = {};
      String errorMessage = 'Unknown API error occurred';
      dynamic errorDetails;

      try {
        if (response.body.isNotEmpty) {
          errorBody = jsonDecode(response.body) as Map<String, dynamic>;
          // Extract message more robustly
          if (errorBody.containsKey('message')) {
              var msgData = errorBody['message'];
              if (msgData is List) {
                 errorMessage = msgData.join(', '); // Join list elements
              } else if (msgData is String) {
                 errorMessage = msgData;
              }
          } else if (errorBody.containsKey('error')) {
              // Fallback to 'error' field if 'message' is missing
              errorMessage = errorBody['error'].toString();
          }
          errorDetails = errorBody['errors']; // Keep the original errors if they exist
        }
      } catch (e) {
        // If JSON parsing fails, use the raw response body as message
        errorMessage = response.body;
        debugPrint('Error parsing error response body: $e');
      }

      throw RestApiException(
        statusCode: response.statusCode,
        message: errorMessage, // Use the parsed or fallback message
        errors: errorDetails,
      );
    }
  }

  /// Envoie une requête multipart (pour les uploads de fichiers)
  Future<Map<String, dynamic>> multipartRequest(
    String endpoint,
    String filePath,
    String fieldName,
  ) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');
    debugPrint('Multipart POST request (from path) to: $url');

    try {
      var request = http.MultipartRequest('POST', url);
      request.files.add(await http.MultipartFile.fromPath(
        fieldName,
        filePath,
        filename: p.basename(filePath), // Use path.basename here
      ));

      _headers.forEach((key, value) {
        request.headers[key] = value;
      });

      final streamedResponse = await _httpClient.send(request).timeout(AppConfig.httpTimeout);
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during multipart POST request (from path): $e');
      rethrow;
    }
  }

  /// Envoie une requête multipart (pour les uploads de fichiers depuis bytes - WEB)
  Future<Map<String, dynamic>> multipartRequestFromBytes(
    String endpoint,
    Uint8List fileBytes,
    String filename,
    String fieldName,
  ) async {
    final url = Uri.parse('${AppConfig.apiUrl}$endpoint');
    debugPrint('Multipart POST request (from bytes) to: $url for file: $filename');

    try {
      var request = http.MultipartRequest('POST', url);
      request.files.add(http.MultipartFile.fromBytes(
        fieldName,
        fileBytes,
        filename: filename,
      ));

      _headers.forEach((key, value) {
        // For web, Content-Type for multipart/form-data is handled by the browser
        // if (key.toLowerCase() != 'content-type') {
           request.headers[key] = value;
        // }
      });
      // Crucially, for web, do not set Content-Type manually here for the overall request,
      // as the browser needs to set it with the correct boundary.
      // Let http.MultipartRequest handle it or the browser.
      // If there are issues, this might be a place to check.

      final streamedResponse = await _httpClient.send(request).timeout(AppConfig.httpTimeout);
      final response = await http.Response.fromStream(streamedResponse);

      return _handleResponse(response);
    } catch (e) {
      debugPrint('Error during multipart POST request (from bytes): $e');
      rethrow;
    }
  }

  /// Ferme le client HTTP
  void close() {
    _httpClient.close();
  }
}

/// Exception pour les erreurs d'API REST
class RestApiException implements Exception {
  final int statusCode;
  final String message;
  final dynamic errors;

  RestApiException({
    required this.statusCode,
    required this.message,
    this.errors,
  });

  @override
  String toString() => 'RestApiException: [$statusCode] $message';
}
