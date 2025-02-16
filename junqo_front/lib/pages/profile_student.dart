import 'package:flutter/material.dart';

class ProfileData {
  final String name;
  final int age;
  final String title;
  final String description;
  final String profileImageUrl;
  final List<Skill> skills;
  final List<Education> education;
  final String schoolDescription;

  ProfileData({
    required this.name,
    required this.age,
    required this.title,
    required this.description,
    required this.profileImageUrl,
    required this.skills,
    required this.education,
    required this.schoolDescription, //Current school when looking for an internship
  });
}

class Skill {
  final String name;
  final IconData icon;
  final Color backgroundColor;

  Skill({
    required this.name,
    required this.icon,
    required this.backgroundColor,
  });
}

class Education {
  final String schoolName;
  final String year;
  final String duration;
  final String programme;

  Education(
      {required this.schoolName,
      required this.year,
      required this.duration,
      required this.programme});
}

class ProfilePage extends StatelessWidget {
  ProfilePage({Key? key}) : super(key: key);

  final ProfileData profileData = ProfileData(
      name: 'Laura',
      age: 22,
      title: 'Étudiante en marketing',
      description:
          'Je m\'appelle Laura, j\'ai 22 ans et je suis actuellement étudiante en marketing à TBS, une école de management réputée. Passionnée par les stratégies digitales et la communication, j\'ai choisi cette voie pour mieux comprendre les dynamiques qui façonnent le comportement des consommateurs. Mon parcours académique m\'a permis de développer des compétences solides en marketing stratégique, en gestion de projets et en analyse de données. J\'ai eu l\'opportunité de réaliser plusieurs stages dans des entreprises innovantes, où j\'ai pu mettre en pratique mes connaissances en conception de campagnes publicitaires et en gestion des réseaux sociaux. Toujours curieuse et avide d\'apprendre, je m\'intéresse particulièrement aux évolutions récentes du marketing digital, comme l\'influence des technologies émergentes et des nouveaux canaux de communication.En dehors de mes études, je suis une grande adepte de voyages et j\'aime découvrir de nouvelles cultures, ce qui nourrit ma créativité et mon ouverture d\'esprit. Ambitieuse et motivée, je vise à intégrer une entreprise dynamique où je pourrai contribuer à la conception de stratégies marketing innovantes, tout en continuant à me former dans ce secteur en constante évolution.',
      profileImageUrl: '../../assets/images/profile_placeholder.jpg',
      skills: [
        Skill(
          name: 'Socialmedia',
          icon: Icons.public,
          backgroundColor: Colors.pink[100]!,
        ),
        Skill(
          name: 'Marketing',
          icon: Icons.trending_up,
          backgroundColor: Colors.pink[100]!,
        ),
        Skill(
          name: 'Decision making',
          icon: Icons.access_time,
          backgroundColor: Colors.pink[100]!,
        ),
        Skill(
            name: 'Business',
            icon: Icons.trending_up,
            backgroundColor: Colors.pink[100]!)
      ],
      education: [
        Education(
            schoolName: 'Bac Lycée matallah',
            year: '2021-2023',
            duration: '3 an',
            programme:
                "Bacalauréat spécialités: mathématiques, sciences économiques et sociales [SES]"),
        Education(
            schoolName: 'Toulouse Business School',
            year: '2024-2026',
            duration: '2 an',
            programme: "Programme Grande École")
      ],
      schoolDescription:
          'TBS (Toulouse Business School) est l\'une des grandes écoles de management les plus prestigieuses en France, triplement accréditée par les organismes internationaux AACSB, AMBA, et EQUIS. Fondée en 1903, elle figure parmi les institutions d\'excellence reconnues à l\'échelle mondiale pour la qualité de ses enseignements, la richesse de son réseau et son engagement à former les leaders de demain. TBS propose une large gamme de programmes allant du Bachelor aux Masters spécialisés, en passant par des formations en management, finance, marketing et bien d\'autres disciplines adaptées aux besoins actuels du marché.Située dans plusieurs campus, notamment à Toulouse, Paris, Barcelone et Casablanca, TBS offre à ses étudiants un environnement multiculturel unique, favorisant l\'ouverture internationale et les échanges. Les étudiants bénéficient d\'une pédagogie innovante qui associe théorie et pratique grâce à des partenariats solides avec des entreprises de renom. Les stages, projets de groupe, et échanges internationaux sont au cœur de la formation, permettant aux étudiants de développer des compétences concrètes et transversales dans des environnements professionnels variés.TBS se distingue également par son engagement en faveur de la responsabilité sociale et environnementale (RSE). L\'école met l\'accent sur le développement durable, l\'éthique dans les affaires, et encourage ses étudiants à devenir des acteurs du changement, capables de répondre aux défis sociétaux actuels. En rejoignant TBS, vous intégrez une communauté de plus de 45 000 diplômés à travers le monde, bénéficiant d\'un réseau puissant pour accélérer votre carrière dans le monde des affaires. Avec un enseignement de qualité, des opportunités à l\'international et un accompagnement personnalisé, TBS est une référence incontournable pour tous ceux qui souhaitent réussir dans le monde du management.');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        color: Colors.grey[100],
        child: Center(
          child: Card(
            margin: const EdgeInsets.all(16),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 1000),
              padding: const EdgeInsets.all(24),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Section
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Profile Image and Basic Info
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 40,
                              backgroundImage:
                                  NetworkImage(profileData.profileImageUrl),
                            ),
                            const SizedBox(width: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${profileData.name}, ${profileData.age}',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  profileData.title,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),

                        // Presentation Section
                        const Text(
                          'Présentation',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(profileData.description),

                        const SizedBox(height: 24),

                        // Skills Section
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: profileData.skills.map((skill) {
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: skill.backgroundColor,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(skill.icon, size: 16),
                                    const SizedBox(width: 4),
                                    Text(skill.name),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Right Section
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Formation',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...profileData.education
                            .map((edu) => Container(
                                  margin: const EdgeInsets.only(bottom: 16),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              edu.schoolName,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              '${edu.programme} - ${edu.duration}',
                                              style: TextStyle(
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(
                                        edu.year,
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ],
                                  ),
                                ))
                            .toList(),
                        const SizedBox(height: 24),
                        const Text(
                          'Qui sommes-nous ?',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(profileData.schoolDescription),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
