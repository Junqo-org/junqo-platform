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
  static String getMyApplicationss() => '/applications/my';

  // Profils d'entreprises
  static const String companyProfiles = '/company-profiles';
  static const String myCompanyProfile = '/company-profiles/my';
  static String getCompanyProfileById(String id) => '/company-profiles/$id';
  static String updateMyCompanyProfile = '/company-profiles/my';

  // Profils d'étudiants
  static const String studentProfiles = '/student-profiles';
  static const String myStudentProfile = '/student-profiles/my';
  static String getStudentProfileById(String id) => '/student-profiles/$id';
  static String updateMyStudentProfile = '/student-profiles/my';
}
