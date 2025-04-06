/// Classe qui définit les endpoints de l'API REST
class ApiEndpoints {
  // Authentification
  static const String signIn = '/auth/signin';
  static const String signUp = '/auth/signup';
  static const String isLoggedIn = '/auth/status';
  
  // Utilisateurs
  static String getUserById(String id) => '/users/$id';
  static String updateUser(String id) => '/users/$id';
  
  // Offres d'emploi
  static const String offers = '/offers';
  static String getOfferById(String id) => '/offers/$id';
  static String updateOffer(String id) => '/offers/$id';
  static String deleteOffer(String id) => '/offers/$id';
  
  // Candidatures
  static const String applications = '/applications';
  static String getApplicationById(String id) => '/applications/$id';
  static String updateApplication(String id) => '/applications/$id';
  static String deleteApplication(String id) => '/applications/$id';
  
  // Entreprises
  static const String companies = '/companies';
  static String getCompanyById(String id) => '/companies/$id';
  static String updateCompany(String id) => '/companies/$id';
  
  // Étudiants
  static const String students = '/students';
  static String getStudentById(String id) => '/students/$id';
  static String updateStudent(String id) => '/students/$id';
} 