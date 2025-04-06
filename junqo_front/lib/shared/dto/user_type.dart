// ignore_for_file: constant_identifier_names

enum UserType {
  SCHOOL,
  COMPANY,
  STUDENT,
  ADMIN,
}

extension UserTypeExtension on UserType {
  String get value {
    switch (this) {
      case UserType.SCHOOL:
        return 'school';
      case UserType.COMPANY:
        return 'company';
      case UserType.STUDENT:
        return 'student';
      case UserType.ADMIN:
        return 'admin';
    }
  }
}

UserType stringToUserType(String? value) {
  if (value == null) {
    throw Exception('UserType cannot be null');
  }
  
  value = value.toLowerCase();
  switch (value) {
    case 'school':
      return UserType.SCHOOL;
    case 'company':
      return UserType.COMPANY;
    case 'student':
      return UserType.STUDENT;
    case 'admin':
      return UserType.ADMIN;
    default:
      throw Exception('Unknown UserType: $value');
  }
}
