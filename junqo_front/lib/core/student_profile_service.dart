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
    String? description,
    String? title,
    String? schoolName,
    int? age,
  }) async {
    try {
      // Préparer les données du profil
      final profileData = {
        if (name != null) 'name': name,
        if (avatar != null) 'avatar': avatar,
        if (description != null) 'description': description,
        if (title != null) 'title': title,
        if (schoolName != null) 'schoolName': schoolName,
        if (age != null) 'age': age,
      };

      // Traitement spécifique pour skills (compétences)
      if (skills != null) {
        // Filtrer les compétences vides ou templates
        var filteredSkills = skills
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty && s != 'Nouvelle compétence')
            .toList();
        
        if (filteredSkills.isNotEmpty) {
          profileData['skills'] = filteredSkills;
        }
      }

      // Traitement spécifique pour education (formations)
      if (education != null) {
        // Filtrer les formations vides ou templates
        var filteredEducation = education.where((edu) {
          // Vérifier si l'éducation a au moins un champ non vide et non template
          return edu.school != null && 
                 edu.school!.trim().isNotEmpty && 
                 edu.school != 'Nouvelle formation';
        }).map((e) => e.toJson()).toList();
        
        if (filteredEducation.isNotEmpty) {
          profileData['education'] = filteredEducation;
        }
      }

      if (profileData.isEmpty) {
        return _studentProfile;
      }

      debugPrint('Sending filtered profile data from service: $profileData');
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
} 