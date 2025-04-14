import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:hive_flutter/hive_flutter.dart';
import 'package:junqo_front/core/config.dart';
import 'package:flutter/foundation.dart';

/// Client HTTP pour les appels à l'API REST
class RestClient {
  final http.Client _httpClient;
  late final Box<String> _authBox;

  RestClient() : _httpClient = http.Client();

  /// Initialise le client avec le stockage local pour l'authentification
  Future<void> initialize({bool clearBox = false}) async {
    try {
      _authBox = await Hive.openBox<String>('auth');

      if (clearBox) {
        await _authBox.clear();
      }
    } catch (e) {
      throw Exception('Failed to initialize auth storage: $e');
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

      try {
        if (response.body.isNotEmpty) {
          errorBody = jsonDecode(response.body) as Map<String, dynamic>;
        }
      } catch (e) {
        // En cas d'erreur de parsing, on utilise un corps d'erreur vide
        debugPrint('Error parsing error response: $e');
      }

      throw RestApiException(
        statusCode: response.statusCode,
        message: errorBody['message'] ?? 'Unknown error occurred',
        errors: errorBody['errors'],
      );
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
