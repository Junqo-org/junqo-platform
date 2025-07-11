import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../shared/widgets/navbar_company.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/pages/offer_detail.dart';
import 'package:junqo_front/pages/offer_creation.dart';
import 'package:junqo_front/core/client.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/services/offer_service.dart';

class OfferList extends StatefulWidget {
  const OfferList({super.key});

  @override
  State<OfferList> createState() => _OfferListState();
}

class _OfferListState extends State<OfferList> {
  final OfferService _offerService = GetIt.instance<OfferService>();
  List<OfferData> _myOffers = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _isPermissionError = false;

  @override
  void initState() {
    super.initState();
    _loadMyOffers();
  }

  Future<void> _loadMyOffers() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
        _isPermissionError = false;
      });

      final offers = await _offerService.getMyOffers();

      setState(() {
        _myOffers = offers;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;

        // Vérifier si c'est une erreur d'autorisation (403)
        if (e.toString().contains('403') ||
            e.toString().contains('permission')) {
          _isPermissionError = true;
          _errorMessage =
              "Vous n'avez pas les permissions nécessaires pour accéder aux offres. "
              "Seuls les utilisateurs de type COMPANY peuvent accéder à cette fonctionnalité.";
        } else {
          _errorMessage =
              'Erreur lors du chargement des offres: ${e.toString()}';
        }
      });
    }
  }

  void _toggleOfferStatus(OfferData offer) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        final bool isActivating = offer.status.toLowerCase() == 'inactive';
        return AlertDialog(
          title: Text(
            isActivating ? "Activer cette offre ?" : "Désactiver cette offre ?",
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          content: Text(
            isActivating
                ? "L'offre sera visible pour les candidats."
                : "L'offre ne sera plus visible pour les candidats.",
            style: const TextStyle(
              color: Color(0xFF64748B),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: const Text(
                "Annuler",
                style: TextStyle(
                  color: Color(0xFF64748B),
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(dialogContext).pop();

                if (!mounted) return;

                try {
                  setState(() => _isLoading = true);

                  final String newStatus = isActivating ? 'ACTIVE' : 'INACTIVE';

                  // Mettre à jour l'offre avec le nouveau statut
                  final updatedOffer = OfferData(
                    id: offer.id,
                    userid: offer.userid,
                    title: offer.title,
                    description: offer.description,
                    offerType: offer.offerType,
                    duration: offer.duration,
                    salary: offer.salary,
                    workLocationType: offer.workLocationType,
                    skills: offer.skills,
                    benefits: offer.benefits,
                    educationLevel: offer.educationLevel,
                    status: newStatus,
                  );

                  await _offerService.updateOffer(offer.id!, updatedOffer);

                  // Recharger les offres après la mise à jour
                  await _loadMyOffers();

                } catch (e) {
                  if (!mounted) return;

                  setState(() {
                    _isLoading = false;
                    _errorMessage = "Erreur lors de la mise à jour de l'offre: ${e.toString()}";
                  });

                  if (!mounted) return;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("Erreur: ${e.toString()}"),
                      backgroundColor: Colors.red,
                    ),
                  );
                } finally {
                  if (mounted) {
                    setState(() => _isLoading = false);
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: isActivating
                    ? const Color(0xFF10B981) // Emerald 500
                    : const Color(0xFFEF4444), // Red 500
                foregroundColor: Colors.white,
              ),
              child: Text(
                isActivating ? "Activer" : "Désactiver",
              ),
            ),
          ],
        ).animate().scale(begin: const Offset(0.8, 0.8), duration: 200.ms);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Navigation vers la page de création d'offre
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  JobOfferForm(client: GetIt.instance<RestClient>()),
            ),
          ).then((result) {
            if (result == true || result == null) {
              _loadMyOffers();
            }
          }); // Recharger les offres après création
        },
        backgroundColor: const Color(0xFF6366F1), // Indigo
        label: const Text(
          "Nouvelle offre",
          style: TextStyle(
            fontWeight: FontWeight.w500,
          ),
        ),
        icon: const Icon(Icons.add),
        elevation: 4,
      ).animate().scale(delay: 500.ms, duration: 400.ms, curve: Curves.elasticOut),
      body: Column(
        children: [
          const NavbarCompany(
              currentIndex: 1), // Mettre l'index qui correspond à cette page
          Expanded(
            child: _isLoading
                ? _buildLoadingIndicator()
                : _errorMessage != null
                    ? _buildErrorMessage()
                    : SingleChildScrollView(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildHeader()
                                .animate()
                                .fadeIn(duration: 400.ms)
                                .slideY(begin: -0.2, end: 0),
                            const SizedBox(height: 24),
                            _buildOfferList(),
                          ],
                        ),
                      ).animate().fadeIn(duration: 300.ms),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            color: Color(0xFF6366F1), // Indigo
          ).animate(onPlay: (controller) => controller.repeat())
              .rotate(duration: 1.seconds)
              .then()
              .scale(begin: const Offset(1, 1), end: const Offset(1.1, 1.1), duration: 600.ms)
              .then()
              .scale(begin: const Offset(1.1, 1.1), end: const Offset(1, 1), duration: 600.ms),
          const SizedBox(height: 16),
          const Text(
            "Chargement des offres...",
            style: TextStyle(
              color: Color(0xFF64748B), // Slate 500
              fontSize: 16,
            ),
          ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
        ],
      ),
    );
  }

  Widget _buildErrorMessage() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            _isPermissionError ? Icons.no_accounts : Icons.error_outline,
            color: _isPermissionError ? const Color(0xFFEF4444) : Colors.red,
            size: 48,
          ).animate()
              .scale(duration: 400.ms, curve: Curves.elasticOut)
              .shake(delay: 400.ms, duration: 300.ms),
          const SizedBox(height: 16),
          Text(
            _errorMessage ?? "Une erreur est survenue",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: _isPermissionError ? const Color(0xFFEF4444) : Colors.red,
              fontSize: 16,
            ),
          ).animate().fadeIn(delay: 200.ms, duration: 400.ms),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _isPermissionError
                ? () {
                    // Rediriger vers une page accessible
                    Navigator.of(context).pushReplacementNamed('/profile');
                  }
                : _loadMyOffers,
            icon: Icon(_isPermissionError ? Icons.person : Icons.refresh),
            label:
                Text(_isPermissionError ? "Aller à mon profil" : "Réessayer"),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1), // Indigo
              foregroundColor: Colors.white,
            ),
          ).animate()
              .fadeIn(delay: 400.ms, duration: 400.ms)
              .slideY(begin: 0.2, end: 0),
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
            ).animate()
                .scale(delay: 100.ms, duration: 400.ms, curve: Curves.elasticOut),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Mes offres",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B), // Slate 800
                    ),
                  ).animate()
                      .fadeIn(delay: 200.ms, duration: 400.ms)
                      .slideX(begin: -0.2, end: 0),
                  const SizedBox(height: 6),
                  const Text(
                    "Retrouvez toutes vos offres publiées",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF64748B), // Slate 500
                    ),
                  ).animate()
                      .fadeIn(delay: 300.ms, duration: 400.ms)
                      .slideX(begin: -0.2, end: 0),
                ],
              ),
            ),
            Container(
              margin: const EdgeInsets.only(left: 16),
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          JobOfferForm(client: GetIt.instance<RestClient>()),
                    ),
                  ).then((result) {
                    if (result == true || result == null) {
                      _loadMyOffers();
                    }
                  });
                },
                icon: const Icon(Icons.add_circle_outline),
                label: const Text("Créer une offre"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6366F1), // Indigo
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
              ),
            ).animate()
                .fadeIn(delay: 400.ms, duration: 400.ms)
                .scale(begin: const Offset(0.8, 0.8)),
          ],
        ),
        const SizedBox(height: 16),
        _buildCreateOfferSection(),
      ],
    );
  }

  Widget _buildCreateOfferSection() {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFFEEF2FF), // Indigo 50
            Color(0xFFC7D2FE), // Indigo 200
          ],
        ),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Publiez une nouvelle offre",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF312E81), // Indigo 900
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  "Créez une offre pour trouver les meilleurs talents pour votre entreprise",
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF4338CA), // Indigo 700
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 20),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      JobOfferForm(client: GetIt.instance<RestClient>()),
                ),
              ).then((result) {
                if (result == true || result == null) {
                  _loadMyOffers();
                }
              });
            },
            icon: const Icon(Icons.add),
            label: const Text("Nouvelle offre"),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF6366F1), // Indigo
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(
                  color: Color(0xFF6366F1),
                  width: 1.5,
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
          ),
        ],
      ),
    ).animate()
        .fadeIn(delay: 500.ms, duration: 500.ms)
        .slideY(begin: 0.1, end: 0);
  }

  Widget _buildOfferList() {
    if (_myOffers.isEmpty) {
      return _buildEmptyOfferList();
    }

    // Filtrer les offres par statut (gérer les deux formats possibles de statut: 'active'/'ACTIVE' et 'inactive'/'INACTIVE')
    final List<OfferData> activeOffers = _myOffers
        .where((offer) => offer.status.toLowerCase() == 'active')
        .toList();
    final List<OfferData> inactiveOffers = _myOffers
        .where((offer) => offer.status.toLowerCase() == 'inactive')
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section des offres actives
        if (activeOffers.isNotEmpty) ...[
          _buildSectionHeader("Offres actives", Icons.check_circle_outline,
              activeOffers.length)
              .animate()
              .fadeIn(delay: 100.ms, duration: 400.ms)
              .slideX(begin: -0.1, end: 0),
          const SizedBox(height: 16),
          ...activeOffers.asMap().entries.map((entry) => 
            _buildOfferCard(entry.value)
                .animate()
                .fadeIn(delay: (200 + 100 * entry.key).ms, duration: 400.ms)
                .slideY(begin: 0.1, end: 0)
          ),
          const SizedBox(height: 32),
        ],

        // Section des offres inactives
        if (inactiveOffers.isNotEmpty) ...[
          _buildSectionHeader(
              "Offres inactives", Icons.block_outlined, inactiveOffers.length)
              .animate()
              .fadeIn(delay: (activeOffers.isEmpty ? 100 : 300 + 100 * activeOffers.length).ms, duration: 400.ms)
              .slideX(begin: -0.1, end: 0),
          const SizedBox(height: 16),
          ...inactiveOffers.asMap().entries.map((entry) => 
            _buildOfferCard(entry.value)
                .animate()
                .fadeIn(delay: (activeOffers.isEmpty ? 200 : 400 + 100 * activeOffers.length + 100 * entry.key).ms, duration: 400.ms)
                .slideY(begin: 0.1, end: 0)
          ),
        ],

        // Afficher un message si aucune offre n'est trouvée (ne devrait pas arriver avec la vérification isEmpty)
        if (activeOffers.isEmpty && inactiveOffers.isEmpty)
          _buildEmptyOfferList(),
      ],
    );
  }

  Widget _buildEmptyOfferList() {
    return Container(
      padding: const EdgeInsets.all(32),
      margin: const EdgeInsets.only(top: 16),
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
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(
            Icons.work_off_outlined,
            color: Color(0xFF94A3B8), // Slate 400
            size: 64,
          ).animate()
              .scale(delay: 100.ms, duration: 500.ms, curve: Curves.elasticOut),
          const SizedBox(height: 24),
          const Text(
            "Vous n'avez pas encore créé d'offre",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF334155), // Slate 700
            ),
          ).animate()
              .fadeIn(delay: 200.ms, duration: 400.ms),
          const SizedBox(height: 8),
          const Text(
            "Créez votre première offre pour commencer à recruter des talents",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Color(0xFF64748B), // Slate 500
            ),
          ).animate()
              .fadeIn(delay: 300.ms, duration: 400.ms),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      JobOfferForm(client: GetIt.instance<RestClient>()),
                ),
              ).then((result) {
                if (result == true || result == null) {
                  _loadMyOffers();
                }
              });
            },
            icon: const Icon(Icons.add),
            label: const Text("Créer ma première offre"),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6366F1), // Indigo
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ).animate()
              .fadeIn(delay: 400.ms, duration: 400.ms)
              .scale(begin: const Offset(0.8, 0.8)),
        ],
      ),
    ).animate()
        .fadeIn(duration: 500.ms)
        .scale(begin: const Offset(0.95, 0.95));
  }

  Widget _buildSectionHeader(String title, IconData icon, int count) {
    return Row(
      children: [
        Icon(
          icon,
          color: const Color(0xFF6366F1),
          size: 20,
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF334155), // Slate 700
          ),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFFEEF2FF), // Indigo 50
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            count.toString(),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF6366F1), // Indigo
            ),
          ),
        ).animate()
            .scale(delay: 100.ms, duration: 300.ms),
      ],
    );
  }

  Widget _buildOfferCard(OfferData offer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFFEEF2FF), // Indigo 50
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(14),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.business_center_outlined,
                    color: Color(0xFF6366F1), // Indigo
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        offer.title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B), // Slate 800
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          _buildTag(offer.offerType, isOfferType: true),
                          if (offer.workLocationType.isNotEmpty)
                            _buildTag(offer.workLocationType),
                          _buildStatusTag(offer.status),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (offer.skills.isNotEmpty) ...[
                  const Text(
                    "Compétences requises",
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF475569), // Slate 600
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: offer.skills.asMap().entries.map((entry) {
                      return Chip(
                        label: Text(entry.value),
                        labelStyle: const TextStyle(
                          color: Color(0xFF6366F1), // Indigo
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                        backgroundColor: const Color(0xFFEEF2FF), // Indigo 50
                        padding: const EdgeInsets.symmetric(
                            horizontal: 2, vertical: 0),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                          side: const BorderSide(
                            color: Color(0xFFC7D2FE), // Indigo 200
                          ),
                        ),
                        visualDensity: VisualDensity.compact,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ).animate()
                          .scale(delay: (50 * entry.key).ms, duration: 300.ms);
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                ],
                Row(
                  children: [
                    if (offer.duration.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.access_time,
                          label: "Durée",
                          value: offer.duration,
                        ),
                      ),
                    if (offer.salary.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.euro_rounded,
                          label: "Salaire",
                          value: offer.salary,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () {
                        // Ouvrir le formulaire d'édition avec l'offre existante
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => JobOfferForm(
                              client: GetIt.instance<RestClient>(),
                              existingOffer: offer,
                            ),
                          ),
                        ).then((_) =>
                            _loadMyOffers()); // Recharger les offres après modification
                      },
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text("Modifier"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF6366F1), // Indigo
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                      ),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      onPressed: () {
                        _toggleOfferStatus(offer);
                      },
                      icon: Icon(
                        offer.status.toLowerCase() == 'active'
                            ? Icons.toggle_off_outlined
                            : Icons.toggle_on_outlined,
                      ),
                      label: Text(offer.status.toLowerCase() == 'active'
                          ? "Désactiver"
                          : "Activer"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: offer.status.toLowerCase() == 'active'
                            ? const Color(0xFFEF4444) // Rouge pour désactiver
                            : const Color(0xFF10B981), // Vert pour activer
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => OfferDetail(offer: offer),
                          ),
                        ).then((_) {
                          // Recharger les offres au retour (notamment après une suppression)
                          _loadMyOffers();
                        });
                      },
                      icon: const Icon(Icons.visibility_outlined),
                      label: const Text("Voir détails"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1), // Indigo
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: const Color(0xFF94A3B8), // Slate 400
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B), // Slate 500
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Color(0xFF334155), // Slate 700
          ),
        ),
      ],
    );
  }

  Widget _buildTag(String text, {bool isOfferType = false}) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isOfferType
            ? const Color(0xFF6366F1) // Indigo pour le type d'offre
            : const Color(0xFFE2E8F0), // Slate 200 pour les autres tags
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color:
              isOfferType ? Colors.white : const Color(0xFF475569), // Slate 600
        ),
      ),
    );
  }

  Widget _buildStatusTag(String status) {
    final bool isActive = status.toLowerCase() == 'active';

    return Container(
      margin: const EdgeInsets.only(left: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF6366F1) : const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        isActive ? 'Actif' : 'Inactif',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: isActive ? Colors.white : const Color(0xFF475569),
        ),
      ),
    );
  }
}
