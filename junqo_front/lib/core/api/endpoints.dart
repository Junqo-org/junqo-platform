/// Classe qui définit les endpoints de l'API REST
class ApiEndpoints {
  // Authentification
  static const String signIn = '/auth/login';
  static const String signUp = '/auth/register';
  static const String isLoggedIn = '/auth/is-logged-in';

  // Utilisateurs
  static String getUserById(String id) => '/users/me';
  static String updateUser(String id) => '/users/me';

  // Offres d'emploi
  static const String offers = '/offers';
  static const String myOffers = '/offers/my';
  static String getOfferById(String id) => '/offers/$id';
  static String createOffer() => '/offers';
  static String updateOffer(String id) => '/offers/$id';
  static String deleteOffer(String id) => '/offers/$id';

  // Candidatures
  static const String applications = '/applications';
  static String getApplicationById(String id) => '/applications/$id';
  static String updateApplication(String id) => '/applications/$id';
  static String postulateOffer(String id) => '/applications/apply/$id';

  // Entreprises
  static const String companies = '/company-profiles';
  static String getCompanyById(String id) => '/company-profiles/$id';
  static String updateCompany(String id) => '/company-profiles/my';

  // Étudiants
  static const String students = '/student-profiles';
  static String getStudentById(String id) => '/student-profiles/$id';
  static String updateStudent(String id) => '/student-profiles/me';
}
