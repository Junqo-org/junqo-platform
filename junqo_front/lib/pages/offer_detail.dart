import 'package:flutter/material.dart';
import '../shared/widgets/navbar_company.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';

class OfferDetail extends StatelessWidget {
  final OfferData offer;

  const OfferDetail({super.key, required this.offer});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Slate 50
      body: Column(
        children: [
          const NavbarCompany(currentIndex: 2),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(context),
                  const SizedBox(height: 24),
                  _buildOfferDetailCard(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFFE2E8F0), // Slate 200
                    width: 1.5,
                  ),
                ),
                child: const Icon(
                  Icons.arrow_back_rounded,
                  color: Color(0xFF6366F1), // Indigo
                  size: 22,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Détails de l'offre",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B), // Slate 800
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    offer.title,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6366F1),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOfferDetailCard() {
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
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B), // Slate 800
                        ),
                      ),
                      const SizedBox(height: 6),
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
                const Text(
                  "Description",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate 800
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  offer.description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF475569), // Slate 600
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  "Informations générales",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate 800
                  ),
                ),
                const SizedBox(height: 16),
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
                    if (offer.educationLevel.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.school_outlined,
                          label: "Niveau d'études",
                          value: offer.educationLevel,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    if (offer.workLocationType.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.location_on_outlined,
                          label: "Type de lieu",
                          value: offer.workLocationType,
                        ),
                      ),
                    Expanded(
                      child: Container(),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                if (offer.skills.isNotEmpty) ...[
                  const Text(
                    "Compétences requises",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B), // Slate 800
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
                  const SizedBox(height: 24),
                ],
                if (offer.benefits.isNotEmpty) ...[
                  const Text(
                    "Avantages proposés",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B), // Slate 800
                    ),
                  ),
                  const SizedBox(height: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: offer.benefits.map((benefit) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(
                              Icons.check_circle_rounded,
                              color: Color(0xFF6366F1), // Indigo
                              size: 18,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                benefit,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF475569), // Slate 600
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),
                ],
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
                            horizontal: 16, vertical: 12),
                      ),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton.icon(
                      onPressed: () {
                        // Action pour supprimer l'offre
                      },
                      icon: const Icon(Icons.delete_outline),
                      label: const Text("Supprimer"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF87171), // Red 400
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
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
