class CompanyProfileDTO {
  final String userId;
  final String name;
  final String? avatar; // Optional
  final String? description; // Optional
  final String? websiteUrl; // Optional

  CompanyProfileDTO({
    required this.userId,
    required this.name,
    this.avatar,
    this.description,
    this.websiteUrl,
  });

  factory CompanyProfileDTO.fromJson(Map<String, dynamic> json) {
    return CompanyProfileDTO(
      userId: json['userId'] as String,
      name: json['name'] as String,
      avatar: json['avatar'] as String?,
      description: json['description'] as String?,
      websiteUrl: json['websiteUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'userId': userId,
      'name': name,
    };
    if (avatar != null) {
      data['avatar'] = avatar;
    }
    if (description != null) {
      data['description'] = description;
    }
    if (websiteUrl != null) {
      data['websiteUrl'] = websiteUrl;
    }
    return data;
  }
} 