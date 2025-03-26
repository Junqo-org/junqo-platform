class OfferData {
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
}
