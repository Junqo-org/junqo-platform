import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart';

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

UserType stringToUserType(String value) {
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

UserType gUserTypeToUserType(GUserType value) {
  switch (value) {
    case GUserType.SCHOOL:
      return UserType.SCHOOL;
    case GUserType.COMPANY:
      return UserType.COMPANY;
    case GUserType.STUDENT:
      return UserType.STUDENT;
    case GUserType.ADMIN:
      return UserType.ADMIN;
    default:
      throw Exception('Unknown GUserType: $value');
  }
}
