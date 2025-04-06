import 'package:flutter/material.dart';
import '../shared/widgets/navbar_company.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:junqo_front/pages/offer_detail.dart';
import 'package:junqo_front/pages/offer_creation.dart';
import 'package:junqo_front/core/client.dart';
import 'package:get_it/get_it.dart';

class OfferList extends StatefulWidget {
  const OfferList({super.key});

  @override
  State<OfferList> createState() => _OfferListState();
}

class _OfferListState extends State<OfferList> {
  // Liste des offres fictives
  final List<OfferData> _fakeOffers = [
    OfferData(
      userid: 'user-123',
      title: 'Développeur Front-end React',
      description:
          'Nous recherchons un développeur Front-end pour travailler sur nos applications React. Vous intégrerez une équipe dynamique et participerez au développement de nouvelles fonctionnalités.',
      offerType: 'Stage',
      duration: '6 mois',
      salary: '800€/mois',
      workLocationType: 'Sur place',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'TypeScript'],
      benefits: [
        'Tickets restaurant',
        'Remboursement transport 50%',
        'Possibilité d\'embauche'
      ],
      educationLevel: 'Bac+3',
      status: 'active',
    ),
    OfferData(
      userid: 'user-456',
      title: 'Développeur Full Stack',
      description:
          'Participez au développement de notre plateforme e-commerce en utilisant les technologies modernes du web. Vous travaillerez tant sur le front-end que sur le back-end.',
      offerType: 'Alternance',
      duration: '12 mois',
      salary: '1200€/mois',
      workLocationType: 'Hybride',
      skills: ['Node.js', 'Vue.js', 'MongoDB', 'Docker', 'API REST'],
      benefits: [
        'Télétravail partiel',
        'Matériel fourni',
        'Formation continue'
      ],
      educationLevel: 'Bac+5',
      status: 'active',
    ),
    OfferData(
      userid: 'user-789',
      title: 'Data Scientist Junior',
      description:
          'Vous aiderez notre équipe à extraire des insights à partir de nos données. Vous travaillerez sur des modèles de machine learning et participerez à l\'amélioration de nos algorithmes de recommandation.',
      offerType: 'Stage',
      duration: '4 mois',
      salary: '1000€/mois',
      workLocationType: 'Distanciel',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'SQL'],
      benefits: ['Horaires flexibles', 'Projets innovants'],
      educationLevel: 'Bac+4',
      status: 'inactive',
    ),
  ];

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
              builder: (context) => JobOfferForm(client: GetIt.instance<RestClient>()),
            ),
          );
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
      ),
      body: Column(
        children: [
          const NavbarCompany(currentIndex: 1), // Mettre l'index qui correspond à cette page
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 24),
                  _buildOfferList(),
                ],
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
                    "Mes offres",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B), // Slate 800
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    "Retrouvez toutes vos offres publiées",
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF64748B), // Slate 500
                    ),
                  ),
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
                      builder: (context) => JobOfferForm(client: GetIt.instance<RestClient>()),
                    ),
                  );
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
            ),
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
                  builder: (context) => JobOfferForm(client: GetIt.instance<RestClient>()),
                ),
              );
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
    );
  }

  Widget _buildOfferList() {
    // Filtrer les offres par statut
    final List<OfferData> activeOffers =
        _fakeOffers.where((offer) => offer.status == 'active').toList();
    final List<OfferData> inactiveOffers =
        _fakeOffers.where((offer) => offer.status == 'inactive').toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section des offres actives
        if (activeOffers.isNotEmpty) ...[
          _buildSectionHeader("Offres actives", Icons.check_circle_outline,
              activeOffers.length),
          const SizedBox(height: 16),
          ...activeOffers.map((offer) => _buildOfferCard(offer)),
          const SizedBox(height: 32),
        ],

        // Section des offres inactives
        if (inactiveOffers.isNotEmpty) ...[
          _buildSectionHeader(
              "Offres inactives", Icons.cancel_outlined, inactiveOffers.length),
          const SizedBox(height: 16),
          ...inactiveOffers.map((offer) => _buildOfferCard(offer)),
        ],
      ],
    );
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
        ),
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
                    children: offer.skills.map((skill) {
                      return Chip(
                        label: Text(skill),
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
                      );
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
                        // Action pour modifier l'offre
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
                        setState(() {
                          // Simuler l'activation/désactivation locale d'une offre
                          final int index = _fakeOffers.indexOf(offer);
                          if (index >= 0) {
                            final OfferData updatedOffer = OfferData(
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
                              status: offer.status == 'active'
                                  ? 'inactive'
                                  : 'active',
                            );
                            _fakeOffers[index] = updatedOffer;
                          }
                        });
                      },
                      icon: Icon(
                        offer.status == 'active'
                            ? Icons.toggle_off_outlined
                            : Icons.toggle_on_outlined,
                      ),
                      label: Text(
                          offer.status == 'active' ? "Désactiver" : "Activer"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: offer.status == 'active'
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
                        );
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
    return Container(
      margin: const EdgeInsets.only(left: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: status == 'active'
            ? const Color(0xFF6366F1)
            : const Color(0xFFE2E8F0),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        status == 'active' ? 'Actif' : 'Inactif',
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: status == 'active' ? Colors.white : const Color(0xFF475569),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
