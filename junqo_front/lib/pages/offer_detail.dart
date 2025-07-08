import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../shared/widgets/navbar_company.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/services/offer_service.dart';
import 'package:junqo_front/pages/offer_creation.dart';
import 'package:junqo_front/core/client.dart';
import 'package:junqo_front/shared/dto/application_data.dart';
import 'package:intl/intl.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'application_detail.dart';
import 'package:junqo_front/pages/messaging_page.dart';
import 'package:junqo_front/core/messaging_service.dart';
import 'package:junqo_front/shared/dto/conversation_data.dart';

class OfferDetail extends StatefulWidget {
  final OfferData offer;

  const OfferDetail({super.key, required this.offer});

  @override
  State<OfferDetail> createState() => _OfferDetailState();
}

class _OfferDetailState extends State<OfferDetail> {
  List<ApplicationData> _applications = [];
  int _currentPage = 0;
  final int _limit = 10;
  bool _isLoadingMore = false;
  bool _isInitialLoading = true;
  bool _canLoadMore = true;

  @override
  void initState() {
    super.initState();
    _fetchApplications();
  }

  void _fetchApplications({bool loadMore = false}) async {
    if (_isLoadingMore) return;

    setState(() {
      _isLoadingMore = true;
      if (!loadMore) {
        _applications = [];
        _currentPage = 0;
        _canLoadMore = true;
        _isInitialLoading = true;
      }
    });

    try {
      final offerService = GetIt.instance<OfferService>();
      final result = await offerService.getApplicationsForOffer(
        widget.offer.id!,
        offset: _currentPage * _limit,
        limit: _limit,
      );
      if (mounted) {
        setState(() {
          _applications.addAll(result.rows);
          _currentPage++;
          _isLoadingMore = false;
          _isInitialLoading = false;
          if (result.rows.length < _limit || _applications.length >= result.count) {
            _canLoadMore = false;
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingMore = false;
          _isInitialLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de chargement des candidatures: ${e.toString()}')),
        );
      }
    }
  }

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
                  _buildHeader(context)
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .slideX(begin: -0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 24),
                  _buildOfferDetailCard()
                      .animate()
                      .fadeIn(delay: 200.ms, duration: 500.ms)
                      .scaleXY(begin: 0.95, end: 1.0, curve: Curves.easeOutQuart),
                  const SizedBox(height: 24),
                  _buildCandidatesSection()
                      .animate()
                      .fadeIn(delay: 400.ms, duration: 500.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                ],
              ),
            ).animate().fadeIn(duration: 300.ms),
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
              ).animate()
                .fadeIn(duration: 400.ms)
                .scale(begin: const Offset(0.8, 0.8), curve: Curves.elasticOut),
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
                  ).animate()
                    .fadeIn(delay: 200.ms, duration: 400.ms)
                    .slideX(begin: -0.2, end: 0),
                  const SizedBox(height: 6),
                  Text(
                    widget.offer.title,
                    style: const TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6366F1),
                      fontWeight: FontWeight.w500,
                    ),
                  ).animate()
                    .fadeIn(delay: 300.ms, duration: 400.ms)
                    .slideX(begin: -0.2, end: 0),
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
                ).animate()
                  .scale(delay: 200.ms, duration: 400.ms, curve: Curves.elasticOut),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.offer.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B), // Slate 800
                        ),
                      ).animate()
                        .fadeIn(delay: 300.ms, duration: 400.ms)
                        .slideX(begin: -0.1, end: 0),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          _buildTag(widget.offer.offerType, isOfferType: true)
                            .animate()
                            .fadeIn(delay: 400.ms, duration: 300.ms)
                            .scale(begin: const Offset(0.8, 0.8)),
                          if (widget.offer.workLocationType.isNotEmpty) ...[
                            const SizedBox(width: 8),
                            _buildTag(widget.offer.workLocationType)
                              .animate()
                              .fadeIn(delay: 500.ms, duration: 300.ms)
                              .scale(begin: const Offset(0.8, 0.8)),
                          ],
                          const SizedBox(width: 8),
                          _buildStatusTag(widget.offer.status)
                            .animate()
                            .fadeIn(delay: 600.ms, duration: 300.ms)
                            .scale(begin: const Offset(0.8, 0.8)),
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
                ).animate()
                  .fadeIn(delay: 700.ms, duration: 400.ms)
                  .slideY(begin: 0.1, end: 0),
                const SizedBox(height: 12),
                Text(
                  widget.offer.description,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Color(0xFF475569), // Slate 600
                    height: 1.6,
                  ),
                ).animate()
                  .fadeIn(delay: 800.ms, duration: 400.ms)
                  .slideY(begin: 0.1, end: 0),
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
                    if (widget.offer.duration.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.access_time,
                          label: "Durée",
                          value: widget.offer.duration,
                        ),
                      ),
                    if (widget.offer.salary.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.euro_rounded,
                          label: "Salaire",
                          value: widget.offer.salary,
                        ),
                      ),
                    if (widget.offer.educationLevel.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.school_outlined,
                          label: "Niveau d'études",
                          value: widget.offer.educationLevel,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    if (widget.offer.workLocationType.isNotEmpty)
                      Expanded(
                        child: _buildInfoItem(
                          icon: Icons.location_on_outlined,
                          label: "Type de lieu",
                          value: widget.offer.workLocationType,
                        ),
                      ),
                    Expanded(
                      child: Container(),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                if (widget.offer.skills.isNotEmpty) ...[
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
                    children: widget.offer.skills.map((skill) {
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
                if (widget.offer.benefits.isNotEmpty) ...[
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
                    children: widget.offer.benefits.map((benefit) {
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
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => JobOfferForm(
                              client: GetIt.instance<RestClient>(),
                              existingOffer: widget.offer,
                            ),
                          ),
                        ).then((_) {
                          Navigator.pop(context, true);
                        });
                      },
                      icon: const Icon(Icons.edit_outlined),
                      label: const Text("Modifier"),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF6366F1),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Semantics(
  button: true,
  label: 'TODO: Replace with a meaningful label',
  child: ElevatedButton.icon(onPressed: () {showDialog(context: context, builder: (BuildContext dialogContext) {return AlertDialog(title: const Text("Supprimer cette offre ?", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))), content: const Text("Cette action est irréversible. L'offre sera définitivement supprimée.", style: TextStyle(color: Color(0xFF64748B))), actions: [Semantics(button: true, label: 'TODO: Replace with a meaningful label', child: TextButton(onPressed: () {Navigator.of(dialogContext).pop();}, child: const Text("Annuler", style: TextStyle(color: Color(0xFF64748B))))), ElevatedButton(onPressed: () async {Navigator.of(dialogContext).pop(); try {ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Suppression en cours..."), duration: Duration(seconds: 1))); final offerService = GetIt.instance<OfferService>(); final bool success = await offerService.deleteOffer(widget.offer.id!); if (!mounted) return; if (success) {Navigator.of(context).pop(true); if (!mounted) return; ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("L'offre a été supprimée avec succès"), backgroundColor: Color(0xFF10B981)));} else {if (!mounted) return; ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Échec de la suppression de l'offre"), backgroundColor: Colors.red));}} catch (e) {if (!mounted) return; ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Erreur: ${e.toString()}"), backgroundColor: Colors.red));}}, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444), foregroundColor: Colors.white), child: const Text("Supprimer"))]);});}, icon: const Icon(Icons.delete_outline), label: const Text("Supprimer"), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF87171), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12))),
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

  Widget _buildCandidatesSection() {
    if (_isInitialLoading) {
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
              "Chargement des candidatures...",
              style: TextStyle(
                color: Color(0xFF64748B), // Slate 500
                fontSize: 16,
              ),
            ).animate()
              .fadeIn(delay: 200.ms, duration: 400.ms),
          ],
        ),
      );
    }

    if (_applications.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(32),
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
              Icons.people_outline,
              color: Color(0xFF94A3B8), // Slate 400
              size: 64,
            ).animate()
              .scale(delay: 100.ms, duration: 500.ms, curve: Curves.elasticOut),
            const SizedBox(height: 24),
            const Text(
              "Aucune candidature",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF334155), // Slate 700
              ),
            ).animate()
              .fadeIn(delay: 200.ms, duration: 400.ms),
            const SizedBox(height: 8),
            const Text(
              "Les candidatures apparaîtront ici lorsqu'elles seront soumises",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B), // Slate 500
              ),
            ).animate()
              .fadeIn(delay: 300.ms, duration: 400.ms),
          ],
        ),
      ).animate()
        .fadeIn(duration: 500.ms)
        .scale(begin: const Offset(0.95, 0.95));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Candidatures",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E293B), // Slate 800
          ),
        ).animate()
          .fadeIn(delay: 100.ms, duration: 400.ms)
          .slideX(begin: -0.1, end: 0),
        const SizedBox(height: 16),
        ..._applications.asMap().entries.map((entry) => 
          _buildApplicationCard(entry.value)
            .animate()
            .fadeIn(delay: (200 + 100 * entry.key).ms, duration: 400.ms)
            .slideY(begin: 0.1, end: 0)
        ),
        if (_canLoadMore)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Semantics(
  button: true,
  label: 'TODO: Replace with a meaningful label',
  child: ElevatedButton.icon(onPressed: _isLoadingMore ? null : () => _fetchApplications(loadMore: true), icon: _isLoadingMore ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)).animate(onPlay: (controller) => controller.repeat()).rotate(duration: 1.seconds) : const Icon(Icons.refresh), label: Text(_isLoadingMore ? "Chargement..." : "Charger plus"), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), foregroundColor: Colors.white)),
),
            ),
          ).animate()
            .fadeIn(delay: (300 + 100 * _applications.length).ms, duration: 400.ms)
            .scale(begin: const Offset(0.95, 0.95)),
      ],
    );
  }

  Widget _buildApplicationCard(ApplicationData application) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            const Color(0xFFF8FAFC), // Slate 50
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFE2E8F0), // Slate 200
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withOpacity(0.05), // Indigo shadow
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Avatar avec gradient
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFF6366F1), // Indigo
                        Color(0xFF8B5CF6), // Violet
                      ],
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      (application.studentName ?? 'C')[0].toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ).animate()
                  .scale(delay: 100.ms, duration: 400.ms, curve: Curves.elasticOut),
                
                const SizedBox(width: 16),
                
                // Informations du candidat
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        application.studentName ?? 'Candidat anonyme',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E293B), // Slate 800
                        ),
                      ).animate()
                        .fadeIn(delay: 200.ms, duration: 400.ms)
                        .slideX(begin: -0.2, end: 0),
                      
                      const SizedBox(height: 4),
                      
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today_outlined,
                            size: 14,
                            color: const Color(0xFF64748B), // Slate 500
                          ),
                          const SizedBox(width: 6),
                          Text(
                            "Candidature du ${DateFormat('dd/MM/yyyy à HH:mm').format(application.createdAt)}",
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF64748B), // Slate 500
                            ),
                          ),
                        ],
                      ).animate()
                        .fadeIn(delay: 300.ms, duration: 400.ms),
                      
                      const SizedBox(height: 8),
                      
                      // Status chip
                      _buildApplicationStatusChip(application.status)
                        .animate()
                        .fadeIn(delay: 400.ms, duration: 400.ms)
                        .scale(begin: const Offset(0.8, 0.8)),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Actions buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      _navigateToApplicationDetail(application);
                    },
                    icon: const Icon(Icons.visibility_outlined, size: 18),
                    label: const Text("Consulter le profil"),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF6366F1), // Indigo
                      side: const BorderSide(
                        color: Color(0xFF6366F1),
                        width: 1.5,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ).animate()
                    .fadeIn(delay: 500.ms, duration: 400.ms)
                    .slideY(begin: 0.2, end: 0),
                ),
                
                const SizedBox(width: 12),
                
                // Actions rapides selon le statut
                if (application.status == 'NOT_OPENED' || application.status == 'PENDING') ...[
                  // Bouton refuser
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFFEF4444), // Red
                          const Color(0xFFDC2626),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFEF4444).withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      onPressed: () {
                        _updateApplicationStatus(application, 'DENIED');
                      },
                      icon: const Icon(Icons.close, color: Colors.white),
                      tooltip: "Refuser",
                    ),
                  ).animate()
                    .fadeIn(delay: 600.ms, duration: 400.ms)
                    .scale(begin: const Offset(0.8, 0.8)),
                  
                  const SizedBox(width: 8),
                  
                  // Bouton accepter
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          const Color(0xFF10B981), // Green
                          const Color(0xFF059669),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF10B981).withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      onPressed: () {
                        _updateApplicationStatus(application, 'ACCEPTED');
                      },
                      icon: const Icon(Icons.check, color: Colors.white),
                      tooltip: "Accepter",
                    ),
                  ).animate()
                    .fadeIn(delay: 700.ms, duration: 400.ms)
                    .scale(begin: const Offset(0.8, 0.8)),
                ],
              ],
            ),
          ],
        ),
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

  Widget _buildApplicationStatusChip(String status) {
    Color chipColor;
    String chipText;

    switch (status) {
      case 'NOT_OPENED':
        chipColor = Colors.blueGrey;
        chipText = 'Non ouvert';
        break;
      case 'PENDING':
        chipColor = Colors.orangeAccent;
        chipText = 'En attente';
        break;
      case 'ACCEPTED':
        chipColor = Colors.green;
        chipText = 'Accepté';
        break;
      case 'DENIED':
        chipColor = Colors.redAccent;
        chipText = 'Refusé';
        break;
      default:
        chipColor = Colors.grey;
        chipText = 'État inconnu';
    }

    return Chip(
      label: Text(
        chipText,
        style: TextStyle(
          color: chipColor,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
      backgroundColor: chipColor.withOpacity(0.1),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide.none,
      ),
    );
  }

  void _navigateToApplicationDetail(ApplicationData application) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ApplicationDetailPage(application: application),
      ),
    );
  }

  Future<void> _updateApplicationStatus(ApplicationData application, String newStatus) async {
    try {
      final apiService = GetIt.instance<ApiService>();
      await apiService.updateApplicationStatus(application.id, newStatus);
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                newStatus == 'ACCEPTED' ? Icons.check_circle : Icons.cancel,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 12),
              Text(
                newStatus == 'ACCEPTED' 
                  ? 'Candidature acceptée avec succès !' 
                  : 'Candidature refusée',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          backgroundColor: newStatus == 'ACCEPTED' 
            ? const Color(0xFF10B981) 
            : const Color(0xFFEF4444),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 3),
        ),
      );
      
      // Update local application status
      setState(() {
        final index = _applications.indexWhere((app) => app.id == application.id);
        if (index != -1) {
                   _applications[index] = ApplicationData(
           id: application.id,
           studentId: application.studentId,
           studentName: application.studentName,
           studentEmail: application.studentEmail,
           offerId: application.offerId,
           companyId: application.companyId,
           status: newStatus,
           createdAt: application.createdAt,
           updatedAt: DateTime.now(),
         );
        }
      });

      // If the application was accepted, create a conversation and open messaging
      if (newStatus == 'ACCEPTED') {
        await _createConversationAndNavigate(application);
      }
      
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(
                Icons.error_outline,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 12),
              Text('Erreur lors de la mise à jour: $e'),
            ],
          ),
          backgroundColor: const Color(0xFFEF4444),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  Future<void> _createConversationAndNavigate(ApplicationData application) async {
    try {
      final messagingService = GetIt.instance<MessagingService>();
      
      // Check if a conversation already exists between company and student
      final existingConversations = await messagingService.getConversations(limit: 100);
      
      ConversationData? existingConversation;
      for (final conversation in existingConversations) {
        if (conversation.participantsIds.contains(application.studentId) &&
            conversation.participantsIds.contains(application.companyId)) {
          existingConversation = conversation;
          break;
        }
      }
      
      // If no conversation exists, create one
      if (existingConversation == null) {
        // Limit title to 50 characters as required by backend API
        String conversationTitle = 'Discussion - ${widget.offer.title}';
        if (conversationTitle.length > 50) {
          conversationTitle = conversationTitle.substring(0, 47) + '...';
        }
        
        final createConversationData = CreateConversationData(
          participantsIds: [application.studentId, application.companyId],
          title: conversationTitle,
        );
        
        await messagingService.createConversation(createConversationData);
        
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Conversation créée avec succès !'),
            backgroundColor: Color(0xFF10B981),
          ),
        );
      }
      
      // Navigate to messaging page
      if (!mounted) return;
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const MessagingPage()),
      );
      
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la création de la conversation: $e'),
          backgroundColor: const Color(0xFFEF4444),
        ),
      );
    }
  }
}
