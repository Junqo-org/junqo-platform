class OfferData {
  final String title;
  final String description;
  final String category;
  final List<String> tags;
  final DateTime? expiresAt;
  final String userId;

  OfferData({
    required this.title,
    required this.description,
    required this.category,
    required this.tags,
    this.expiresAt,
    required this.userId,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'category': category,
      'tags': tags,
      'expiresAt': expiresAt?.toIso8601String(),
      'userId': userId,
    };
  }
} 