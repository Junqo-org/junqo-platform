import 'package:flutter/material.dart';
import 'package:junqo_front/shared/widgets/navbar.dart';
import 'package:junqo_front/core/api/api_service.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';
import 'package:get_it/get_it.dart';
import 'package:junqo_front/core/client.dart';

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
  final String id;
  final String userid;
  final String status;
  final bool isPlaceHolder;

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
    required this.id,
    required this.userid,
    required this.status,
    required this.isPlaceHolder,
  });
}

//
class JobCardSwipe extends StatefulWidget {
  final RestClient client = GetIt.instance<RestClient>();

  JobCardSwipe({super.key});

  @override
  State<JobCardSwipe> createState() => _JobCardSwipeState();
}

class _JobCardSwipeState extends State<JobCardSwipe> {
  late CardData cardData;
  late final ApiService _apiService;
  late final RestClient client;

  @override
  void initState() {
    super.initState();
    _apiService = GetIt.instance<ApiService>();
    client = widget.client;
    _initCardData();
  }

  List<CardData> cardDataList = [
    CardData(
      companyName: 'Company PlaceHolder Inc. 1',
      companyLogo: 'assets/company_a.png',
      jobTitle: 'Software PlaceHolder',
      contractType: 'Full-time PlaceHolder',
      duration: '6 months PlaceHolder',
      location: 'Remote',
      salary: '60,000€ - 80,000€',
      benefits: ['Gym Membership'],
      technicalSkills: ['Flutter', 'Dart', 'REST API'],
      details:
          'If you see this placeholder it means that there is either no more data or that the data is not yet available.1',
      id: '1',
      userid: '1',
      status: 'active',
      isPlaceHolder: true,
    ),
    CardData(
      companyName: 'Company PlaceHolder Inc. 2',
      companyLogo: 'assets/company_a.png',
      jobTitle: 'Software PlaceHolder',
      contractType: 'Full-time PlaceHolder',
      duration: '6 months PlaceHolder',
      location: 'Remote',
      salary: '60,000€ - 80,000€',
      benefits: ['Gym Membership'],
      technicalSkills: ['Flutter', 'Dart', 'REST API'],
      details:
          'If you see this placeholder it means that there is either no more data or that the data is not yet available.2',
      id: '1',
      userid: '1',
      status: 'active',
      isPlaceHolder: true,
    )
  ];
  bool initialized = false;
  int currentIndex = 0;
  int offsetIndex = 0;
  bool outOfData = false;

  Future<void> _initCardData() async {
    final data = await setCardData();
    setState(() {
      cardData = data;
    });
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
                  onTap: () async {
                    final newData = await setCardData();
                    setState(() {
                      cardData = newData;
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
                  onTap: () async {
                    postulate(cardData.id);
                    final newData = await setCardData();
                    setState(() {
                      cardData = newData;
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

  void postulate(String id) {
    // Implement the postulate logic here
    if (cardData.isPlaceHolder) {
      debugPrint('Cannot postulate for placeholder data');
      return;
    }
    debugPrint('Postulating for offer with ID: $id');
    _apiService.postulateOffer(id);
    //Postulate to offer
  }

  Future<CardData> setCardData() async {
    if (!initialized) {
      initialized = true;
      cardDataList = await getOfferQuery(0);
      if (cardDataList.isEmpty) {
        outOfData = true;
        currentIndex = 0;
        return placeholderCardData()[0];
      }
      debugPrint('Card Data initialized with ${cardDataList.length} items');
      return cardDataList[currentIndex];
    }

    if (outOfData) {
      debugPrint('No more data available');
      if (currentIndex == 0) {
        currentIndex = 1;
        return placeholderCardData()[1];
      } else {
        currentIndex = 0;
        return placeholderCardData()[0];
      }
    }
    //rest of code
    currentIndex++;
    debugPrint('Current index: $currentIndex');
    debugPrint('Card data list length: ${cardDataList.length}');
    if (currentIndex >= cardDataList.length) {
      debugPrint('Fetching more data');
      offsetIndex = offsetIndex + currentIndex;
      currentIndex = 0;
      cardDataList = await getOfferQuery(offsetIndex);
      if (cardDataList.isEmpty) {
        outOfData = true;
        currentIndex = 0;
        return placeholderCardData()[0];
      }
      return cardDataList[currentIndex];
    }

    return cardDataList[currentIndex];
  }

  fakeAllOffersQuery() {
    return [
      OfferData(
        id: '1',
        title: 'Software Engineer',
        offerType: 'Full-time',
        duration: '6 months',
        salary: '60,000€ - 80,000€',
        benefits: ['Gym Membership'],
        skills: ['Flutter', 'Dart', 'REST API'],
        educationLevel: 'Bachelor\'s Degree',
        description: 'Job description goes here.',
        status: 'active',
      ),
      OfferData(
        id: '2',
        title: 'Data Scientist',
        offerType: 'Part-time',
        duration: '3 months',
        salary: '50,000€ - 70,000€',
        benefits: ['Health Insurance'],
        skills: ['Python', 'Machine Learning'],
        educationLevel: 'Master\'s Degree',
        description: 'Job description goes here.',
        status: 'active',
      ),
      OfferData(
        id: '3',
        title: 'Product Manager',
        offerType: 'Contract',
        duration: '12 months',
        salary: '80,000€ - 100,000€',
        benefits: ['Remote Work'],
        skills: ['Agile', 'Scrum'],
        educationLevel: 'Master\'s Degree',
        description: 'Job description goes here.',
        status: 'active',
      ),
    ];
  }

  Future<List<CardData>> getOfferQuery(int offset) async {
    try {
      final query = {
        'offset': offset.toString(),
      };

      //Should be replaced with ApiService.getAllOffersQuery
      final List<OfferData> offers = await _apiService.getAllOffersQuery(query);
      // final List<OfferData> offers = await fakeAllOffersQuery();

      // Transform each OfferData into CardData
      final List<CardData> cardDataList = transformOffersToCards(offers);
      if (cardDataList.isEmpty) {
        // If no data is returned, return the placeholder data
        return placeholderCardData();
      }

      return cardDataList;
    } catch (e) {
      throw Exception('Failed to load offers: $e');
    }
  }

  CardData transformOfferToCard(OfferData offer) {
    return CardData(
      id: offer.id ?? '',
      userid: offer.userid,
      jobTitle: offer.title,
      contractType: offer.offerType,
      duration: offer.duration,
      salary: offer.salary,
      benefits: [...offer.benefits, offer.workLocationType],
      technicalSkills: [...offer.skills, offer.educationLevel],
      details: offer.description,
      status: offer.status,
      companyName: 'Company name currently not available',
      companyLogo: 'Company logo currently not available',
      location: 'Location currently not available',
      showDetails: false,
      isPlaceHolder: false,
    );
  }

  List<CardData> transformOffersToCards(List<OfferData> offers) {
    return offers.map(transformOfferToCard).toList();
  }

  List<CardData> placeholderCardData() {
    return [
      CardData(
        companyName: 'Company PlaceHolder Inc.',
        companyLogo: 'assets/company_a.png',
        jobTitle: 'Software PlaceHolder',
        contractType: 'Full-time PlaceHolder',
        duration: '6 months PlaceHolder',
        location: 'Remote',
        salary: '60,000€ - 80,000€',
        benefits: ['Gym Membership'],
        technicalSkills: ['Flutter', 'Dart', 'REST API'],
        details:
            'If you see this placeholder it means that there is either no more data or that the data is not yet available.4',
        id: '1',
        userid: '1',
        status: 'active',
        isPlaceHolder: true,
      ),
      CardData(
        companyName: 'Company PlaceHolder Inc.',
        companyLogo: 'assets/company_a.png',
        jobTitle: 'Software PlaceHolder',
        contractType: 'Full-time PlaceHolder',
        duration: '6 months PlaceHolder',
        location: 'Remote',
        salary: '60,000€ - 80,000€',
        benefits: ['Gym Membership'],
        technicalSkills: ['Flutter', 'Dart', 'REST API'],
        details:
            'If you see this placeholder it means that there is either no more data or that the data is not yet available.5',
        id: '1',
        userid: '1',
        status: 'active',
        isPlaceHolder: true,
      )
    ];
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
