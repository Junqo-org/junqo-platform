import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/company_profile.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CompanyProfileService {
  final ApiService _apiService;
  CompanyProfile? _companyProfile;
  
  // Cache keys for local storage
  static const String _descriptionKey = 'company_profile_description';
  static const String _websiteUrlKey = 'company_profile_website_url';

  CompanyProfileService() : _apiService = GetIt.instance<ApiService>();

  CompanyProfile? get companyProfile => _companyProfile;

  /// Récupère mon profil entreprise
  Future<CompanyProfile?> getMyProfile() async {
    try {
      _companyProfile = await _apiService.getMyCompanyProfile();
      
      // Load cached values from local storage if API returns null values
      if (_companyProfile != null && 
          (_companyProfile!.description == null || _companyProfile!.websiteUrl == null)) {
        await _loadCachedValues();
      }
      
      return _companyProfile;
    } catch (e) {
      debugPrint('Error fetching company profile: $e');
      
      // Try to load cached values if API call fails
      if (_companyProfile != null) {
        await _loadCachedValues();
      }
      
      rethrow;
    }
  }

  /// Load cached values from local storage to supplement API data
  Future<void> _loadCachedValues() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Only create a new profile if we have one from API
      if (_companyProfile != null) {
        final cachedDescription = prefs.getString(_descriptionKey);
        final cachedWebsiteUrl = prefs.getString(_websiteUrlKey);
        
        // Create new profile with cached values where API returns null
        _companyProfile = CompanyProfile(
          userId: _companyProfile!.userId,
          name: _companyProfile!.name,
          avatar: _companyProfile!.avatar,
          description: _companyProfile!.description ?? cachedDescription,
          websiteUrl: _companyProfile!.websiteUrl ?? cachedWebsiteUrl,
        );
        
        debugPrint('Loaded cached values: description=$cachedDescription, websiteUrl=$cachedWebsiteUrl');
      }
    } catch (e) {
      debugPrint('Error loading cached values: $e');
    }
  }

  /// Met à jour mon profil entreprise
  Future<CompanyProfile?> updateMyProfile({
    String? avatar,
    String? description,
    String? websiteUrl,
  }) async {
    try {
      final profileData = {
        if (avatar != null) 'avatar': avatar,
        if (description != null) 'description': description,
        if (websiteUrl != null) 'websiteUrl': websiteUrl,
      };

      if (profileData.isEmpty) {
        return _companyProfile;
      }

      debugPrint('Calling updateMyCompanyProfile with data: $profileData');
      
      // Try API update first
      _companyProfile = await _apiService.updateMyCompanyProfile(profileData);
      
      // Check if the API returned nulls despite our update
      if (_companyProfile != null && 
          ((description != null && _companyProfile!.description == null) ||
           (websiteUrl != null && _companyProfile!.websiteUrl == null))) {
        
        // Backend didn't save our data, use local workaround with memory and storage
        _companyProfile = CompanyProfile(
          userId: _companyProfile!.userId,
          name: _companyProfile!.name,
          avatar: _companyProfile!.avatar,
          description: description ?? _companyProfile!.description,
          websiteUrl: websiteUrl ?? _companyProfile!.websiteUrl,
        );
        
        // Cache values locally until backend is fixed
        _saveToLocalCache(description, websiteUrl);
      }
      
      return _companyProfile;
    } catch (e) {
      debugPrint('Error updating company profile: $e');
      rethrow;
    }
  }
  
  /// Save values to local storage as backup
  Future<void> _saveToLocalCache(String? description, String? websiteUrl) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      if (description != null) {
        await prefs.setString(_descriptionKey, description);
      }
      
      if (websiteUrl != null) {
        await prefs.setString(_websiteUrlKey, websiteUrl);
      }
      
      debugPrint('Saved values to local cache: description=$description, websiteUrl=$websiteUrl');
    } catch (e) {
      debugPrint('Error saving to local cache: $e');
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