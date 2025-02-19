import 'package:ferry/ferry.dart';
import 'package:hive/hive.dart';
import 'package:flutter/foundation.dart';
import 'package:junqo_front/core/response_handler.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/is_logged_in.req.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/sign_in.req.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/sign_up.req.gql.dart';
import 'package:junqo_front/shared/errors/graphql_exception.dart';

class AuthService {
  final Client client;
  late final Box<String> _authBox;
  late final Box<String> _userBox;
  bool? _isLoggedIn;

  AuthService(this.client);

  String? get token => _authBox.get('token');
  String? get userId => _userBox.get('user');

  Future<void> initialize() async {
    int retries = 3;

    while (retries > 0) {
      try {
        _authBox = await Hive.openBox<String>('auth');
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

  Future<void> signUp(
      String name, String email, String password, GUserType type) async {
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      throw ArgumentError('Name, email, and password cannot be empty');
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      throw ArgumentError('Invalid email format');
    }
    if (password.length < 8) {
      throw ArgumentError('Password must be at least 8 characters long');
    }

    final request = GsignUpGetUserReq(
      (b) => b
        ..vars.name = name
        ..vars.email = email
        ..vars.password = password
        ..vars.type = type,
    );

    final response = await client.request(request).first;
    final data =
        await ResponseHandler.handleGraphQLResponse(response, "SignUp");
    if (data?.signUp.user.id != null) {
      await _userBox.put('user', data!.signUp.user.id);
    }
    await _saveToken(data?.signUp.token);
    _isLoggedIn = true;
  }

  Future<void> signIn(String email, String password) async {
    if (email.isEmpty || password.isEmpty) {
      throw ArgumentError('Name, email, and password cannot be empty');
    }
    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email)) {
      throw ArgumentError('Invalid email format');
    }
    if (password.length < 8) {
      throw ArgumentError('Password must be at least 8 characters long');
    }

    final request = GsignInGetUserReq(
      (b) => b
        ..vars.email = email
        ..vars.password = password,
    );

    final response = await client.request(request).first;
    final data =
        await ResponseHandler.handleGraphQLResponse(response, "SignIn");
    if (data?.signIn.user.id != null) {
      await _userBox.put('user', data!.signIn.user.id);
    }
    await _saveToken(data?.signIn.token);
    _isLoggedIn = true;
  }

  Future<void> logout() async {
    try {
      await _authBox.delete('token');
      await _userBox.delete('user');
      _isLoggedIn = false;
      debugPrint('User logged out.');
    } catch (e) {
      debugPrint('Error during logout: $e');
      throw Exception('Failed to logout: $e');
    }
  }

  Future<bool> isLoggedIn() async {
    if (token == null) {
      _isLoggedIn = false;
      return false;
    }

    if (_isLoggedIn == false) {
      return false;
    }

    final request = GisLoggedInReq((b) => b);

    final response = await client.request(request).first;

    try {
      final data = await ResponseHandler.handleGraphQLResponse(
          response, "Login status check");
      final result = data?.isLoggedIn;
      _isLoggedIn = result ?? false;
      return _isLoggedIn as bool;
    } catch (e) {
      if (e is GraphQLException &&
          e.errors?.any((error) => error.contains('Unauthorized')) == true) {
        _isLoggedIn = false;
        _userBox.delete('user');
        _authBox.delete('token');
        return false;
      }
      rethrow;
    }
  }

  Future<void> _saveToken(String? token) async {
    if (token != null) {
      await _authBox.put('token', token);
      debugPrint('Token saved successfully.');
      return;
    }
    throw 'Error: Token is null.';
  }
}
