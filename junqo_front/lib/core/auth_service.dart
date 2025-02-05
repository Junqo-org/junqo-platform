import 'package:ferry/ferry.dart';
import 'package:hive/hive.dart';
import 'package:flutter/foundation.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/is_logged_in.req.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/sign_in.req.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/sign_up.req.gql.dart';
import 'package:junqo_front/shared/errors/graphql_exception.dart';

class AuthService {
  final Client client;
  late final Box<String> authBox;
  bool? _isLoggedIn;

  AuthService(this.client) {
    _initialize();
  }

  String? get token => authBox.get('token');

  Future<void> _initialize() async {
    try {
      authBox = await Hive.openBox<String>('auth');
    } catch (e, stack) {
      debugPrint('Error initializing Hive box: $e');
      debugPrint('$stack');
    }
  }

  Future<void> signUp(
      String name, String email, String password, GUserType type) async {
    final request = GsignUpGetUserReq(
      (b) => b
        ..vars.name = name
        ..vars.email = email
        ..vars.password = password
        ..vars.type = type,
    );

    final response = await client.request(request).first;

    if (response.hasErrors) {
      if (response.graphqlErrors != null) {
        throw GraphQLException(
          "Registration failed",
          errors: response.graphqlErrors?.map((e) => e.message).toList(),
        );
      }
      if (response.linkException != null) {
        throw 'Link Exception: ${response.linkException?.originalStackTrace}';
      }
      return;
    }

    final token = response.data?.signUp.token;

    if (token != null) {
      await authBox.put('token', token);
      debugPrint('Token saved successfully.');
      return;
    }
    throw 'Error: Token is null.';
  }

  Future<void> signIn(String email, String password) async {
    final request = GsignInGetUserReq(
      (b) => b
        ..vars.email = email
        ..vars.password = password,
    );

    final response = await client.request(request).first;

    if (response.hasErrors) {
      if (response.graphqlErrors != null) {
        throw GraphQLException(
          "Sign in failed",
          errors: response.graphqlErrors?.map((e) => e.message).toList(),
        );
      }
      if (response.linkException != null) {
        throw 'Link Exception: ${response.linkException?.originalStackTrace}';
      }
      return;
    }

    final token = response.data?.signIn.token;

    if (token != null) {
      await authBox.put('token', token);
      debugPrint('Token saved successfully.');
      return;
    }
    throw 'Error: Token is null.';
  }

  Future<void> logout() async {
    try {
      await authBox.delete('token');
      debugPrint('User logged out.');
    } catch (e) {
      debugPrint('Error during logout: $e');
    }
  }

  Future<bool> isLoggedIn() async {
    final request = GisLoggedInReq((b) => b);

    if (token == null || _isLoggedIn == false) {
      return false;
    }

    final response = await client.request(request).first;

    if (response.hasErrors) {
      if (response.graphqlErrors != null) {
        if (response.graphqlErrors
                ?.any((e) => e.message.contains('Unauthorized')) ??
            false) {
          return false;
        }
        throw GraphQLException(
          "Error checking if user is logged in",
          errors: response.graphqlErrors?.map((e) => e.message).toList(),
        );
      }
      if (response.linkException != null) {
        throw 'Link Exception: ${response.linkException?.originalStackTrace}';
      }
      return false;
    }

    final result = response.data?.isLoggedIn;

    if (result != null) {
      if (result == true) {
        this._isLoggedIn = true;
        return true;
      }
      return false;
    }
    throw 'Error: Result is null.';
  }
}
