class OfferData {
  final String? id;
  final String userid;
  final String title;
  final String description;
  final String offerType; // 'Stage' ou 'Alternance'
  final String duration;
  final String salary;
  final String workLocationType; // 'Sur place' ou 'Distanciel'
  final List<String> skills;
  final List<String> benefits;
  final String educationLevel;
  final String status;

  OfferData({
    this.id,
    this.userid = '',
    required this.title,
    required this.description,
    required this.offerType,
    this.duration = '',
    this.salary = '',
    this.workLocationType = '',
    required this.skills,
    required this.benefits,
    this.educationLevel = '',
    this.status = '',
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userid': userid,
      'title': title,
      'description': description,
      'offerType': offerType,
      'duration': duration,
      'salary': salary,
      'workLocationType': workLocationType,
      'skills': skills,
      'benefits': benefits,
      'educationLevel': educationLevel,
      'status': status,
    };
  }

  factory OfferData.fromJson(Map<String, dynamic> json) {
    // Gérer les compétences (skills)
    List<String> skills = [];
    if (json['skills'] != null) {
      if (json['skills'] is List) {
        skills =
            (json['skills'] as List).map((item) => item.toString()).toList();
      } else if (json['skills'] is String) {
        // Si c'est une chaîne de caractères, tenter de séparer par des virgules
        skills =
            (json['skills'] as String).split(',').map((s) => s.trim()).toList();
      }
    }

    // Gérer les avantages (benefits)
    List<String> benefits = [];
    if (json['benefits'] != null) {
      if (json['benefits'] is List) {
        benefits =
            (json['benefits'] as List).map((item) => item.toString()).toList();
      } else if (json['benefits'] is String) {
        // Si c'est une chaîne de caractères, tenter de séparer par des virgules
        benefits = (json['benefits'] as String)
            .split(',')
            .map((s) => s.trim())
            .toList();
      }
    }

    // Gérer le statut (actif/inactif)
    String status = json['status']?.toString() ?? '';
    if (status.toLowerCase() == 'active' || status.toUpperCase() == 'ACTIVE') {
      status = 'active';
    } else if (status.toLowerCase() == 'inactive' ||
        status.toUpperCase() == 'INACTIVE') {
      status = 'inactive';
    }

    // Gérer le niveau d'éducation (s'assurer que c'est bien une String)
    String educationLevel = '';
    if (json['educationLevel'] != null) {
      educationLevel = json['educationLevel'].toString();
    }

    return OfferData(
      id: json['id']?.toString(),
      userid: json['userId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      offerType: json['offerType']?.toString() ?? '',
      duration: json['duration']?.toString() ?? '',
      salary: json['salary']?.toString() ?? '',
      workLocationType: json['workLocationType']?.toString() ?? '',
      skills: skills,
      benefits: benefits,
      educationLevel: educationLevel,
      status: status,
    );
  }
}
