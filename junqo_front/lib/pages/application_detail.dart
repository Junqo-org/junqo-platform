import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../shared/widgets/navbar_company.dart';
import '../shared/dto/application_data.dart';
import '../shared/dto/student_profile.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:intl/intl.dart';

class ApplicationDetailPage extends StatefulWidget {
  final ApplicationData application;

  const ApplicationDetailPage({super.key, required this.application});

  @override
  State<ApplicationDetailPage> createState() => _ApplicationDetailPageState();
}

class _ApplicationDetailPageState extends State<ApplicationDetailPage> {
  StudentProfile? _studentProfile;
  bool _isLoading = true;
  bool _isUpdating = false;
  late ApiService _apiService;

  @override
  void initState() {
    super.initState();
    _apiService = GetIt.instance<ApiService>();
    _loadStudentProfile();
  }

  Future<void> _loadStudentProfile() async {
    try {
      final profile = await _apiService.getStudentProfileById(widget.application.studentId);
      if (mounted) {
        setState(() {
          _studentProfile = profile;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du chargement du profil: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _updateApplicationStatus(String newStatus) async {
    setState(() {
      _isUpdating = true;
    });

    try {
      await _apiService.updateApplicationStatus(widget.application.id, newStatus);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              newStatus == 'ACCEPTED' 
                ? 'Candidature acceptée avec succès !' 
                : 'Candidature refusée',
            ),
            backgroundColor: newStatus == 'ACCEPTED' 
              ? const Color(0xFF10B981) 
              : const Color(0xFFEF4444),
          ),
        );
        
        // Return to previous screen
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la mise à jour: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUpdating = false;
        });
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
            child: _isLoading
                ? _buildLoadingState()
                : _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF6366F1).withOpacity(0.1),
                  const Color(0xFF8B5CF6).withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const SizedBox(
              width: 60,
              height: 60,
              child: CircularProgressIndicator(
                strokeWidth: 4,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
              ),
            ),
          ).animate()
              .scale(delay: 200.ms, duration: 600.ms, curve: Curves.elasticOut),
          const SizedBox(height: 24),
          const Text(
            "Chargement du profil...",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Color(0xFF64748B),
            ),
          ).animate()
              .fadeIn(delay: 400.ms, duration: 600.ms),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader()
              .animate()
              .fadeIn(duration: 400.ms)
              .slideX(begin: -0.1, end: 0, curve: Curves.easeOut),
          const SizedBox(height: 24),
          _buildApplicationInfo()
              .animate()
              .fadeIn(delay: 200.ms, duration: 500.ms)
              .scaleXY(begin: 0.95, end: 1.0, curve: Curves.easeOutQuart),
          const SizedBox(height: 24),
          if (_studentProfile != null) ...[
            _buildStudentProfile()
                .animate()
                .fadeIn(delay: 400.ms, duration: 500.ms)
                .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 24),
            _buildActionButtons()
                .animate()
                .fadeIn(delay: 600.ms, duration: 500.ms)
                .slideY(begin: 0.2, end: 0, curve: Curves.easeOut),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back),
          style: IconButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: const Color(0xFF6366F1),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Détail de la candidature",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
              Text(
                "Candidat: ${widget.application.studentName ?? 'Nom non disponible'}",
                style: const TextStyle(
                  fontSize: 16,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildApplicationInfo() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            Color(0xFFF8FAFC),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.assignment_outlined,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              const Text(
                "Informations de candidature",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildInfoRow(
            icon: Icons.calendar_today_outlined,
            label: "Date de candidature",
            value: DateFormat('dd/MM/yyyy à HH:mm').format(widget.application.createdAt),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(
            icon: Icons.schedule_outlined,
            label: "Dernière mise à jour",
            value: DateFormat('dd/MM/yyyy à HH:mm').format(widget.application.updatedAt),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(
            icon: Icons.info_outline,
            label: "Statut actuel",
            value: _getStatusText(widget.application.status),
            valueColor: _getStatusColor(widget.application.status),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentProfile() {
    if (_studentProfile == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            Color(0xFFF8FAFC),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6366F1).withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Avatar du profil
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFF6366F1),
                      Color(0xFF8B5CF6),
                    ],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF6366F1).withOpacity(0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    (_studentProfile!.name ?? 'U')[0].toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _studentProfile!.name ?? 'Nom non disponible',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      "Profil étudiant",
                      style: TextStyle(
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
          const SizedBox(height: 24),
          
          // Compétences
          if (_studentProfile!.skills?.isNotEmpty == true) ...[
            const Text(
              "Compétences",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E293B),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _studentProfile!.skills!.map((skill) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF6366F1).withOpacity(0.2),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    skill,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
          ],
          
          // Expériences (si disponibles)
          // TODO: Add experiences display when available in StudentProfile
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    if (widget.application.status == 'ACCEPTED' || widget.application.status == 'DENIED') {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFE2E8F0),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              widget.application.status == 'ACCEPTED' 
                ? Icons.check_circle_outline 
                : Icons.cancel_outlined,
              color: widget.application.status == 'ACCEPTED' 
                ? const Color(0xFF10B981) 
                : const Color(0xFFEF4444),
              size: 24,
            ),
            const SizedBox(width: 12),
            Text(
              widget.application.status == 'ACCEPTED' 
                ? "Cette candidature a été acceptée" 
                : "Cette candidature a été refusée",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: widget.application.status == 'ACCEPTED' 
                  ? const Color(0xFF10B981) 
                  : const Color(0xFFEF4444),
              ),
            ),
          ],
        ),
      );
    }

    return Row(
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFFEF4444),
                  Color(0xFFDC2626),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFEF4444).withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton.icon(
              onPressed: _isUpdating ? null : () => _showConfirmDialog('DENIED'),
              icon: _isUpdating 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.close, color: Colors.white),
              label: const Text(
                "Refuser",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF10B981),
                  Color(0xFF059669),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton.icon(
              onPressed: _isUpdating ? null : () => _showConfirmDialog('ACCEPTED'),
              icon: _isUpdating 
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.check, color: Colors.white),
              label: const Text(
                "Accepter",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF6366F1).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            size: 18,
            color: const Color(0xFF6366F1),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 16,
                  color: valueColor ?? const Color(0xFF1E293B),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showConfirmDialog(String action) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            action == 'ACCEPTED' ? "Accepter la candidature ?" : "Refuser la candidature ?",
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E293B),
            ),
          ),
          content: Text(
            action == 'ACCEPTED' 
              ? "Êtes-vous sûr de vouloir accepter cette candidature ? Le candidat sera notifié."
              : "Êtes-vous sûr de vouloir refuser cette candidature ? Cette action est définitive.",
            style: const TextStyle(
              color: Color(0xFF64748B),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text(
                "Annuler",
                style: TextStyle(
                  color: Color(0xFF64748B),
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _updateApplicationStatus(action);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: action == 'ACCEPTED' 
                  ? const Color(0xFF10B981) 
                  : const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(action == 'ACCEPTED' ? "Accepter" : "Refuser"),
            ),
          ],
        );
      },
    );
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'NOT_OPENED':
        return 'Non consulté';
      case 'PENDING':
        return 'En attente';
      case 'ACCEPTED':
        return 'Accepté';
      case 'DENIED':
        return 'Refusé';
      default:
        return 'Statut inconnu';
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'NOT_OPENED':
        return const Color(0xFF64748B); // Slate 500
      case 'PENDING':
        return const Color(0xFFF59E0B); // Amber 500
      case 'ACCEPTED':
        return const Color(0xFF10B981); // Green 500
      case 'DENIED':
        return const Color(0xFFEF4444); // Red 500
      default:
        return const Color(0xFF64748B);
    }
  }
} 