import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:hive/hive.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/enums/user_type.dart';

class AuthService {
  final RestClient client;
  final ApiService _apiService;
  late final Box<String> _userBox;
  bool? _isLoggedIn;

  AuthService(this.client) : _apiService = GetIt.instance<ApiService>();

  String? get token => client.token;
  String? get userId => _userBox.get('user');

  /// Initialize the auth service
  Future<void> initialize() async {
    int retries = 3;

    while (retries > 0) {
      try {
        _userBox = await Hive.openBox<String>('user');
        return;
      } catch (e, stack) {
        debugPrint('Error initializing Hive box: $e');
        debugPrint('$stack');
        retries--;
        if (retries == 0) {
          throw Exception(
              'Failed to initialize auth storage after multiple attempts: $e');
        }
        await Future.delayed(const Duration(seconds: 1));
      }
    }
  }

  /// Sign up a new user
  Future<void> signUp(
      String name, String email, String password, UserType type) async {
    // Validation
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      throw ArgumentError('Name, email, and password cannot be empty');
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      throw ArgumentError('Invalid email format');
    }
    if (password.length < 8) {
      throw ArgumentError('Password must be at least 8 characters long');
    }

    try {
      final data = await _apiService.signUp(name, email, password, type.value);

      final userId = data['user']['id'];
      final token = data['token'];

      if (userId != null) {
        await _userBox.put('user', userId);
      }
      
      if (token != null) {
        await client.saveToken(token);
        _isLoggedIn = true;
      } else {
        throw Exception('Token not found in response');
      }
    } catch (e) {
      debugPrint('Error during sign up: $e');
      rethrow;
    }
  }

  /// Sign in an existing user
  Future<void> signIn(String email, String password) async {
    // Validation
    if (email.isEmpty || password.isEmpty) {
      throw ArgumentError('Email and password cannot be empty');
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      throw ArgumentError('Invalid email format');
    }

    try {
      final data = await _apiService.signIn(email, password);

      final userId = data['user']['id'];
      final token = data['token'];

      if (userId != null) {
        await _userBox.put('user', userId);
      }
      
      if (token != null) {
        await client.saveToken(token);
        _isLoggedIn = true;
      } else {
        throw Exception('Token not found in response');
      }
    } catch (e) {
      debugPrint('Error during sign in: $e');
      rethrow;
    }
  }

  /// Log out the current user
  Future<void> logout() async {
    try {
      await client.clearToken();
      await _userBox.delete('user');
      _isLoggedIn = false;
      debugPrint('User logged out.');
    } catch (e) {
      debugPrint('Error during logout: $e');
      throw Exception('Failed to logout: $e');
    }
  }

  /// Check if the user is logged in
  Future<bool> isLoggedIn() async {
    if (token == null) {
      _isLoggedIn = false;
      return false;
    }

    if (_isLoggedIn == false) {
      return false;
    }

    try {
      final result = await _apiService.isLoggedIn();
      _isLoggedIn = result;
      return result;
    } catch (e) {
      if (e is RestApiException && e.statusCode == 401) {
        _isLoggedIn = false;
        _userBox.delete('user');
        client.clearToken();
        return false;
      }
      rethrow;
    }
  }
}
