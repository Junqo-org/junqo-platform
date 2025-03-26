import 'package:flutter/material.dart';
import '../shared/widgets/navbar_company.dart';
import 'package:ferry/ferry.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/services/offer_service.dart';
import 'package:junqo_front/core/auth_service.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';

class JobOfferForm extends StatefulWidget {
  final Client client;

  const JobOfferForm({
    super.key,
    required this.client,
  });

  @override
  State<JobOfferForm> createState() => _JobOfferFormState();
}

class _JobOfferFormState extends State<JobOfferForm> {
  final OfferService offerService = GetIt.instance<OfferService>();
  final AuthService authService = GetIt.instance<AuthService>();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String _workLocationType =
      'Sur place'; // Valeurs possibles: 'Sur place', 'Distanciel'
  DateTime? _expirationDate;

  // Type d'offre
  String _offerType = 'Stage';

  // Durée d'expiration
  String _expiresIn = '1 mois';

  // Contrôleurs pour les champs de texte
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _companyController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _durationController = TextEditingController();
  final TextEditingController _profileController = TextEditingController();
  final TextEditingController _salaryController = TextEditingController();
  final TextEditingController _skillsController = TextEditingController();
  final TextEditingController _educationController = TextEditingController();
  final TextEditingController _benefitsController = TextEditingController();

  // Mots-clés et compétences
  List<String> _selectedSkills = [];
  final FocusNode _skillsFocusNode = FocusNode();

  // Niveau d'études requis
  String _educationLevel = 'Bac+3';
  final List<String> _educationLevels = [
    'Bac',
    'Bac+1',
    'Bac+2',
    'Bac+3',
    'Bac+4',
    'Bac+5',
    'Bac+8',
  ];

  // Ajouter ces variables avec les autres variables d'état
  List<String> _selectedBenefits = [];
  final FocusNode _benefitsFocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _skillsFocusNode.addListener(() {
      if (!_skillsFocusNode.hasFocus) {
        _addSkillFromController();
      }
    });
    _benefitsFocusNode.addListener(() {
      if (!_benefitsFocusNode.hasFocus) {
        _addBenefitFromController();
      }
    });
  }

  void _addSkillFromController() {
    if (_skillsController.text.isNotEmpty) {
      setState(() {
        _selectedSkills.add(_skillsController.text.trim());
        _skillsController.clear();
      });
    }
  }

  void _removeSkill(String skill) {
    setState(() {
      _selectedSkills.remove(skill);
    });
  }

  void _addBenefitFromController() {
    if (_benefitsController.text.isNotEmpty) {
      setState(() {
        _selectedBenefits.add(_benefitsController.text.trim());
        _benefitsController.clear();
      });
    }
  }

  void _removeBenefit(String benefit) {
    setState(() {
      _selectedBenefits.remove(benefit);
    });
  }

  Future<void> _selectDate(BuildContext context, bool isStartDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStartDate
          ? _expirationDate ?? DateTime.now().add(const Duration(days: 14))
          : _expirationDate ??
              (_expirationDate?.add(const Duration(days: 90)) ??
                  DateTime.now().add(const Duration(days: 104))),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF6366F1), // Indigo
              onPrimary: Colors.white,
              onSurface: Color(0xFF1E293B), // Slate 800
            ),
            dialogBackgroundColor: Colors.white,
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      if (!mounted) return;
      setState(() {
        if (isStartDate) {
          _expirationDate = picked;
          // Si la date de fin est avant la nouvelle date de début, on l'ajuste
          if (_expirationDate != null && _expirationDate!.isBefore(picked)) {
            _expirationDate = picked.add(const Duration(days: 90));
          }
        } else {
          _expirationDate = picked;
        }
      });
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }

  void _submitJobOffer() async {
    if (_formKey.currentState?.validate() ?? false) {
      setState(() => _isLoading = true);

      final scaffoldContext = ScaffoldMessenger.of(context);
      final navigatorContext = Navigator.of(context);

      try {
        final String titleValue = _titleController.text;

        final OfferData jobOffer = OfferData(
          title: _titleController.text,
          description: _descriptionController.text,
          offerType: _offerType,
          duration: _durationController.text,
          salary: _salaryController.text,
          workLocationType: _workLocationType,
          skills: _selectedSkills,
          benefits: _selectedBenefits,
          educationLevel: _educationLevel,
          userid: authService.userId ?? '',
          status: 'active',
        );

        print(jobOffer);

        await Future.delayed(const Duration(seconds: 2));
        //await offerService.createOffer(jobOffer);

        // Vérification si le widget est toujours monté
        if (!mounted) return;

        // Utiliser un Future.microtask pour s'assurer que l'opération est effectuée après la fin du cycle de rendu actuel
        Future.microtask(() {
          if (!mounted) return;
          showDialog(
            context: context,
            barrierDismissible:
                false, // Empêche la fermeture en cliquant à l'extérieur
            builder: (BuildContext dialogContext) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                backgroundColor: Colors.white,
                contentPadding: EdgeInsets.zero,
                content: Container(
                  width: 400,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: const BoxDecoration(
                          color: Color(0xFF6366F1), // Indigo
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(20),
                            topRight: Radius.circular(20),
                          ),
                        ),
                        child: Center(
                          child: Column(
                            children: [
                              const Icon(
                                Icons.check_circle_outline,
                                color: Colors.white,
                                size: 60,
                              ),
                              const SizedBox(height: 16),
                              Text(
                                "Offre de ${_offerType.toLowerCase()} créée !",
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Text(
                              "Votre offre « $titleValue » a été créée avec succès !",
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFF334155), // Slate 700
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              "Elle sera visible par les candidats après validation par notre équipe.",
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: Color(0xFF64748B), // Slate 500
                              ),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.of(dialogContext).pop();

                                    // Vérifier si le widget est toujours monté avant de modifier l'état
                                    if (mounted) {
                                      // Reset form
                                      _formKey.currentState?.reset();
                                      _titleController.clear();
                                      _descriptionController.clear();
                                      _companyController.clear();
                                      _locationController.clear();
                                      _durationController.clear();
                                      _profileController.clear();
                                      _salaryController.clear();
                                      _skillsController.clear();
                                      _educationController.clear();
                                      _benefitsController.clear();
                                      setState(() {
                                        _selectedSkills = [];
                                        _selectedBenefits = [];
                                        _expirationDate = null;
                                        _workLocationType = 'Sur place';
                                        _expiresIn = '1 mois';
                                        _isLoading = false;
                                      });
                                    }
                                  },
                                  style: TextButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      side: BorderSide(
                                          color: Colors.grey.shade300),
                                    ),
                                  ),
                                  child: const Text(
                                    "Créer une autre offre",
                                    style: TextStyle(
                                      color: Color(0xFF6366F1), // Indigo
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(dialogContext).pop();
                                    // Navigation sécurisée
                                    if (mounted) {
                                      navigatorContext
                                          .pushReplacementNamed('/my-offers');
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                        const Color(0xFF6366F1), // Indigo
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: const Text(
                                    "Voir mes offres",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        });
      } catch (e) {
        // Vérifier si le widget est toujours monté
        if (!mounted) return;

        // Utiliser le scaffoldContext capturé pour afficher le message d'erreur
        scaffoldContext.showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la création de l\'offre: $e'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );

        // Mettre à jour l'état si le widget est toujours monté
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    } else {
      // Vérifier si le widget est toujours monté
      if (!mounted) return;

      // Afficher un message si le formulaire n'est pas valide
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez remplir tous les champs obligatoires'),
          backgroundColor: Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10)),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(
                color: Color(0xFF6366F1), // Indigo
              ),
              const SizedBox(height: 24),
              Text(
                "Création de votre offre en cours...",
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50
      body: Column(
        children: [
          const NavbarCompany(currentIndex: 1),
          Expanded(
            child: Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 800),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildHeader(),
                        const SizedBox(height: 32),
                        _buildOfferTypeSelector(),
                        const SizedBox(height: 24),
                        _buildBasicInfoCard(),
                        const SizedBox(height: 24),
                        _buildDescriptionCard(),
                        const SizedBox(height: 24),
                        _buildProfileCard(),
                        const SizedBox(height: 24),
                        _buildAdditionalDetailsCard(),
                        const SizedBox(height: 40),
                        _buildSubmitButton(),
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
                color: const Color(0xFF6366F1)
                    .withOpacity(0.1), // Indigo with opacity
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                Icons.work_outline_rounded,
                color: Color(0xFF6366F1), // Indigo
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Créer une nouvelle offre",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B), // Slate 800
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    "Publiez une offre pour trouver les meilleurs talents",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF64748B), // Slate 500
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
              Icon(Icons.info_outline_rounded,
                  color: Color(0xFF3B82F6)), // Blue 500
              SizedBox(width: 16),
              Expanded(
                child: Text(
                  "Les offres complètes avec un maximum de détails attirent davantage de candidats qualifiés. Prenez le temps de remplir tous les champs.",
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

  Widget _buildOfferTypeSelector() {
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
                  Icons.category_outlined,
                  color: Color(0xFF6366F1), // Indigo
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  "Type d'offre",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate 800
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              "Sélectionnez le type d'offre que vous souhaitez publier",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B), // Slate 500
              ),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _offerType = 'Stage'),
                    child: _buildOfferTypeOption(
                      title: 'Stage',
                      description: 'Pour une période de formation pratique',
                      icon: Icons.school_outlined,
                      isSelected: _offerType == 'Stage',
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _offerType = 'Alternance'),
                    child: _buildOfferTypeOption(
                      title: 'Alternance',
                      description:
                          'Formation alternant périodes en entreprise et à l\'école',
                      icon: Icons.sync_alt_outlined,
                      isSelected: _offerType == 'Alternance',
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

  Widget _buildOfferTypeOption({
    required String title,
    required String description,
    required IconData icon,
    required bool isSelected,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isSelected
            ? const Color(0xFF6366F1).withOpacity(0.08) // Indigo with opacity
            : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isSelected
              ? const Color(0xFF6366F1) // Indigo
              : const Color(0xFFE2E8F0), // Slate 200
          width: 1.5,
        ),
        boxShadow: isSelected
            ? [
                BoxShadow(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: isSelected
                    ? const Color(0xFF6366F1) // Indigo
                    : const Color(0xFF94A3B8), // Slate 400
                size: 22,
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isSelected
                      ? const Color(0xFF6366F1) // Indigo
                      : const Color(0xFF0F172A), // Slate 900
                ),
              ),
              if (isSelected) const Spacer(),
              if (isSelected)
                const Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF6366F1), // Indigo
                  size: 20,
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: TextStyle(
              fontSize: 13,
              color: isSelected
                  ? const Color(0xFF6366F1)
                      .withOpacity(0.8) // Indigo with opacity
                  : const Color(0xFF64748B), // Slate 500
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBasicInfoCard() {
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
                  Icons.info_outline_rounded,
                  color: Color(0xFF6366F1), // Indigo
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  "Informations de base",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate 800
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Informations essentielles de votre offre",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B), // Slate 500
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _titleController,
              style: const TextStyle(
                color: Color(0xFF1E293B), // Couleur du texte en noir/gris foncé
                fontSize: 14,
              ),
              decoration: InputDecoration(
                labelText: "Titre de l'offre *",
                hintText: "Ex: Développeur Web en alternance",
                filled: true,
                fillColor: const Color(0xFFF8FAFC), // Slate 50
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFFE2E8F0), // Slate 200
                    width: 1.5,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF6366F1), // Indigo
                    width: 1.5,
                  ),
                ),
                floatingLabelStyle: const TextStyle(
                  color: Color(0xFF6366F1), // Indigo
                ),
                prefixIcon: const Icon(
                  Icons.title_rounded,
                  color: Color(0xFF94A3B8), // Slate 400
                ),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return "Le titre est obligatoire";
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _durationController,
                    style: const TextStyle(
                      color: Color(0xFF1E293B),
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      labelText: "Durée",
                      hintText:
                          _offerType == 'Stage' ? "Ex: 6 mois" : "Ex: 12 mois",
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC), // Slate 50
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFFE2E8F0), // Slate 200
                          width: 1.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFF6366F1), // Indigo
                          width: 1.5,
                        ),
                      ),
                      floatingLabelStyle: const TextStyle(
                        color: Color(0xFF6366F1), // Indigo
                      ),
                      prefixIcon: const Icon(
                        Icons.access_time_rounded,
                        color: Color(0xFF94A3B8), // Slate 400
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _salaryController,
                    style: const TextStyle(
                      color: Color(0xFF1E293B),
                      fontSize: 14,
                    ),
                    decoration: InputDecoration(
                      labelText: "Rémunération",
                      hintText: "Ex: 800€/mois",
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC), // Slate 50
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFFE2E8F0), // Slate 200
                          width: 1.5,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(
                          color: Color(0xFF6366F1), // Indigo
                          width: 1.5,
                        ),
                      ),
                      floatingLabelStyle: const TextStyle(
                        color: Color(0xFF6366F1), // Indigo
                      ),
                      prefixIcon: const Icon(
                        Icons.euro_rounded,
                        color: Color(0xFF94A3B8), // Slate 400
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Expire dans",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC), // Slate 50
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFFE2E8F0), // Slate 200
                            width: 1.5,
                          ),
                        ),
                        child: DropdownButtonFormField<String>(
                          value: _expiresIn,
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 11),
                          ),
                          icon: const Icon(
                            Icons.arrow_drop_down,
                            color: Color(0xFF94A3B8), // Slate 400
                          ),
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF334155), // Slate 700
                          ),
                          dropdownColor: Colors.white,
                          items: const [
                            DropdownMenuItem<String>(
                              value: '1 mois',
                              child: Text('1 mois'),
                            ),
                            DropdownMenuItem<String>(
                              value: '3 mois',
                              child: Text('3 mois'),
                            ),
                            DropdownMenuItem<String>(
                              value: '6 mois',
                              child: Text('6 mois'),
                            ),
                            DropdownMenuItem<String>(
                              value: '12 mois',
                              child: Text('12 mois'),
                            ),
                          ],
                          onChanged: (String? newValue) {
                            if (newValue != null) {
                              setState(() {
                                _expiresIn = newValue;
                              });
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Container(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC), // Slate 50
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: const Color(0xFFE2E8F0), // Slate 200
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        const SizedBox(width: 12),
                        Icon(
                          _workLocationType == 'Distanciel'
                              ? Icons.wifi_rounded
                              : Icons.location_on_rounded,
                          color: const Color(0xFF94A3B8), // Slate 400
                          size: 18,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                "Lieu",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF64748B), // Slate 500
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                _workLocationType == 'Distanciel'
                                    ? "Distanciel"
                                    : "Sur place (adresse du profil)",
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF334155), // Slate 700
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFE2E8F0), // Slate 200
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Type de lieu",
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF334155), // Slate 700
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _buildLocationTypeOption(
                            label: "Sur place",
                            isSelected: _workLocationType == "Sur place",
                            onTap: () =>
                                setState(() => _workLocationType = "Sur place"),
                          ),
                          const SizedBox(width: 8),
                          _buildLocationTypeOption(
                            label: "Distanciel",
                            isSelected: _workLocationType == "Distanciel",
                            onTap: () => setState(
                                () => _workLocationType = "Distanciel"),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationTypeOption({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF6366F1) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF64748B),
            fontWeight: FontWeight.w500,
            fontSize: 13,
          ),
        ),
      ),
    );
  }

  Widget _buildDescriptionCard() {
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
                  color: Color(0xFF6366F1), // Indigo
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  "Description de l'offre",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate 800
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Décrivez les missions, le contexte et les objectifs",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B), // Slate 500
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _descriptionController,
              maxLines: 8,
              style: const TextStyle(
                color: Color(0xFF1E293B), // Couleur du texte en noir/gris foncé
                fontSize: 14,
              ),
              decoration: InputDecoration(
                labelText: "Description détaillée *",
                hintText:
                    "Détaillez les missions, le contexte, les objectifs et les technologies utilisées...",
                filled: true,
                fillColor: const Color(0xFFF8FAFC), // Slate 50
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFFE2E8F0), // Slate 200
                    width: 1.5,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF6366F1), // Indigo
                    width: 1.5,
                  ),
                ),
                floatingLabelStyle: const TextStyle(
                  color: Color(0xFF6366F1), // Indigo
                ),
                alignLabelWithHint: true,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return "La description est obligatoire";
                }
                if (value.length < 50) {
                  return "La description doit faire au moins 50 caractères";
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _benefitsController,
              focusNode: _benefitsFocusNode,
              style: const TextStyle(
                color: Color(0xFF1E293B),
                fontSize: 14,
              ),
              decoration: InputDecoration(
                labelText: "Avantages proposés",
                hintText: "Ajouter un avantage et appuyer sur Entrée",
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
                prefixIcon: const Icon(
                  Icons.add_circle_outline_rounded,
                  color: Color(0xFF94A3B8),
                ),
                suffixIcon: IconButton(
                  icon: const Icon(
                    Icons.add_circle_rounded,
                    color: Color(0xFF6366F1),
                  ),
                  onPressed: _addBenefitFromController,
                ),
              ),
              onEditingComplete: _addBenefitFromController,
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 10,
              children: _selectedBenefits.map((benefit) {
                return Chip(
                  label: Text(benefit),
                  labelStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                  ),
                  backgroundColor: const Color(0xFF6366F1),
                  side: BorderSide.none,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  deleteIcon: const Icon(
                    Icons.cancel_rounded,
                    size: 18,
                    color: Colors.white,
                  ),
                  onDeleted: () => _removeBenefit(benefit),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                  visualDensity: VisualDensity.compact,
                  elevation: 0,
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
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
                  color: Color(0xFF6366F1), // Indigo
                  size: 22,
                ),
                SizedBox(width: 12),
                Text(
                  "Profil recherché",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate 800
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Décrivez le candidat idéal pour ce poste",
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B), // Slate 500
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Niveau d'études requis",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF334155), // Slate 700
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC), // Slate 50
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: const Color(0xFFE2E8F0), // Slate 200
                            width: 1.5,
                          ),
                        ),
                        child: DropdownButtonFormField<String>(
                          value: _educationLevel,
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 11),
                          ),
                          icon: const Icon(
                            Icons.arrow_drop_down,
                            color: Color(0xFF94A3B8), // Slate 400
                          ),
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF334155), // Slate 700
                          ),
                          dropdownColor: Colors.white,
                          items: _educationLevels.map((String level) {
                            return DropdownMenuItem<String>(
                              value: level,
                              child: Text(level),
                            );
                          }).toList(),
                          onChanged: (String? newValue) {
                            if (newValue != null) {
                              setState(() {
                                _educationLevel = newValue;
                              });
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Formation / Spécialisation",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF334155), // Slate 700
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _educationController,
                        style: const TextStyle(
                          color: Color(
                              0xFF1E293B), // Couleur du texte en noir/gris foncé
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          hintText: "Ex: Informatique, Développement Web",
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC), // Slate 50
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFFE2E8F0), // Slate 200
                              width: 1.5,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(
                              color: Color(0xFF6366F1), // Indigo
                              width: 1.5,
                            ),
                          ),
                          floatingLabelStyle: const TextStyle(
                            color: Color(0xFF6366F1), // Indigo
                          ),
                          prefixIcon: const Icon(
                            Icons.school_rounded,
                            color: Color(0xFF94A3B8), // Slate 400
                          ),
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              "Compétences requises",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Color(0xFF334155), // Slate 700
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _skillsController,
              focusNode: _skillsFocusNode,
              style: const TextStyle(
                color: Color(0xFF1E293B), // Couleur du texte en noir/gris foncé
                fontSize: 14,
              ),
              decoration: InputDecoration(
                hintText: "Ajouter une compétence et appuyer sur Entrée",
                filled: true,
                fillColor: const Color(0xFFF8FAFC), // Slate 50
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFFE2E8F0), // Slate 200
                    width: 1.5,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: Color(0xFF6366F1), // Indigo
                    width: 1.5,
                  ),
                ),
                prefixIcon: const Icon(
                  Icons.add_circle_outline_rounded,
                  color: Color(0xFF94A3B8), // Slate 400
                ),
                suffixIcon: IconButton(
                  icon: const Icon(
                    Icons.add_circle_rounded,
                    color: Color(0xFF6366F1), // Indigo
                  ),
                  onPressed: _addSkillFromController,
                ),
              ),
              onEditingComplete: _addSkillFromController,
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 10,
              children: _selectedSkills.map((skill) {
                return Chip(
                  label: Text(skill),
                  labelStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontSize: 13,
                  ),
                  backgroundColor: const Color(0xFF6366F1), // Indigo
                  side: BorderSide.none,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  deleteIcon: const Icon(
                    Icons.cancel_rounded,
                    size: 18,
                    color: Colors.white,
                  ),
                  onDeleted: () => _removeSkill(skill),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                  visualDensity: VisualDensity.compact,
                  elevation: 0,
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalDetailsCard() {
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
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: const LinearGradient(
            begin: Alignment.topRight,
            end: Alignment.bottomLeft,
            colors: [
              Color(0xFFEEF2FF), // Indigo 50
              Colors.white,
            ],
          ),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7), // Amber 100
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.lightbulb_rounded,
                    color: Color(0xFFD97706), // Amber 600
                    size: 22,
                  ),
                ),
                const SizedBox(width: 16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Conseils pour attirer les meilleurs candidats",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B), // Slate 800
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "Quelques astuces pour optimiser votre offre",
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFF64748B), // Slate 500
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Row(
              children: [
                Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981), // Emerald 500
                  size: 18,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Donnez un titre précis et attractif qui indique clairement le poste",
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF334155), // Slate 700
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Row(
              children: [
                Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981), // Emerald 500
                  size: 18,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Précisez les technologies et outils que le candidat utilisera",
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF334155), // Slate 700
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Row(
              children: [
                Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981), // Emerald 500
                  size: 18,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Mentionnez les possibilités d'évolution et de formation",
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF334155), // Slate 700
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            const Row(
              children: [
                Icon(
                  Icons.check_circle_rounded,
                  color: Color(0xFF10B981), // Emerald 500
                  size: 18,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    "Précisez si une embauche est possible à l'issue du stage/alternance",
                    style: TextStyle(
                      fontSize: 14,
                      color: Color(0xFF334155), // Slate 700
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

  Widget _buildSubmitButton() {
    return Center(
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6366F1).withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 5),
              spreadRadius: -5,
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: _submitJobOffer,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6366F1), // Indigo
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.publish_rounded),
              const SizedBox(width: 12),
              Text(
                "Publier l'offre de ${_offerType.toLowerCase()}",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _companyController.dispose();
    _locationController.dispose();
    _durationController.dispose();
    _profileController.dispose();
    _salaryController.dispose();
    _skillsController.dispose();
    _educationController.dispose();
    _benefitsController.dispose();
    _skillsFocusNode.dispose();
    _benefitsFocusNode.dispose();
    super.dispose();
  }
}
