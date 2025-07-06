import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/application_data.dart';
import 'package:junqo_front/shared/widgets/navbar.dart';

class InterviewSimulationSelect extends StatefulWidget {
  const InterviewSimulationSelect({super.key});

  @override
  State<InterviewSimulationSelect> createState() => _InterviewSimulationSelectState();
}

class _InterviewSimulationSelectState extends State<InterviewSimulationSelect> {
  final ApiService _apiService = GetIt.instance<ApiService>();
  bool _isLoading = true;
  List<ApplicationData> _acceptedApplications = [];
  final Map<String, String> _offerContexts = {}; // cache context strings

  @override
  void initState() {
    super.initState();
    _loadAcceptedApplications();
  }

  Future<void> _loadAcceptedApplications() async {
    try {
      final apps = await _apiService.getMyApplications();
      final accepted = apps.where((e) => e.status == 'ACCEPTED').toList();
      // Fetch offer titles in parallel
      await Future.wait(accepted.map((app) async {
        try {
          final offer = await _apiService.getOfferById(app.offerId);
          String companyName = '';
          try {
            final profile = await _apiService.getCompanyProfileById(app.companyId);
            companyName = profile.name;
          } catch (_) {}
          final String context = 'Titre: ${offer.title}\nEntreprise: $companyName\nDescription: ${offer.description}';
          _offerContexts[app.offerId] = context;
        } catch (_) {}
      }));

      setState(() {
        _acceptedApplications = accepted;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _startSimulation(String contextText) {
    Navigator.pushNamed(context, '/interview-simulation', arguments: contextText);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Column(
        children: [
          const Navbar(currentIndex: 1),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Sélectionnez un type d\'entretien',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 24),
                        _buildOptionCard(
                          title: 'Entretien classique',
                          subtitle: 'Questions générales pour tout poste',
                          icon: Icons.chat_bubble_outline,
                          color: const Color(0xFF6366F1),
                          onTap: () => Navigator.pushNamed(context, '/interview-simulation'),
                        ),
                        const SizedBox(height: 16),
                        if (_acceptedApplications.isNotEmpty)
                          const Text(
                            'Basé sur vos candidatures acceptées',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        const SizedBox(height: 16),
                        ..._acceptedApplications.map((app) => Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildOptionCard(
                                title: _offerContexts[app.offerId]?.split('\n').first.replaceFirst('Titre: ', '') ?? 'Offre ${app.offerId}',
                                subtitle: 'Entreprise: ${_offerContexts[app.offerId]?.split("\n")[1].replaceFirst("Entreprise: ", "") ?? app.companyId}',
                                icon: Icons.work_outline,
                                color: const Color(0xFF10B981),
                                onTap: () => _startSimulation(_offerContexts[app.offerId] ?? ''),
                              ),
                            )),
                        if (_acceptedApplications.isEmpty)
                          const Center(
                            child: Text(
                              'Aucune candidature acceptée trouvée',
                              style: TextStyle(color: Colors.grey),
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

  Widget _buildOptionCard({required String title, required String subtitle, required IconData icon, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: Colors.grey.shade200, width: 1),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black87),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
} 