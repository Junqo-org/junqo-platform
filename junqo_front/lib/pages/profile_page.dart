import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/core/user_service.dart';
import 'package:junqo_front/core/student_profile_service.dart';
import 'package:junqo_front/pages/profile_recruter.dart';
import 'package:junqo_front/shared/dto/student_profile.dart';
import 'package:junqo_front/shared/enums/user_type.dart';
import 'package:junqo_front/shared/errors/show_error_dialog.dart';
import 'package:junqo_front/shared/widgets/navbar_company.dart';
import 'package:junqo_front/shared/widgets/animated_widgets.dart';
import 'package:junqo_front/shared/theme/app_theme.dart';
import '../shared/widgets/navbar.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  ProfilePageState createState() => ProfilePageState();
}

class ProfilePageState extends State<ProfilePage> {
  final AuthService authService = GetIt.instance<AuthService>();
  final UserService userService = GetIt.instance<UserService>();
  final StudentProfileService studentProfileService =
      GetIt.instance<StudentProfileService>();
  UserType? userType;

  // Re-added name controller
  final TextEditingController _nameController = TextEditingController();
  // Added avatar state
  String? _avatarUrl;

  // Removed unused controllers
  // final TextEditingController _ageController =
  //     TextEditingController(text: '22');
  // final TextEditingController _titleController =
  //     TextEditingController(text: 'Étudiante en marketing');
  // final TextEditingController _schoolController =
  //     TextEditingController(text: 'Toulouse Business School');
  // final TextEditingController _descriptionController = TextEditingController(
  //   text:
  //       'Je m\'appelle Laura, j\'ai 22 ans et je suis actuellement étudiante en marketing à TBS, une école de management réputée. Passionnée par les stratégies digitales et la communication, j\'ai choisi cette voie pour mieux comprendre les dynamiques qui façonnent le comportement des consommateurs. Mon parcours académique m\'a permis de développer des compétences solides en marketing stratégique, en gestion de projets et en analyse de données.',
  // );
  bool _isLoading = false;
  bool _isEditing = false;

  // Ajout des contrôleurs pour les nouvelles compétences et formations
  final TextEditingController _newSkillController = TextEditingController();
  // final TextEditingController _schoolNameController = TextEditingController();
  // final TextEditingController _yearController = TextEditingController();
  // final TextEditingController _durationController = TextEditingController();
  // final TextEditingController _programController = TextEditingController();

  // Listes pour stocker les compétences et formations modifiables
  List<String> skills = [];

  // Added state list for experiences
  List<ExperienceDTO> experiences = [];

  // Added controllers for the Add Experience form
  final TextEditingController _expTitleController = TextEditingController();
  final TextEditingController _expCompanyController = TextEditingController();
  final TextEditingController _expStartDateController = TextEditingController();
  final TextEditingController _expEndDateController = TextEditingController();
  final TextEditingController _expDescriptionController =
      TextEditingController();
  final TextEditingController _expSkillsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    getUserType();
  }

  @override
  void dispose() {
    // REMOVED disposal of unused controllers
    _nameController.dispose(); // Dispose name controller
    // _ageController.dispose();
    // _titleController.dispose();
    // _schoolController.dispose();
    // _descriptionController.dispose();
    _newSkillController.dispose();
    // Dispose experience form controllers
    _expTitleController.dispose();
    _expCompanyController.dispose();
    _expStartDateController.dispose();
    _expEndDateController.dispose();
    _expDescriptionController.dispose();
    _expSkillsController.dispose();
    // _schoolNameController.dispose();
    // _yearController.dispose();
    // _durationController.dispose();
    // _programController.dispose();
    super.dispose();
  }

  Future<void> getUserType() async {
    String? userId = authService.userId;

    if (userId == null) {
      return;
    }
    try {
      await userService.fetchUserData(userId);
      if (!mounted) return;
      setState(() {
        userType = userService.userData?.type;
      });

      // Chargement du profil si l'utilisateur est un étudiant
      if (userType == UserType.STUDENT) {
        _isLoading = true;
        try {
          final studentProfile = await studentProfileService.getMyProfile();
          if (studentProfile != null && mounted) {
            setState(() {
              // REMOVED setting text for removed controllers
              _nameController.text = studentProfile.name; // Set name
              _avatarUrl = studentProfile.avatar; // Set avatar URL
              // _ageController.text = studentProfile.age?.toString() ?? '';
              // _titleController.text = studentProfile.title ?? '';
              // _schoolController.text = studentProfile.schoolName ?? '';
              // _descriptionController.text = studentProfile.description ?? '';

              if (studentProfile.skills != null) {
                skills = List<String>.from(studentProfile.skills!);
              }

              // Set experiences
              if (studentProfile.experiences != null) {
                experiences =
                    List<ExperienceDTO>.from(studentProfile.experiences!);
              }

              // REMOVED mapping of education
              // if (studentProfile.education != null) {
              //   education = studentProfile.education!
              //       .map((edu) => {
              //             'school': edu.school ?? '',
              //             'year': edu.year ?? '',
              //             'duration': edu.duration ?? '',
              //             'program': edu.program ?? '',
              //           })
              //       .toList();
              // }
            });
          }
        } catch (e) {
          debugPrint('Error loading student profile: $e');
          // Un nouveau profil sera créé lors de la première sauvegarde
        } finally {
          if (mounted) {
            setState(() {
              _isLoading = false;
            });
          }
        }
      }
    } catch (e) {
      debugPrint('Error fetching user type: $e');
      if (!mounted) return;
      RegExpMatch? match = RegExp(r'.*not\s*found').firstMatch(e.toString());

      if (match != null) {
        final navigatorContext = context;
        await authService.logout();
        if (!mounted) return;
        Navigator.pushReplacementNamed(navigatorContext, '/login');
        return;
      }
      showErrorDialog(e.toString(), context);
    }
  }

  Future<void> _saveProfile() async {
    debugPrint("[_saveProfile] Triggered");

    // Validate required fields first
    if (_nameController.text.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Le nom est obligatoire'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // Set loading state
    if (!mounted) return;
    setState(() {
      _isLoading = true;
    });

    try {
      // Update profile data - Reverting: Removing 'name' again as it might cause 400 error
      // Backend might not expect 'name' property in this specific update request
      await studentProfileService.updateMyProfile(
        avatar: _avatarUrl,
        skills: skills,
        // Experiences are managed separately via add/removeExperience
      );

      // Check mounted state before updating UI
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _isEditing = false;
      });

      // Show success dialog, with mounted check before dialog
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (context) => Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: const BoxDecoration(
                      color: Color(0xFF6366F1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Profil mis à jour avec succès',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Vos informations ont été enregistrées',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: Semantics(
                      button: true,
                      label: 'Fermer',
                      child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6366F1),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12))),
                          child: const Text('Fermer',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold))),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    } catch (e) {
      // Error handling with mounted check
      debugPrint('Error updating profile: $e');

      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la mise à jour du profil: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (userType == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    } else if (userType == UserType.COMPANY) {
      return Scaffold(
        backgroundColor: Colors.grey[100],
        body: const Column(
          children: [
            NavbarCompany(currentIndex: 4),
            Expanded(
              child: CompanyProfile(),
            ),
          ],
        ),
      );
    }

    // Profil étudiant
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFF8FAFC),
              Color(0xFFE2E8F0),
              Color(0xFFF1F5F9),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Floating particles background
            const FloatingParticles(
              numberOfParticles: 10,
              color: AppTheme.primaryColor,
              maxSize: 4.0,
            ),
            
            Column(
              children: [
                const Navbar(currentIndex: 4),
                Expanded(
                  child: _isLoading
                      ? Container(
                          decoration: const BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                          ),
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 60,
                                  height: 60,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 4,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                ),
                                SizedBox(height: 24),
                                Text(
                                  'Chargement de votre profil...',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : SingleChildScrollView(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 24, vertical: 32),
                            child: Center(
                              child: ConstrainedBox(
                                constraints: const BoxConstraints(maxWidth: 800),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    _buildHeader().animate()
                                        .fadeIn(duration: 600.ms)
                                        .slideY(begin: -0.2, end: 0),
                                    const SizedBox(height: 32),
                                    AnimatedCard(
                                      delay: 200.ms,
                                      child: _buildToggleEditButton(),
                                    ),
                                    const SizedBox(height: 16),
                                    AnimatedCard(
                                      delay: 300.ms,
                                      child: _buildStudentDetailsCard(),
                                    ),
                                    const SizedBox(height: 24),
                                    AnimatedCard(
                                      delay: 400.ms,
                                      child: _buildSkillsCard(),
                                    ),
                                    const SizedBox(height: 24),
                                    AnimatedCard(
                                      delay: 500.ms,
                                      child: _buildExperiencesCard(),
                                    ),
                                    const SizedBox(height: 24),
                                    if (_isEditing) 
                                      AnimatedCard(
                                        delay: 600.ms,
                                        child: _buildSaveButton(),
                                      ),
                                    const SizedBox(height: 16),
                                    AnimatedCard(
                                      delay: 700.ms,
                                      child: _buildLogoutButton(),
                                    ),
                                    const SizedBox(height: 40),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        borderRadius: BorderRadius.circular(AppTheme.borderRadiusXLarge),
        boxShadow: AppTheme.elevatedShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.person_outline,
                  color: Colors.white,
                  size: 32,
                ),
              ).animate()
                  .scale(delay: 100.ms, duration: 400.ms, curve: Curves.elasticOut),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Profil étudiant",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ).animate()
                        .fadeIn(delay: 200.ms, duration: 600.ms)
                        .slideX(begin: -0.2, end: 0),
                    const SizedBox(height: 8),
                    const Text(
                      "Complétez votre profil pour attirer l'attention des recruteurs",
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                        fontWeight: FontWeight.w300,
                      ),
                    ).animate()
                        .fadeIn(delay: 400.ms, duration: 600.ms)
                        .slideX(begin: -0.2, end: 0),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline_rounded,
                  color: Colors.white,
                ).animate()
                    .scale(delay: 600.ms, duration: 300.ms),
                const SizedBox(width: 16),
                const Expanded(
                  child: Text(
                    "Votre profil est visible par les recruteurs. Assurez-vous que toutes les informations sont à jour pour maximiser vos chances.",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white,
                    ),
                  ),
                ).animate()
                    .fadeIn(delay: 700.ms, duration: 500.ms),
              ],
            ),
          ).animate()
              .fadeIn(delay: 500.ms, duration: 600.ms)
              .slideY(begin: 0.2, end: 0),
        ],
      ),
    );
  }

  Widget _buildToggleEditButton() {
    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.all(4), // Marge pour l'effet de scale
      child: AnimatedButton(
        text: _isEditing ? 'Terminer l\'édition' : 'Modifier le profil',
        icon: _isEditing ? Icons.check : Icons.edit,
        customColor: _isEditing ? AppTheme.successColor : AppTheme.primaryColor,
        onPressed: () {
          setState(() {
            _isEditing = !_isEditing;
          });
        },
      ),
    );
  }

  Widget _buildStudentDetailsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStudentProfilePicture(),
            const SizedBox(height: 24),
            if (_isEditing)
              _buildTextField(
                controller: _nameController,
                label: 'Nom complet',
                hint: 'Entrez votre nom complet',
                icon: Icons.person,
              )
            else
              _buildDisplayField(
                label: 'Nom complet',
                value: _nameController.text,
                icon: Icons.person,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentProfilePicture() {
    // Placeholder image logic
    ImageProvider<Object> imageProvider;
    if (_avatarUrl != null && _avatarUrl!.isNotEmpty) {
      imageProvider = NetworkImage(_avatarUrl!); // Use NetworkImage for URL
    } else {
      imageProvider = const AssetImage(
          'assets/images/profile_placeholder.jpg'); // Default placeholder
    }

    return Center(
      child: Stack(
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFE2E8F0),
                width: 4,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
              image: DecorationImage(
                image: imageProvider, // Use the determined image provider
                fit: BoxFit.cover,
                onError: (exception, stackTrace) {
                  // Optionally handle image loading errors
                  print("Error loading avatar: $exception");
                  // You could set a flag to show the placeholder again
                },
              ),
            ),
          ),
          if (_isEditing) // Show edit button only when editing
            Positioned(
              bottom: 0,
              right: 0,
              child: GestureDetector(
                onTap: () {
                  // TODO: Implement avatar upload functionality
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                          'La fonction de modification de l\'avatar n\'est pas encore implémentée.'),
                      backgroundColor: Color(0xFFF59E0B),
                    ),
                  );
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white,
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.camera_alt_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDisplayField({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: const Color(0xFFE2E8F0),
              width: 1.5,
            ),
          ),
          child: Row(
            children: [
              Icon(icon, color: const Color(0xFF64748B)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  value,
                  style: const TextStyle(
                    color: Color(0xFF1E293B),
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSkillsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(
                  Icons.lightbulb_outline,
                  color: Color(0xFF6366F1),
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  'Compétences',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Ajoutez vos compétences pour mettre en valeur votre profil",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 24),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: skills.asMap().entries.map((entry) {
                final index = entry.key;
                final skill = entry.value;
                return AnimatedListItem(
                  index: index,
                  delay: const Duration(milliseconds: 50),
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.primaryGradient,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Chip(
                      label: Text(skill),
                      labelStyle: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                      ),
                      backgroundColor: Colors.transparent,
                      deleteIconColor:
                          _isEditing ? Colors.white : Colors.transparent,
                      onDeleted: _isEditing
                          ? () {
                              setState(() {
                                skills.remove(skill);
                              });
                            }
                          : null,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                        side: BorderSide.none,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            if (_isEditing) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _newSkillController,
                      style: const TextStyle(
                        color: Color(0xFF1E293B),
                        fontSize: 14,
                      ),
                      decoration: InputDecoration(
                        hintText: 'Ajouter une compétence',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFE2E8F0),
                            width: 1.5,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFF6366F1),
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Semantics(
                    button: true,
                    label: 'Bouton',
                    child: ElevatedButton(
                        onPressed: () {
                          if (_newSkillController.text.isNotEmpty) {
                            setState(() {
                              skills.add(_newSkillController.text);
                              _newSkillController.clear();
                            });
                          }
                        },
                        style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            padding: const EdgeInsets.all(12),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12))),
                        child: const Icon(Icons.add, color: Colors.white)),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildExperiencesCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(
                  Icons.work_history_outlined,
                  color: Color(0xFF6366F1),
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  'Expériences professionnelles',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Détaillez votre parcours professionnel",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 24),
            if (experiences.isEmpty && !_isEditing)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 20.0),
                  child: Text(
                    'Aucune expérience ajoutée pour le moment.',
                    style: TextStyle(color: Color(0xFF64748B)),
                  ),
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: experiences.length,
                separatorBuilder: (context, index) => const Divider(height: 32),
                itemBuilder: (context, index) {
                  final exp = experiences[index];
                  return _buildExperienceItem(exp, index);
                },
              ),
            if (_isEditing) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              _buildAddExperienceForm(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildExperienceItem(ExperienceDTO exp, int index) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF6366F1).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.business_center, // Icon for experience
            color: Color(0xFF6366F1),
            size: 20,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      exp.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ),
                  if (_isEditing)
                    IconButton(
                      icon: const Icon(Icons.delete,
                          color: Colors.redAccent, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      tooltip: 'Supprimer l\'expérience',
                      onPressed: () async {
                        // Make async
                        // Check if ID exists (it should after fetching/adding)
                        if (exp.id == null) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                  'Impossible de supprimer: ID d\'expérience manquant.'),
                              backgroundColor: Colors.orange,
                            ),
                          );
                          return;
                        }

                        // Confirmation Dialog (Optional but recommended)
                        bool confirmDelete = await showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  title: const Text('Confirmer la suppression'),
                                  content: const Text(
                                      'Voulez-vous vraiment supprimer cette expérience ?'),
                                  actions: <Widget>[
                                    Semantics(
                                      button: true,
                                      label:
                                          'Voulez-vous vraiment supprimer cette expérience ?',
                                      child: TextButton(
                                          child: const Text('Annuler'),
                                          onPressed: () =>
                                              Navigator.of(context).pop(false)),
                                    ),
                                    Semantics(
                                      button: true,
                                      label: 'Supprimer',
                                      child: TextButton(
                                          child: const Text('Supprimer',
                                              style:
                                                  TextStyle(color: Colors.red)),
                                          onPressed: () =>
                                              Navigator.of(context).pop(true)),
                                    ),
                                  ],
                                );
                              },
                            ) ??
                            false; // Default to false if dialog dismissed

                        if (!confirmDelete) return;

                        // Call API to delete
                        try {
                          final success = await studentProfileService
                              .removeExperience(exp.id!);
                          if (success) {
                            if (!mounted) return;
                            setState(() {
                              experiences.removeAt(index);
                              debugPrint(
                                  "[Delete Button] Successfully removed experience via API.");
                            });
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content:
                                    Text('Expérience supprimée avec succès.'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          } else {
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                    'Échec de la suppression de l\'expérience (API).'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        } catch (e) {
                          debugPrint(
                              "[Delete Button] Error removing experience via API: $e");
                          if (!mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content:
                                  Text('Erreur lors de la suppression: $e'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      },
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                exp.company,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF475569),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today,
                      size: 14, color: Color(0xFF64748B)),
                  const SizedBox(width: 6),
                  Text(
                    '${exp.startDate} - ${exp.endDate ?? 'Présent'}', // Handle ongoing experience
                    style: const TextStyle(
                      fontSize: 13,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
              if (exp.description != null && exp.description!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    exp.description!,
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF334155),
                      height: 1.5,
                    ),
                  ),
                ),
              if (exp.skills != null && exp.skills!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 12.0),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: exp.skills!
                        .map((skill) => Chip(
                              label: Text(skill),
                              labelStyle: const TextStyle(
                                  fontSize: 12, color: Color(0xFF334155)),
                              backgroundColor: const Color(0xFFF1F5F9),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              materialTapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                              visualDensity: VisualDensity.compact,
                              side: BorderSide.none,
                            ))
                        .toList(),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAddExperienceForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Ajouter une nouvelle expérience',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 16),
        _buildTextField(
          controller: _expTitleController,
          label: 'Poste / Titre',
          hint: 'Ex: Assistant Marketing',
          icon: Icons.work,
        ),
        const SizedBox(height: 12),
        _buildTextField(
          controller: _expCompanyController,
          label: 'Entreprise',
          hint: 'Ex: Google',
          icon: Icons.business,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _expStartDateController,
                label: 'Date de début',
                hint: 'AAAA-MM-JJ',
                icon: Icons.calendar_today,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildTextField(
                controller: _expEndDateController,
                label: 'Date de fin (optionnel)',
                hint: 'AAAA-MM-JJ ou laisser vide',
                icon: Icons.calendar_today,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _expDescriptionController,
          maxLines: 4,
          style: const TextStyle(color: Color(0xFF1E293B), fontSize: 14),
          decoration: InputDecoration(
            labelText: 'Description (optionnel)',
            hintText: 'Décrivez vos missions et réalisations...',
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: Color(0xFF6366F1), width: 1.5),
            ),
            floatingLabelStyle: const TextStyle(color: Color(0xFF6366F1)),
            alignLabelWithHint: true,
          ),
        ),
        const SizedBox(height: 12),
        _buildTextField(
          controller: _expSkillsController,
          label: 'Compétences acquises (optionnel)',
          hint: 'Ex: Gestion de projet, SEO, Vente (séparées par des virgules)',
          icon: Icons.lightbulb,
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: Semantics(
            button: true,
            label: 'Ajouter l\'expérience',
            child: ElevatedButton.icon(
                onPressed: _addExperience,
                icon: const Icon(Icons.add),
                label: const Text('Ajouter l\'expérience'),
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        vertical: 12, horizontal: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)))),
          ),
        ),
      ],
    );
  }

  // Modified to call API
  void _addExperience() async {
    // Make async
    debugPrint("[_addExperience] Triggered (API Add)");
    final title = _expTitleController.text.trim();
    final company = _expCompanyController.text.trim();
    final startDate = _expStartDateController.text.trim();
    final endDate = _expEndDateController.text.trim();
    final description = _expDescriptionController.text.trim();
    final skillsString = _expSkillsController.text.trim();

    if (title.isEmpty || company.isEmpty || startDate.isEmpty) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Le titre, l\'entreprise et la date de début sont obligatoires.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Basic date validation (simple check for now, enhance as needed)
    final dateRegex = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    if (!dateRegex.hasMatch(startDate) ||
        (endDate.isNotEmpty && !dateRegex.hasMatch(endDate))) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Format de date invalide. Utilisez AAAA-MM-JJ.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final List<String>? experienceSkills = skillsString.isNotEmpty
        ? skillsString
            .split(',')
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty)
            .toList()
        : null;

    // Prepare DTO (ID will be null for creation)
    final newExperienceData = ExperienceDTO(
      title: title,
      company: company,
      startDate: startDate,
      endDate: endDate.isEmpty ? null : endDate,
      description: description.isEmpty ? null : description,
      skills: experienceSkills,
    );

    // Add loading state indicator if desired
    // setState(() => _isAddingExperience = true);

    try {
      // Call the service to add experience via API
      final createdExperience =
          await studentProfileService.addExperience(newExperienceData);

      if (!mounted) return;

      // Add the *returned* experience (with ID) to the local list
      setState(() {
        experiences.add(createdExperience);
        // Clear the form fields
        _expTitleController.clear();
        _expCompanyController.clear();
        _expStartDateController.clear();
        _expEndDateController.clear();
        _expDescriptionController.clear();
        _expSkillsController.clear();
        debugPrint(
            "[_addExperience] Successfully added experience via API and cleared form.");
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Expérience ajoutée avec succès !'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      debugPrint("[_addExperience] Error adding experience via API: $e");
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de l\'ajout de l\'expérience: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      // Reset loading state if used
      // if (mounted) {
      //   setState(() => _isAddingExperience = false);
      // }
    }
  }

  Widget _buildSaveButton() {
    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.all(4), // Marge pour l'effet de scale
      child: AnimatedButton(
        text: 'Enregistrer le profil',
        icon: Icons.save,
        isLoading: _isLoading,
        customColor: AppTheme.successColor,
        onPressed: _saveProfile,
      ),
    );
  }

  Widget _buildLogoutButton() {
    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.all(4), // Marge pour l'effet de scale
      child: AnimatedButton(
        text: 'Se déconnecter',
        icon: Icons.logout,
        customColor: AppTheme.errorColor,
        onPressed: () async {
          await authService.logout();
          if (!mounted) return;
          Navigator.pushReplacementNamed(context, '/login');
        },
      ),
    );
  }

  // Re-added _buildTextField helper
  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF475569),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 14,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
            prefixIcon: Icon(icon, color: const Color(0xFF64748B)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFFE2E8F0),
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: Color(0xFF6366F1),
                width: 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}