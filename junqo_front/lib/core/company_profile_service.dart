import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/company_profile.dart';

class CompanyProfileService {
  final ApiService _apiService;
  CompanyProfile? _companyProfile;

  CompanyProfileService() : _apiService = GetIt.instance<ApiService>();

  CompanyProfile? get companyProfile => _companyProfile;

  /// Récupère mon profil entreprise
  Future<CompanyProfile?> getMyProfile() async {
    try {
      _companyProfile = await _apiService.getMyCompanyProfile();
      return _companyProfile;
    } catch (e) {
      debugPrint('Error fetching company profile: $e');
      rethrow;
    }
  }

  /// Récupère un profil entreprise par son ID
  Future<CompanyProfile?> getProfileById(String id) async {
    try {
      return await _apiService.getCompanyProfileById(id);
    } catch (e) {
      debugPrint('Error fetching company profile: $e');
      rethrow;
    }
  }

  /// Met à jour mon profil entreprise
  Future<CompanyProfile?> updateMyProfile({
    String? name,
    String? avatar,
    String? description,
    String? websiteUrl,
    String? industry,
    String? location,
  }) async {
    try {
      final profileData = {
        if (name != null) 'name': name,
        if (avatar != null) 'avatar': avatar,
        if (description != null) 'description': description,
        if (websiteUrl != null) 'websiteUrl': websiteUrl,
        if (industry != null) 'industry': industry,
        if (location != null) 'location': location,
      };

      if (profileData.isEmpty) {
        return _companyProfile;
      }

      _companyProfile = await _apiService.updateMyCompanyProfile(profileData);
      return _companyProfile;
    } catch (e) {
      debugPrint('Error updating company profile: $e');
      rethrow;
    }
  }

  /// Recherche des profils entreprises avec filtres
  Future<Map<String, dynamic>> searchProfiles({
    List<String>? skills,
    String mode = 'any',
    int? offset,
    int? limit,
  }) async {
    try {
      return await _apiService.getCompanyProfiles(
        skills: skills,
        mode: mode,
        offset: offset,
        limit: limit,
      );
    } catch (e) {
      debugPrint('Error searching company profiles: $e');
      rethrow;
    }
  }
} 