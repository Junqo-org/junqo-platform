import 'package:flutter/material.dart';
import 'package:junqo_front/shared/widgets/navbar.dart';

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
  final String details;

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
    required this.details,
    this.showDetails = false,
  });
}

class JobCardSwipe extends StatefulWidget {
  const JobCardSwipe({super.key});

  @override
  State<JobCardSwipe> createState() => _JobCardSwipeState();
}

class _JobCardSwipeState extends State<JobCardSwipe> {
  late CardData cardData;
  int currentIndex = 0;

  @override
  void initState() {
    super.initState();
    cardData = setCardData(0); // Initialise avec le premier CardData
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: Column(
        children: [
          const Navbar(currentIndex: 0),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildActionButton(
                  onTap: () {
                    setState(() {
                      currentIndex = (currentIndex + 1) % 3;
                      cardData = setCardData(currentIndex);
                    });
                  },
                  color: Colors.red,
                  icon: Icons.close,
                ),
                const SizedBox(width: 16),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: JobCard(data: cardData),
                ),
                const SizedBox(width: 16),
                _buildActionButton(
                  onTap: () {
                    setState(() {
                      currentIndex = (currentIndex + 1) % 3;
                      cardData = setCardData(currentIndex);
                    });
                  },
                  color: Colors.green,
                  icon: Icons.check,
                ),
              ],
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

  CardData setCardData(int index) {
    List<CardData> cardDataList = [
      CardData(
          companyName: 'Airbus',
          companyLogo: 'assets/images/junqo_logo.png',
          jobTitle: 'Alternance DevOps (H/F)',
          contractType: 'Alternance',
          duration: '3 ans',
          location: 'Blagnac',
          salary: '1400/m € brut',
          benefits: ['Présentiel', 'Grande équipe', 'Installations de Fitness'],
          technicalSkills: [
            'bac+3 informatique',
            'Docker',
            'GitHub',
            'Jira',
            'Bash',
            'Linux'
          ],
          details:
              'Rejoignez Airbus à Blagnac en tant qu\'alternant DevOps pour une durée de 3 ans. Vous travaillerez sur des projets dans l\'aéronautique avec une grande équipe. Utilisez Docker, GitHub, Jira, et Bash sur Linux pour automatiser les processus et améliorer les infrastructures. Vous aurez accès à des installations modernes, incluant une salle de fitness. C\'est une opportunité unique de développer vos compétences techniques dans un environnement international et stimulant.'),
      CardData(
          companyName: 'Google',
          companyLogo: 'assets/images/junqo_logo.png',
          jobTitle: 'Software Engineer (H/F)',
          contractType: 'Internship',
          duration: '4 mois',
          location: 'Paris',
          salary: '6000 € net total',
          benefits: [
            'Télétravail flexible',
            'Cantine gratuite',
            'Équipe internationale'
          ],
          technicalSkills: [
            'bac+5 en informatique',
            'Python',
            'Java',
            'Kubernetes',
            'Google Cloud Platform',
            'Agile'
          ],
          details:
              'Intégrez Google à Paris en tant qu\'ingénieur logiciel pour travailler sur des projets innovants à l\'échelle mondiale. Vous collaborerez avec des équipes internationales et utiliserez des technologies comme Python, Java, Kubernetes, et Google Cloud Platform. Télétravail flexible, repas gratuits et un environnement agile sont quelques-uns des avantages. Rejoignez une entreprise qui façonne l\'avenir de la technologie tout en favorisant l\'innovation et l\'épanouissement personnel.'),
      CardData(
          companyName: 'Devvmaxing',
          companyLogo: 'assets/images/junqo_logo.png',
          jobTitle: 'Développeur Full Stack (H/F)',
          contractType: 'Internship part-time',
          duration: '8 mois 2j/s',
          location: 'Lyon',
          salary: '8000 € net total',
          benefits: [
            'Horaires flexibles',
            'Télétravail partiel',
            'Équipe dynamique'
          ],
          technicalSkills: [
            'bac+4 en développement',
            'Node.js',
            'React',
            'SQL',
            'Docker',
            'Git'
          ],
          details:
              'Rejoignez Devvmaxing, une startup en pleine croissance à Lyon, spécialisée dans les solutions SaaS. En tant que développeur full stack, vous travaillerez avec Node.js, React, SQL, Docker et Git pour concevoir et développer des produits modernes. Nous offrons des horaires flexibles, du télétravail partiel et un environnement dynamique. C\'est l\'occasion de contribuer à des projets passionnants dans une équipe soudée, tout en bénéficiant d\'opportunités de développement personnel.'),
    ];

    return cardDataList[index % cardDataList.length];
  }
}

class JobCard extends StatelessWidget {
  final CardData data;

  const JobCard({super.key, required this.data});

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
              onPressed: () {
                _showDetailsDialog(context, data.details);
              },
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

  void _showDetailsDialog(BuildContext context, String details) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Détails'),
          content: Text(details),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text('Fermer'),
            ),
          ],
        );
      },
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
