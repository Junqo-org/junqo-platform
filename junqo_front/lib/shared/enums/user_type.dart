/// Types d'utilisateurs supportés par l'application
library;
// ignore_for_file: constant_identifier_names

enum UserType {
  /// Utilisateur de type Étudiant/Candidat
  STUDENT,

  /// Utilisateur de type Entreprise/Recruteur
  COMPANY,

  /// Utilisateur de type Administrateur
  ADMIN,

  /// Utilisateur de type École
  SCHOOL
}

extension UserTypeExtension on UserType {
  String get value {
    switch (this) {
      case UserType.SCHOOL:
        return 'SCHOOL';
      case UserType.COMPANY:
        return 'COMPANY';
      case UserType.STUDENT:
        return 'STUDENT';
      case UserType.ADMIN:
        return 'ADMIN';
    }
  }
}

/// Convertit une chaîne en valeur d'énumération UserType
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
