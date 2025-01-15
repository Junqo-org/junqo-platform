import 'package:flutter/material.dart';

class CardData {
  final String companyName;
  final String companyLogo;
  final String jobTitle;
  final String contractType;
  final String duration;
  final String location;
  final String salary;
  final List<String> benefits;
  final List<String> technicalSkills;
  final bool showDetails;

  CardData({
    required this.companyName,
    required this.companyLogo,
    required this.jobTitle,
    required this.contractType,
    required this.duration,
    required this.location,
    required this.salary,
    required this.benefits,
    required this.technicalSkills,
    this.showDetails = false,
  });
}

class Debug1 extends StatefulWidget {
  const Debug1({Key? key}) : super(key: key);

  @override
  State<Debug1> createState() => _Debug1State();
}

class _Debug1State extends State<Debug1> {
  final cardData = CardData(
    companyName: 'Airbus',
    companyLogo: 'assets/images/airbus_logo.png', //Didn't test that actually
    jobTitle: 'Alternance DevOps (H/F)',
    contractType: 'Alternance',
    duration: '3 ans',
    location: 'Blagnac',
    salary: '1400 €',
    benefits: ['Présentiel', 'Grande équipe', 'Installations de Fitness'],
    technicalSkills: [
      'bac+3 informatique',
      'Docker',
      'GitHub',
      'Jira',
      'Bash',
      'Linux'
    ],
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: Stack(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: JobCard(data: cardData),
            ),
          ),
          // Accept/Reject Buttons
          Positioned(
            left: 16,
            top: MediaQuery.of(context).size.height / 2 - 30,
            child: _buildActionButton(
              onTap: () {},
              color: Colors.red,
              icon: Icons.close,
            ),
          ),
          Positioned(
            right: 16,
            top: MediaQuery.of(context).size.height / 2 - 30,
            child: _buildActionButton(
              onTap: () {},
              color: Colors.green,
              icon: Icons.check,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required VoidCallback onTap,
    required Color color,
    required IconData icon,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              spreadRadius: 2,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 30,
        ),
      ),
    );
  }
}

class JobCard extends StatelessWidget {
  final CardData data;

  const JobCard({Key? key, required this.data}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 340,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 2,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header with logo
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Image.asset(
                  data.companyLogo,
                  height: 24,
                  fit: BoxFit.contain,
                ),
                const SizedBox(width: 8),
                Text(
                  data.companyName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          // Job Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                data.jobTitle,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          // Contract Info Row
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: _buildInfoChip(
                    icon: Icons.work_outline,
                    text: data.contractType,
                    backgroundColor: Colors.grey.shade100,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildInfoChip(
                    icon: Icons.calendar_today,
                    text: data.duration,
                    backgroundColor: Colors.grey.shade100,
                  ),
                ),
              ],
            ),
          ),

          // Location and Salary Row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              children: [
                Expanded(
                  child: _buildInfoChip(
                    icon: Icons.location_on_outlined,
                    text: data.location,
                    backgroundColor: Colors.grey.shade100,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildInfoChip(
                    icon: Icons.euro_outlined,
                    text: data.salary,
                    backgroundColor: Colors.grey.shade100,
                  ),
                ),
              ],
            ),
          ),

          // Benefits Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.pink.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.star_border, color: Colors.pink.shade300),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: data.benefits
                              .map(
                                (benefit) => _buildInfoChip(
                                  text: benefit,
                                  backgroundColor: Colors.white,
                                  iconColor: Colors.pink.shade300,
                                  icon: Icons.check,
                                ),
                              )
                              .toList(),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Technical Skills Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.computer, color: Colors.green.shade300),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: data.technicalSkills
                              .map(
                                (skill) => _buildInfoChip(
                                  text: skill,
                                  backgroundColor: Colors.white,
                                  iconColor: Colors.green.shade300,
                                ),
                              )
                              .toList(),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Show Details Button
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue.shade100,
                foregroundColor: Colors.blue.shade900,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                minimumSize: const Size(double.infinity, 40),
              ),
              child: const Text('Afficher les détails'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip({
    IconData? icon,
    required String text,
    required Color backgroundColor,
    Color? iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 16, color: iconColor ?? Colors.grey.shade700),
            const SizedBox(width: 4),
          ],
          Flexible(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade700,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
