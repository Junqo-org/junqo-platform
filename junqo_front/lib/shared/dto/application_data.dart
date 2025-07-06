// Assuming a StudentData DTO exists or we'll use basic student info
// import 'student_data.dart'; // If you have a separate StudentData DTO

class ApplicationData {
  final String id;
  final String offerId;
  final String studentId;
  final String? studentName; // Or a StudentData object
  final String? studentEmail; // Example field
  // final StudentData? student; // Alternative if you have a StudentData DTO
  final String companyId;
  final String status; // e.g., 'NOT_OPENED', 'PENDING', 'ACCEPTED', 'DENIED'
  final DateTime createdAt;
  final DateTime updatedAt;

  ApplicationData({
    required this.id,
    required this.offerId,
    required this.studentId,
    this.studentName,
    this.studentEmail,
    // this.student,
    required this.companyId,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ApplicationData.fromJson(Map<String, dynamic> json) {
    // Check if 'student' object (from StudentProfileModel) exists and is a map
    final studentProfileData = json['studentProfile'] as Map<String, dynamic>?;
    // StudentProfileModel might contain a nested UserModel for name/email
    final studentUserData = studentProfileData?['user'] as Map<String, dynamic>?;

    // Fallback if studentProfile is not there, try a direct 'student' object (less likely based on backend structure)
    final directStudentData = json['student'] as Map<String, dynamic>?;

    String? name;
    String? email;

    if (studentUserData != null) {
      name = studentUserData['name'] as String?;
      email = studentUserData['email'] as String?;
    } else if (directStudentData != null) {
      name = directStudentData['name'] as String?;
      email = directStudentData['email'] as String?;
    }

    return ApplicationData(
      id: json['id'] as String,
      offerId: json['offerId'] as String,
      studentId: json['studentId'] as String,
      studentName: name ?? 'N/A', // Provide a fallback if name is null
      studentEmail: email, // Email can be null
      companyId: json['companyId'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  // Method to get a displayable status
  String get displayStatus {
    switch (status) {
      case 'NOT_OPENED':
        return 'Non ouverte';
      case 'PENDING':
        return 'En attente';
      case 'DENIED':
        return 'Refusée';
      case 'ACCEPTED':
        return 'Acceptée';
      default:
        return status;
    }
  }
} 