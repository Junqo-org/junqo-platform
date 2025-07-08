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
  static const String getApplicationsForOffer = '/applications';

  // Simulation d'entretien
  static const String interviewSimulation = '/interview-simulation';

  // Amélioration CV
  static const String analyzeCv = '/cv-improvement/analyze';

  // Enterprises want to recruit students
  static String enterprisesWantToRecruitStudents(String id) =>
      '/enterprises/recruit-students/$id'; // Yes i didn't know how to name it

  // Profils d'entreprises
  static const String companyProfiles = '/company-profiles';
  static const String myCompanyProfile = '/company-profiles/my';
  static String getCompanyProfileById(String id) => '/company-profiles/$id';
  static const String updateMyCompanyProfile = '/company-profiles/my';

  // Profils d'étudiants
  static const String studentProfiles = '/student-profiles';
  static const String myStudentProfile = '/student-profiles/my';
  static String getStudentProfileById(String id) => '/student-profiles/$id';
  static String updateMyStudentProfile = '/student-profiles/my';

  // Experiences (Corrected based on provided documentation)
  static const String myExperiences =
      '/experiences/my'; // GET user's experiences
  static String getExperienceById(String id) =>
      '/experiences/$id'; // GET specific experience by ID
  static const String createMyExperience =
      '/experiences/my'; // POST to create user's experience
  static String updateMyExperience(String id) =>
      '/experiences/my/$id'; // PATCH to update user's experience
  static String deleteMyExperience(String id) =>
      '/experiences/my/$id'; // DELETE user's experience

  // Original Experience endpoints (renamed or commented out if conflicting)
  // static const String experiences = '/experiences'; // Renamed to genericExperiences maybe?
  // static String getExperienceById(String id) => '/experiences/$id'; // Already covered
  // static String createExperience = '/experiences'; // Replaced by createMyExperience
  // static String updateExperience(String id) => '/experiences/$id'; // Replaced by updateMyExperience
  // static String deleteExperience(String id) => '/experiences/$id'; // Replaced by deleteMyExperience
}
