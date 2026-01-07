import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/user_data.dart';

class UserService {
  final RestClient client;
  final ApiService _apiService;
  UserData? _userData;

  UserService(this.client) : _apiService = GetIt.instance<ApiService>();

  UserData? get userData => _userData;

  /// Récupère les données d'un utilisateur par son ID
  Future<UserData?> fetchUserData(String id) async {
    try {
      _userData = await _apiService.getUserById(id);
      return _userData;
    } catch (e) {
      debugPrint('Error fetching user data: $e');
      rethrow;
    }
  }
  
  /// Met à jour les données d'un utilisateur
  Future<UserData?> updateUserData(String id, {String? name, String? email}) async {
    try {
      if (name == null && email == null) {
        return _userData;
      }
      
      _userData = await _apiService.updateUser(id, name: name, email: email);
      return _userData;
    } catch (e) {
      debugPrint('Error updating user data: $e');
      rethrow;
    }
  }
}
