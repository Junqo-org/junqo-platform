class CompanyProfile {
  final String userId;
  final String name;
  final String? avatar;
  final String? description;
  final String? websiteUrl;
  
  CompanyProfile({
    required this.userId,
    required this.name,
    this.avatar,
    this.description,
    this.websiteUrl,
  });

  factory CompanyProfile.fromJson(Map<String, dynamic> json) {
    return CompanyProfile(
      userId: json['userId'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
      description: json['description'] as String?,
      websiteUrl: json['websiteUrl'] as String?,
    );
  }

  Map<String, dynamic> toUpdateJson() {
    return {
      if (avatar != null) 'avatar': avatar,
      if (description != null) 'description': description,
      if (websiteUrl != null) 'websiteUrl': websiteUrl,
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      if (avatar != null) 'avatar': avatar,
      if (description != null) 'description': description,
      if (websiteUrl != null) 'websiteUrl': websiteUrl,
    };
  }
} 