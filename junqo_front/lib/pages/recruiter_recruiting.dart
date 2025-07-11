import 'package:flutter/material.dart';
import '../shared/widgets/navbar_company.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/student_profile.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/client.dart';
import 'package:flutter_svg/flutter_svg.dart';

class StudentData {
  final String studentName;
  final String studentImage;
  final String studentSchool;
  final String contractType;
  final String duration;
  final String location;
  final String salary;
  final List<String> benefits;
  final List<String> technicalSkills;
  final bool showDetails;
  final String details;
  final String id;
  final String userid;
  final String status;
  final bool isPlaceHolder;

  // New fields from StudentProfile
  final List<Education>? education;
  final List<ExperienceDTO>? experiences;
  final int? age;

  StudentData({
    required this.studentName,
    required this.studentImage,
    required this.studentSchool,
    required this.contractType,
    required this.duration,
    required this.location,
    required this.salary,
    required this.benefits,
    required this.technicalSkills,
    this.showDetails = false,
    required this.details,
    required this.id,
    required this.userid,
    required this.status,
    required this.isPlaceHolder,
    this.education,
    this.experiences,
    this.age,
  });
}

//
class RecruiterRecruiting extends StatefulWidget {
  final RestClient client = GetIt.instance<RestClient>();

  RecruiterRecruiting({super.key});

  @override
  State<RecruiterRecruiting> createState() => _RecruiterRecruitingState();
}

class _RecruiterRecruitingState extends State<RecruiterRecruiting>
    with SingleTickerProviderStateMixin {
  // Ajout d'une clé globale pour le ScaffoldMessenger
  final GlobalKey<ScaffoldMessengerState> _scaffoldKey =
      GlobalKey<ScaffoldMessengerState>();

  StudentData? studentData;
  late final ApiService _apiService;
  late final RestClient client;
  bool isLoading = true;

  bool initialized = false;
  List<StudentData> studentDataList = [];
  bool outOfData = false;
  int currentIndex = 0;
  int offsetIndex = 0;

  // Set pour garder une trace des offres postulées
  final Set<String> _appliedOffers = {};

  // Animation controller for card transitions
  late final AnimationController _animationController;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  // App theme colors
  static const Color _indigoColor = Color(0xFF6366F1);
  static const Color _indigoLight = Color(0xFFEEF2FF);
  static const Color _slate800 = Color(0xFF1E293B);
  static const Color _slate500 = Color(0xFF64748B);
  static const Color _slate50 = Color(0xFFF8FAFC);

  bool _actionLocked = false;

  @override
  void initState() {
    super.initState();
    _apiService = GetIt.instance<ApiService>();
    client = widget.client;

    // Setup animation controller
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );

    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.0).animate(
        CurvedAnimation(
            parent: _animationController, curve: Curves.easeOutCubic));

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: _animationController, curve: Curves.easeOut));

    _initStudentData();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _initStudentData() async {
    try {
      final data = await setStudentData();
      if (mounted) {
        setState(() {
          studentData = data;
          isLoading = false;
        });
        // Start animation when card is loaded
        _animationController.forward(from: 0.0);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          studentData = placeholderStudentData()[0];
          isLoading = false;
        });
        // Still animate for placeholder
        _animationController.forward(from: 0.0);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load job data: ${e.toString()}'),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            margin: const EdgeInsets.all(8),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final bool isWideScreen = screenSize.width > 1000;
    final bool isMediumScreen =
        screenSize.width > 650 && screenSize.width <= 1000;

    return ScaffoldMessenger(
      key: _scaffoldKey,
      child: Scaffold(
        backgroundColor: _slate50,
        body: Column(
          children: [
            const NavbarCompany(currentIndex: 5),
            Expanded(
              child: isWideScreen
                  ? _buildWideLayout()
                  : isMediumScreen
                      ? _buildMediumLayout()
                      : _buildMobileLayout(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWideLayout() {
    return Row(
      children: [
        // Left side panel - can add stats or help text here
        Expanded(
          flex: 1,
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: _indigoLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _indigoColor.withOpacity(0.2)),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.swipe, size: 50, color: _indigoColor),
                      SizedBox(height: 16),
                      Text(
                        "Découvrez de nouvelles opportunités",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _slate800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 12),
                      Text(
                        "Balayez à droite pour accepter ou à gauche pour rejeter",
                        style: TextStyle(
                          fontSize: 14,
                          color: _slate500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _buildActionButton(
                  onPressed: isLoading ? null : () => _handleAction(false),
                  icon: Icons.close,
                  label: "Rejeter",
                  color: Colors.red.shade400,
                ),
              ],
            ),
          ),
        ),

        // Center panel - card
        Expanded(
          flex: 2,
          child: Center(
            child: isLoading ? _buildLoadingIndicator() : _buildAnimatedCard(),
          ),
        ),

        // Right side panel
        Expanded(
          flex: 1,
          child: Container(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.check_circle_outline,
                          size: 50, color: Colors.green.shade600),
                      const SizedBox(height: 16),
                      const Text(
                        "Postuler en un clic",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _slate800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        "Votre profil sera automatiquement envoyé à l'employeur",
                        style: TextStyle(
                          fontSize: 14,
                          color: _slate500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _buildActionButton(
                  onPressed: isLoading ? null : () => _handleAction(true),
                  icon: Icons.check,
                  label: "Accepter",
                  color: Colors.green.shade400,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMediumLayout() {
    return Column(
      children: [
        // Top section - instructions
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Card(
                  elevation: 0,
                  color: _indigoLight,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: _indigoColor),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            "Découvrez des offres adaptées à votre profil. Acceptez ou passez selon vos préférences.",
                            style: TextStyle(color: _slate800),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Center section - card
        Expanded(
          child: Center(
            child: isLoading ? _buildLoadingIndicator() : _buildAnimatedCard(),
          ),
        ),

        // Bottom section - action buttons
        Padding(
          padding: const EdgeInsets.all(24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildActionButton(
                onPressed: isLoading ? null : () => _handleAction(false),
                icon: Icons.close,
                label: "Rejeter",
                color: Colors.red.shade400,
              ),
              const SizedBox(width: 48),
              _buildActionButton(
                onPressed: isLoading ? null : () => _handleAction(true),
                icon: Icons.check,
                label: "Accepter",
                color: Colors.green.shade400,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMobileLayout() {
    return Column(
      children: [
        // Top info card
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: _indigoLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              children: [
                Icon(Icons.swipe, size: 20, color: _indigoColor),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Balayez pour découvrir des offres",
                    style: TextStyle(color: _slate800, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Card section
        Expanded(
          child: Center(
            child: isLoading ? _buildLoadingIndicator() : _buildAnimatedCard(),
          ),
        ),

        // Action buttons
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildActionButton(
                onPressed: isLoading ? null : () => _handleAction(false),
                icon: Icons.close,
                label: "Rejeter",
                color: Colors.red.shade400,
                compact: true,
              ),
              _buildActionButton(
                onPressed: isLoading ? null : () => _handleAction(true),
                icon: Icons.check,
                label: "Accepter",
                color: Colors.green.shade400,
                compact: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAnimatedCard() {
    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: child,
          ),
        );
      },
      child: JobCard(data: studentData!),
    );
  }

  Widget _buildActionButton({
    required VoidCallback? onPressed,
    required IconData icon,
    required String label,
    required Color color,
    bool compact = false,
  }) {
    return ElevatedButton.icon(
      onPressed: (isLoading || _actionLocked) ? null : onPressed,
      icon: Icon(icon),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: color,
        padding: EdgeInsets.symmetric(
          horizontal: compact ? 16 : 24,
          vertical: compact ? 12 : 16,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: color.withOpacity(0.5)),
        ),
        elevation: 2,
        shadowColor: color.withOpacity(0.3),
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return const Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(_indigoColor),
        ),
        const SizedBox(height: 16),
        const Text(
          "Chargement des offres...",
          style: TextStyle(color: _slate500, fontSize: 16),
        ),
      ],
    );
  }

  // Méthode pour afficher les Snackbars de manière sécurisée
  void _showSnackBar(String message, {bool isError = false}) {
    // Utiliser la clé globale pour accéder au ScaffoldMessenger
    _scaffoldKey.currentState?.showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
        backgroundColor: isError ? Colors.red.shade400 : Colors.green.shade400,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _recruitStudent(String id) async {
    if (studentData!.isPlaceHolder) {
      debugPrint('Cannot recruitStudent for placeholder data');
      return;
    }

    if (_appliedOffers.contains(id)) {
      _showSnackBar('Vous avez déjà postulé à cette offre');
      return;
    }

    debugPrint('Postulating for offer with ID: $id');
    try {
      final response = await _apiService.recruitStudent(id);

      if (response['id'] != null || response['status'] == 'OPENED') {
        _appliedOffers.add(id);
        _showSnackBar('Candidature envoyée avec succès !');
      } else {
        _showSnackBar('Échec de la candidature. Veuillez réessayer.',
            isError: true);
      }
    } catch (error) {
      _showSnackBar('Erreur: ${error.toString()}', isError: true);
    }
  }

  Future<void> _handleAction(bool accepted) async {
    // Animate out current card
    await _animationController.reverse();

    setState(() {
      isLoading = true;
      _actionLocked = true;
    });

    // Handle action for current card if it's not a placeholder
    if (studentData != null && !studentData!.isPlaceHolder) {
      if (accepted) {
        if (!_appliedOffers.contains(studentData!.id)) {
          await _recruitStudent(studentData!.id);
        } else {
          _showSnackBar('Vous avez déjà postulé à cette offre');
        }
      } else {
        debugPrint('Rejected offer with ID: ${studentData!.id}');
      }
    }

    try {
      final newData = await setStudentData();
      if (!mounted) return;

      setState(() {
        studentData = newData;
        isLoading = false;
        _actionLocked = false;
      });
      // Animate in new card
      _animationController.forward(from: 0.0);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        studentData = placeholderStudentData()[0];
        isLoading = false;
        _actionLocked = false;
      });
      // Animate in placeholder
      _animationController.forward(from: 0.0);

      _showSnackBar('Error loading next job: ${e.toString()}', isError: true);
    }
  }

  Future<StudentData> setStudentData() async {
    if (!initialized) {
      initialized = true;
      studentDataList = await getOfferQuery(0);
      // Filtrer les offres déjà postulées
      studentDataList = studentDataList
          .where((card) => !_appliedOffers.contains(card.id))
          .toList();

      if (studentDataList.isEmpty) {
        outOfData = true;
        currentIndex = 0;
        return placeholderStudentData()[0];
      }
      debugPrint('Card Data initialized with ${studentDataList.length} items');
      return studentDataList[currentIndex];
    }

    if (outOfData) {
      debugPrint('No more data available');
      if (currentIndex == 0) {
        currentIndex = 1;
        return placeholderStudentData()[1];
      } else {
        currentIndex = 0;
        return placeholderStudentData()[0];
      }
    }

    currentIndex++;
    debugPrint('Current index: $currentIndex');
    debugPrint('Card data list length: ${studentDataList.length}');

    if (currentIndex >= studentDataList.length) {
      debugPrint('Fetching more data');
      offsetIndex = offsetIndex + currentIndex;
      currentIndex = 0;
      final newCards = await getOfferQuery(offsetIndex);
      // Filtrer les nouvelles offres pour exclure celles déjà postulées
      studentDataList =
          newCards.where((card) => !_appliedOffers.contains(card.id)).toList();

      if (studentDataList.isEmpty) {
        outOfData = true;
        currentIndex = 0;
        return placeholderStudentData()[0];
      }
      return studentDataList[currentIndex];
    }

    return studentDataList[currentIndex];
  }

  Future<List<StudentData>> getOfferQuery(int offset) async {
    try {
      final query = {
        'offset': offset.toString(),
        'limit': '10', // Add limit for pagination
      };

      final response = await _apiService.getAllStudentsQuery(query);
      final List<StudentProfile> students = response['rows'];

      final List<StudentData> studentDataList =
          transformStudentsToCards(students);
      if (studentDataList.isEmpty) {
        return placeholderStudentData();
      }

      return studentDataList;
    } catch (e) {
      throw Exception('Failed to load offers: $e');
    }
  }

  StudentData transformStudentProfileToCard(StudentProfile profile) {
    final List<String> skillsList = profile.skills ?? [];

    return StudentData(
      studentName: profile.name,
      studentImage: profile.avatar ?? '',
      studentSchool: profile.schoolName ?? '',
      contractType: 'Internship', // Default value, can be customized
      duration: 'N/A',
      location: 'Location currently not available',
      salary: 'N/A',
      benefits: [],
      technicalSkills: skillsList,
      details: profile.description ?? '',
      id: profile.userId,
      userid: profile.userId,
      status: 'Active',
      showDetails: false,
      isPlaceHolder: false,
      education: profile.education,
      experiences: profile.experiences,
      age: profile.age,
    );
  }

  List<StudentData> transformStudentsToCards(List<StudentProfile> offers) {
    return offers.map(transformStudentProfileToCard).toList();
  }

  List<StudentData> placeholderStudentData() {
    return [
      StudentData(
        studentName: 'Fin des offres',
        studentImage: '',
        studentSchool: 'Aucune offre disponible',
        contractType: '-',
        duration: '-',
        location: '-',
        salary: '-',
        benefits: const [],
        technicalSkills: const [],
        details: 'Il n\'y a plus d\'offres disponibles pour le moment.',
        id: 'placeholder_1',
        userid: 'placeholder',
        status: 'placeholder',
        isPlaceHolder: true,
      ),
      StudentData(
        studentName: 'Recherchez plus tard',
        studentImage: '',
        studentSchool: 'Revenez bientôt',
        contractType: '-',
        duration: '-',
        location: '-',
        salary: '-',
        benefits: const [],
        technicalSkills: const [],
        details: 'De nouvelles offres seront bientôt disponibles.',
        id: 'placeholder_2',
        userid: 'placeholder',
        status: 'placeholder',
        isPlaceHolder: true,
      )
    ];
  }
}

// Enhance the JobCard to use consistent theming and better styling
class JobCard extends StatefulWidget {
  final StudentData data;

  const JobCard({super.key, required this.data});

  @override
  State<JobCard> createState() => _JobCardState();
}

class _JobCardState extends State<JobCard> {
  bool _showFullDetails = false;

  // App theme colors
  static const Color _indigoColor = Color(0xFF6366F1);
  static const Color _indigoLight = Color(0xFFEEF2FF);
  static const Color _slate800 = Color(0xFF1E293B);
  static const Color _slate600 = Color(0xFF475569);
  static const Color _slate500 = Color(0xFF64748B);
  static const Color _slate200 = Color(0xFFE2E8F0);
  static const Color _slate50 = Color(0xFFF8FAFC);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 480,
      constraints: const BoxConstraints(
        minHeight: 350,
        maxHeight: 680,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: _slate500.withOpacity(0.15),
            spreadRadius: 0,
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
        border: Border.all(color: _slate200),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with logo and company name
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: _indigoLight,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                ),
              ),
              child: Row(
                children: [
                  _buildstudentImage(widget.data.studentImage),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      widget.data.studentName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: _slate800,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            // Job title
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Text(
                widget.data.studentSchool,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: _slate800,
                ),
              ),
            ),

            // Main info grid (2x2)
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.cake_outlined,
                          label: "Âge",
                          value: widget.data.age?.toString() ?? "Non spécifié",
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.code,
                          label: "Compétences",
                          value: widget.data.technicalSkills.isNotEmpty
                              ? widget.data.technicalSkills.join(", ")
                              : "Aucune",
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.history_edu_outlined,
                          label: "Expérience",
                          value: (widget.data.experiences?.isNotEmpty ?? false)
                              ? widget.data.experiences!
                                  .map((e) => e.title)
                                  .whereType<String>()
                                  .join(", ")
                              : "Aucune",
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.euro_outlined,
                          label: "School",
                          value: widget.data.studentSchool.isEmpty
                              ? "Non spécifié"
                              : widget.data.studentSchool,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Description
            if (widget.data.details.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Texte de motivation",
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: _slate800,
                      ),
                    ),
                    const SizedBox(height: 10),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _showFullDetails = !_showFullDetails;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _slate50,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _slate200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.data.details,
                              style: const TextStyle(
                                fontSize: 14,
                                color: _slate600,
                                height: 1.6,
                              ),
                              maxLines: _showFullDetails ? null : 4,
                              overflow: _showFullDetails
                                  ? TextOverflow.visible
                                  : TextOverflow.ellipsis,
                            ),
                            if (widget.data.details.length > 150)
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: () {
                                    setState(() {
                                      _showFullDetails = !_showFullDetails;
                                    });
                                  },
                                  style: TextButton.styleFrom(
                                    foregroundColor: _indigoColor,
                                    padding: EdgeInsets.zero,
                                    minimumSize: Size.zero,
                                    tapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  child: Text(
                                    _showFullDetails
                                        ? "Voir moins"
                                        : "Voir plus",
                                    style: const TextStyle(fontSize: 13),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildstudentImage(String logoPath) {
    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: _slate500.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: logoPath.isEmpty || logoPath.contains('placeholder')
            ? const Icon(Icons.business, size: 24, color: _slate500)
            : _getLogoWidget(logoPath),
      ),
    );
  }

  Widget _getLogoWidget(String logoPath) {
    try {
      if (logoPath.toLowerCase().endsWith('.svg')) {
        return SvgPicture.asset(
          logoPath,
          placeholderBuilder: (context) =>
              const Icon(Icons.business, size: 24, color: _slate500),
          height: 30,
          width: 30,
        );
      } else {
        return Image.asset(
          logoPath,
          height: 30,
          width: 30,
          errorBuilder: (context, error, stackTrace) {
            return const Icon(Icons.business, size: 24, color: _slate500);
          },
        );
      }
    } catch (e) {
      return const Icon(Icons.business, size: 24, color: _slate500);
    }
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _slate50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: _slate500),
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: _slate500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: _slate800,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
