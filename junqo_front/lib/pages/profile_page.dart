import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/core/user_service.dart';
import 'package:junqo_front/core/student_profile_service.dart';
import 'package:junqo_front/pages/profile_recruter.dart';
import 'package:junqo_front/shared/enums/user_type.dart';
import 'package:junqo_front/shared/errors/show_error_dialog.dart';
import '../shared/widgets/navbar.dart';
import 'package:junqo_front/shared/dto/student_profile.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  ProfilePageState createState() => ProfilePageState();
}

class ProfilePageState extends State<ProfilePage> {
  final AuthService authService = GetIt.instance<AuthService>();
  final UserService userService = GetIt.instance<UserService>();
  final StudentProfileService studentProfileService = GetIt.instance<StudentProfileService>();
  UserType? userType;
  
  // Contrôleurs pour le profil étudiant
  final TextEditingController _nameController = TextEditingController(text: 'Laura');
  final TextEditingController _ageController = TextEditingController(text: '22');
  final TextEditingController _titleController = TextEditingController(text: 'Étudiante en marketing');
  final TextEditingController _schoolController = TextEditingController(text: 'Toulouse Business School');
  final TextEditingController _descriptionController = TextEditingController(
    text: 'Je m\'appelle Laura, j\'ai 22 ans et je suis actuellement étudiante en marketing à TBS, une école de management réputée. Passionnée par les stratégies digitales et la communication, j\'ai choisi cette voie pour mieux comprendre les dynamiques qui façonnent le comportement des consommateurs. Mon parcours académique m\'a permis de développer des compétences solides en marketing stratégique, en gestion de projets et en analyse de données.',
  );
  bool _isLoading = false;
  bool _isEditing = false;
  
  // Ajout des contrôleurs pour les nouvelles compétences et formations
  final TextEditingController _newSkillController = TextEditingController();
  final TextEditingController _schoolNameController = TextEditingController();
  final TextEditingController _yearController = TextEditingController();
  final TextEditingController _durationController = TextEditingController();
  final TextEditingController _programController = TextEditingController();
  
  // Listes pour stocker les compétences et formations modifiables
  List<String> skills = [];
  
  List<Map<String, String>> education = [];

  @override
  void initState() {
    super.initState();
    getUserType();
  }
  
  @override
  void dispose() {
    _nameController.dispose();
    _ageController.dispose();
    _titleController.dispose();
    _schoolController.dispose();
    _descriptionController.dispose();
    _newSkillController.dispose();
    _schoolNameController.dispose();
    _yearController.dispose();
    _durationController.dispose();
    _programController.dispose();
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
              _nameController.text = studentProfile.name;
              _ageController.text = studentProfile.age?.toString() ?? '';
              _titleController.text = studentProfile.title ?? '';
              _schoolController.text = studentProfile.schoolName ?? '';
              _descriptionController.text = studentProfile.description ?? '';
              
              if (studentProfile.skills != null) {
                skills = List<String>.from(studentProfile.skills!);
              }
              
              if (studentProfile.education != null) {
                education = studentProfile.education!.map((edu) => {
                  'school': edu.school ?? '',
                  'year': edu.year ?? '',
                  'duration': edu.duration ?? '',
                  'program': edu.program ?? '',
                }).toList();
              }
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
      showErrorDialog(e.toString(), context);
    }
  }
  
  void _saveProfile() {
    if (_nameController.text.isEmpty ||
        _ageController.text.isEmpty ||
        _titleController.text.isEmpty ||
        _schoolController.text.isEmpty ||
        _descriptionController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tous les champs sont obligatoires'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Convertir les données du formulaire en format Education
      final List<Education> educationList = education.map((edu) => Education(
        school: edu['school'],
        year: edu['year'],
        duration: edu['duration'],
        program: edu['program'],
      )).toList();
      
      // Mettre à jour le profil via le service
      studentProfileService.updateMyProfile(
        name: _nameController.text,
        age: int.tryParse(_ageController.text),
        title: _titleController.text,
        schoolName: _schoolController.text,
        description: _descriptionController.text,
        skills: skills,
        education: educationList,
      ).then((_) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _isEditing = false;
          });
          
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
                        child: ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Fermer',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }
      }).catchError((e) {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erreur lors de la mise à jour du profil: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la mise à jour du profil: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
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
        body: Column(
          children: [
            const Navbar(currentIndex: 4),
            const Expanded(
              child: CompanyProfile(),
            ),
          ],
        ),
      );
    }
    
    // Profil étudiant
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Column(
        children: [
          const Navbar(currentIndex: 4),
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)))
              : SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 800),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            _buildHeader(),
                            const SizedBox(height: 32),
                            _buildToggleEditButton(),
                            const SizedBox(height: 16),
                            _buildStudentDetailsCard(),
                            const SizedBox(height: 24),
                            _buildAboutMeCard(),
                            const SizedBox(height: 24),
                            _buildSkillsCard(),
                            const SizedBox(height: 24),
                            _buildEducationCard(),
                            const SizedBox(height: 32),
                            if (_isEditing) _buildSaveButton(),
                            const SizedBox(height: 16),
                            _buildLogoutButton(),
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
    );
  }
  
  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF6366F1).withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                Icons.person_outline,
                color: Color(0xFF6366F1),
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Profil étudiant",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    "Complétez votre profil pour attirer l'attention des recruteurs",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF), // Blue 50
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFBFDBFE)), // Blue 200
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline_rounded, color: Color(0xFF3B82F6)), // Blue 500
              SizedBox(width: 16),
              Expanded(
                child: Text(
                  "Votre profil est visible par les recruteurs. Assurez-vous que toutes les informations sont à jour pour maximiser vos chances.",
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF2563EB), // Blue 600
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildToggleEditButton() {
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
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () {
                setState(() {
                  _isEditing = !_isEditing;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: _isEditing ? const Color(0xFF475569) : const Color(0xFF6366F1),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(_isEditing ? Icons.check : Icons.edit, size: 18),
                  const SizedBox(width: 8),
                  Text(
                    _isEditing ? 'Terminer l\'édition' : 'Modifier le profil',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentProfilePicture() {
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
              image: const DecorationImage(
                image: AssetImage('assets/images/profile_placeholder.jpg'),
                fit: BoxFit.cover,
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            right: 0,
            child: GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('La fonction de téléchargement d\'image n\'est pas disponible actuellement'),
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
            const Row(
              children: [
                Icon(
                  Icons.person_outline_rounded,
                  color: Color(0xFF6366F1),
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  'Informations personnelles',
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
              "Présentez-vous aux recruteurs",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 24),
            _buildStudentProfilePicture(),
            const SizedBox(height: 24),
            if (_isEditing)
              _buildTextField(
                controller: _nameController,
                label: 'Nom complet',
                hint: 'Ex: Laura Dupont',
                icon: Icons.person,
              )
            else
              _buildDisplayField(
                label: 'Nom complet',
                value: _nameController.text,
                icon: Icons.person,
              ),
            const SizedBox(height: 16),
            if (_isEditing)
              _buildTextField(
                controller: _ageController,
                label: 'Âge',
                hint: 'Ex: 22',
                icon: Icons.cake,
              )
            else
              _buildDisplayField(
                label: 'Âge',
                value: _ageController.text,
                icon: Icons.cake,
              ),
            const SizedBox(height: 16),
            if (_isEditing)
              _buildTextField(
                controller: _titleController,
                label: 'Titre professionnel',
                hint: 'Ex: Étudiante en marketing',
                icon: Icons.work_outline,
              )
            else
              _buildDisplayField(
                label: 'Titre professionnel',
                value: _titleController.text,
                icon: Icons.work_outline,
              ),
            const SizedBox(height: 16),
            if (_isEditing)
              _buildTextField(
                controller: _schoolController,
                label: 'École',
                hint: 'Ex: Toulouse Business School',
                icon: Icons.school,
              )
            else
              _buildDisplayField(
                label: 'École',
                value: _schoolController.text,
                icon: Icons.school,
              ),
          ],
        ),
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

  Widget _buildAboutMeCard() {
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
                  Icons.description_outlined,
                  color: Color(0xFF6366F1),
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  'À propos de moi',
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
              "Décrivez votre parcours, vos motivations et vos objectifs",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 24),
            if (_isEditing)
              TextField(
                controller: _descriptionController,
                maxLines: 6,
                style: const TextStyle(
                  color: Color(0xFF1E293B),
                  fontSize: 14,
                ),
                decoration: InputDecoration(
                  labelText: "Description détaillée *",
                  hintText: 'Parlez de votre parcours, vos passions et vos objectifs professionnels...',
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
                  floatingLabelStyle: const TextStyle(
                    color: Color(0xFF6366F1),
                  ),
                  alignLabelWithHint: true,
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0),
                    width: 1.5,
                  ),
                ),
                child: Text(
                  _descriptionController.text,
                  style: const TextStyle(
                    color: Color(0xFF1E293B),
                    fontSize: 14,
                    height: 1.6,
                  ),
                ),
              ),
          ],
        ),
      ),
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
              children: skills.map((skill) {
                return Chip(
                  label: Text(skill),
                  labelStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                  backgroundColor: const Color(0xFF6366F1),
                  deleteIconColor: _isEditing ? Colors.white : Colors.transparent,
                  onDeleted: _isEditing ? () {
                    setState(() {
                      skills.remove(skill);
                    });
                  } : null,
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
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
                  ElevatedButton(
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
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Icon(
                      Icons.add,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEducationCard() {
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
                  Icons.school_outlined,
                  color: Color(0xFF6366F1),
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  'Formation',
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
              "Vos diplômes et parcours académique",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 24),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: education.length,
              separatorBuilder: (context, index) => const Divider(height: 32),
              itemBuilder: (context, index) {
                final edu = education[index];
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFF6366F1).withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        (index + 1).toString(),
                        style: const TextStyle(
                          color: Color(0xFF6366F1),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  edu['school'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF6366F1).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(
                                  edu['year'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFF6366F1),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            edu['program'] ?? '',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF475569),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Row(
                                  children: [
                                    const Text(
                                      'Durée: ',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                    Text(
                                      edu['duration'] ?? '',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (_isEditing)
                                IconButton(
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  onPressed: () {
                                    setState(() {
                                      education.removeAt(index);
                                    });
                                  },
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
            if (_isEditing) ...[
              const SizedBox(height: 24),
              const Divider(),
              const SizedBox(height: 16),
              _buildAddEducationForm(),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildAddEducationForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Ajouter une nouvelle formation',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _schoolNameController,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 14,
          ),
          decoration: InputDecoration(
            labelText: 'Établissement',
            labelStyle: const TextStyle(color: Color(0xFF64748B)),
            hintText: 'Ex: Université Paris 1',
            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
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
        const SizedBox(height: 12),
        TextField(
          controller: _yearController,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 14,
          ),
          decoration: InputDecoration(
            labelText: 'Années',
            labelStyle: const TextStyle(color: Color(0xFF64748B)),
            hintText: 'Ex: 2020-2022',
            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
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
        const SizedBox(height: 12),
        TextField(
          controller: _durationController,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 14,
          ),
          decoration: InputDecoration(
            labelText: 'Durée',
            labelStyle: const TextStyle(color: Color(0xFF64748B)),
            hintText: 'Ex: 2 ans',
            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
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
        const SizedBox(height: 12),
        TextField(
          controller: _programController,
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 14,
          ),
          decoration: InputDecoration(
            labelText: 'Programme/Formation',
            labelStyle: const TextStyle(color: Color(0xFF64748B)),
            hintText: 'Ex: Master en Droit',
            hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
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
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () {
              if (_schoolNameController.text.isNotEmpty &&
                  _yearController.text.isNotEmpty &&
                  _durationController.text.isNotEmpty &&
                  _programController.text.isNotEmpty) {
                setState(() {
                  education.add({
                    'school': _schoolNameController.text,
                    'year': _yearController.text,
                    'duration': _durationController.text,
                    'program': _programController.text,
                  });
                  // Clear the fields after adding
                  _schoolNameController.clear();
                  _yearController.clear();
                  _durationController.clear();
                  _programController.clear();
                });
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Tous les champs sont obligatoires'),
                    backgroundColor: Colors.red,
                  ),
                );
              }
            },
            icon: const Icon(Icons.add),
            label: const Text('Ajouter la formation'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      ],
    );
  }

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
            hintStyle: TextStyle(color: const Color(0xFF94A3B8)),
            prefixIcon: Icon(icon, color: const Color(0xFF64748B)),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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

  Widget _buildSaveButton() {
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
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _saveProfile,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Enregistrer le profil',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildLogoutButton() {
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
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: () async {
                await authService.logout();
                if (!mounted) return;
                Navigator.pushReplacementNamed(context, '/login');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Text(
                'Se déconnecter',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
