import 'package:junqo_front/shared/enums/user_type.dart';

class CompanyProfile {
  final String userId;
  final String name;
  final String? avatar;
  final String? description;
  final String? websiteUrl;
  final String? industry;
  final String? location;

  CompanyProfile({
    required this.userId,
    required this.name,
    this.avatar,
    this.description,
    this.websiteUrl,
    this.industry,
    this.location,
  });

  factory CompanyProfile.fromJson(Map<String, dynamic> json) {
    // Safe conversion function to handle potential list/dynamic values
    String? safeString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      if (value is List && value.isNotEmpty) return value[0].toString();
      return value.toString();
    }

    return CompanyProfile(
      userId: safeString(json['userId']) ?? '',
      name: safeString(json['name']) ?? '',
      avatar: safeString(json['avatar']),
      description: safeString(json['description']),
      websiteUrl: safeString(json['websiteUrl']),
      industry: safeString(json['industry']),
      location: safeString(json['location']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      if (avatar != null) 'avatar': avatar,
      if (description != null) 'description': description,
      if (websiteUrl != null) 'websiteUrl': websiteUrl,
      if (industry != null) 'industry': industry,
      if (location != null) 'location': location,
    };
  }
} 