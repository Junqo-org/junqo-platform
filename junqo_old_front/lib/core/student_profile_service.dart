import 'package:flutter/foundation.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/student_profile.dart';

class StudentProfileService {
  final ApiService _apiService;
  StudentProfile? _studentProfile;

  StudentProfileService() : _apiService = GetIt.instance<ApiService>();

  StudentProfile? get studentProfile => _studentProfile;

  /// Récupère mon profil étudiant
  Future<StudentProfile?> getMyProfile() async {
    try {
      _studentProfile = await _apiService.getMyStudentProfile();
      return _studentProfile;
    } catch (e) {
      debugPrint('Error fetching student profile: $e');
      rethrow;
    }
  }

  /// Récupère un profil étudiant par son ID
  Future<StudentProfile?> getProfileById(String id) async {
    try {
      return await _apiService.getStudentProfileById(id);
    } catch (e) {
      debugPrint('Error fetching student profile: $e');
      rethrow;
    }
  }

  /// Met à jour mon profil étudiant
  Future<StudentProfile?> updateMyProfile({
    String? name,
    String? avatar,
    List<String>? skills,
    List<Education>? education,
    List<ExperienceDTO>? experiences,
    String? description,
    String? title,
    String? schoolName,
    int? age,
  }) async {
    try {
      // Préparer les données du profil pour l'API Service
      // Only include fields expected by the backend endpoint via ApiService
      final profileData = {
        if (name != null) 'name': name,
        if (avatar != null) 'avatar': avatar,
        // Skills are passed directly; ApiService might filter them if needed
        if (skills != null) 'skills': skills,
      };

      // Removed local filtering for skills, education, experiences
      // ApiService handles specific formatting/filtering if required before the HTTP call

      if (profileData.isEmpty) {
        // Nothing to update
        return _studentProfile;
      }

      debugPrint('Sending profile update data to ApiService: $profileData');
      _studentProfile = await _apiService.updateMyStudentProfile(profileData);
      return _studentProfile;
    } catch (e) {
      debugPrint('Error updating student profile: $e');
      rethrow;
    }
  }

  /// Recherche des profils étudiants avec filtres
  Future<Map<String, dynamic>> searchProfiles({
    List<String>? skills,
    String mode = 'any',
    int? offset,
    int? limit,
  }) async {
    try {
      return await _apiService.getStudentProfiles(
        skills: skills,
        mode: mode,
        offset: offset,
        limit: limit,
      );
    } catch (e) {
      debugPrint('Error searching student profiles: $e');
      rethrow;
    }
  }

  // ************ EXPERIENCES ************

  /// Ajoute une nouvelle expérience via l'API
  Future<ExperienceDTO> addExperience(ExperienceDTO newExperience) async {
    try {
      // Convert ExperienceDTO (without ID) to Map for API
      final experienceData = newExperience.toJson();
      experienceData.remove('id'); // Ensure ID is not sent for creation

      final createdExperience = await _apiService.createExperience(experienceData);

      // Optionally update the local profile state if needed immediately
      _studentProfile?.experiences?.add(createdExperience);

      return createdExperience;
    } catch (e) {
      debugPrint('Error adding experience in StudentProfileService: $e');
      rethrow; // Rethrow to be handled by the UI
    }
  }

  /// Supprime une expérience via l'API
  Future<bool> removeExperience(String experienceId) async {
    try {
      final success = await _apiService.deleteExperience(experienceId);
      if (success) {
        // Optionally update the local profile state if needed immediately
        _studentProfile?.experiences?.removeWhere((exp) => exp.id == experienceId);
      }
      return success;
    } catch (e) {
      debugPrint('Error removing experience in StudentProfileService: $e');
      rethrow; // Rethrow to be handled by the UI
    }
  }
} 