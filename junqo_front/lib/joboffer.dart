//Currently need to replace main.dart to work

import 'package:flutter/material.dart';
import 'dart:convert';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Job Offer Viewer',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const JobOfferPage(),
    );
  }
}

class JobOfferPage extends StatefulWidget {
  const JobOfferPage({super.key});

  @override
  _JobOfferPageState createState() => _JobOfferPageState();
}

class _JobOfferPageState extends State<JobOfferPage> {
  late JobOffer jobOffer;

  @override
  void initState() {
    super.initState();
    loadJobOffer();
  }

  void loadJobOffer() {
    String jsonString = '''
    {
      "jobOffer": {
        "companyLogo": "image.png",
        "companyName": "Airbus",
        "postingDate": "2024-11-16",
        "jobTitle": "Alternance DevOps (H/F)",
        "IsInternship": 1,
        "duration": {
          "value": 3,
          "value_type": "ans"
        },
        "location": "Blagnac",
        "compensation": {
          "amount": "1400",
          "currency": "€"
        },
        "companyConfiguration": {
          "teamSize": "Grande équipe",
          "workMode": "Présentiel",
          "facilities": [
            "Installations de fitness"
          ]
        },
        "requirements": {
          "skillsRequired": [
            "Docker",
            "GitHub",
            "Jira",
            "Bash",
            "Linux"
          ],
          "educationLevel": "bac +3 informatique"
        }
      }
    }
    ''';

    final parsedJson = json.decode(jsonString);
    jobOffer = JobOffer.fromJson(parsedJson['jobOffer']);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.transparent,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/airbus_logo.png', height: 40), // Logo
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              'Posté il y a X jour (pas oubliée de modifier)',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
        ],
      ),
      body: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Container for the job offer
            Container(
              width: 350,
              height: 700,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: Colors.black, width: 2),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Company Name
                        Text(
                          jobOffer.companyName,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Job Title
                        Text(
                          jobOffer.jobTitle,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Job type and duration details
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildJobDetailCard(Icons.business, 'Alternance'),
                            _buildJobDetailCard(Icons.timer,
                                '${jobOffer.duration.value} ${jobOffer.duration.valueType}'),
                          ],
                        ),
                        const SizedBox(height: 10),
                        // Location and Compensation
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _buildJobDetailCard(
                                Icons.location_on, jobOffer.location),
                            _buildJobDetailCard(Icons.euro,
                                '${jobOffer.compensation.amount} ${jobOffer.compensation.currency}'),
                          ],
                        ),
                        const SizedBox(height: 20),
                        // Work Mode and Team Size
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.pink[50],
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildIconText(Icons.work,
                                  jobOffer.companyConfiguration.workMode),
                              const SizedBox(height: 8),
                              _buildIconText(Icons.people,
                                  jobOffer.companyConfiguration.teamSize),
                              const SizedBox(height: 8),
                              _buildIconText(
                                  Icons.fitness_center,
                                  jobOffer.companyConfiguration.facilities
                                      .join(', ')),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Requirements
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                jobOffer.requirements.educationLevel,
                                style: const TextStyle(
                                    fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8.0,
                                runSpacing: 4.0,
                                children: jobOffer.requirements.skillsRequired
                                    .map((skill) => Chip(label: Text(skill)))
                                    .toList(),
                              ),
                            ],
                          ),
                        ),
                        const Spacer(),
                        // Details button
                        ElevatedButton(
                          onPressed: () {
                            // Action for "Afficher les détails"
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 40, vertical: 12),
                            backgroundColor: Colors.lightBlue[200],
                          ),
                          child: const Text(
                            'Afficher les détails',
                            style: TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobDetailCard(IconData icon, String text) {
    return Expanded(
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Icon(icon, color: Colors.deepPurple),
              const SizedBox(width: 10),
              Text(text, style: const TextStyle(fontSize: 16)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIconText(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: Colors.deepPurple),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(fontSize: 16)),
      ],
    );
  }
}

class JobOffer {
  final String companyLogo;
  final String companyName;
  final DateTime postingDate;
  final String jobTitle;
  final bool isInternship;
  final DurationInfo duration;
  final String location;
  final Compensation compensation;
  final CompanyConfiguration companyConfiguration;
  final Requirements requirements;

  JobOffer({
    required this.companyLogo,
    required this.companyName,
    required this.postingDate,
    required this.jobTitle,
    required this.isInternship,
    required this.duration,
    required this.location,
    required this.compensation,
    required this.companyConfiguration,
    required this.requirements,
  });

  factory JobOffer.fromJson(Map<String, dynamic> json) {
    return JobOffer(
      companyLogo: json['companyLogo'],
      companyName: json['companyName'],
      postingDate: DateTime.parse(json['postingDate']),
      jobTitle: json['jobTitle'],
      isInternship: json['IsInternship'] == 1,
      duration: DurationInfo.fromJson(json['duration']),
      location: json['location'],
      compensation: Compensation.fromJson(json['compensation']),
      companyConfiguration:
          CompanyConfiguration.fromJson(json['companyConfiguration']),
      requirements: Requirements.fromJson(json['requirements']),
    );
  }
}

class DurationInfo {
  final int value;
  final String valueType;

  DurationInfo({
    required this.value,
    required this.valueType,
  });

  factory DurationInfo.fromJson(Map<String, dynamic> json) {
    return DurationInfo(
      value: json['value'],
      valueType: json['value_type'],
    );
  }
}

class Compensation {
  final String amount;
  final String currency;

  Compensation({
    required this.amount,
    required this.currency,
  });

  factory Compensation.fromJson(Map<String, dynamic> json) {
    return Compensation(
      amount: json['amount'],
      currency: json['currency'],
    );
  }
}

class CompanyConfiguration {
  final String teamSize;
  final String workMode;
  final List<String> facilities;

  CompanyConfiguration({
    required this.teamSize,
    required this.workMode,
    required this.facilities,
  });

  factory CompanyConfiguration.fromJson(Map<String, dynamic> json) {
    return CompanyConfiguration(
      teamSize: json['teamSize'],
      workMode: json['workMode'],
      facilities: List<String>.from(json['facilities']),
    );
  }
}

class Requirements {
  final List<String> skillsRequired;
  final String educationLevel;

  Requirements({
    required this.skillsRequired,
    required this.educationLevel,
  });

  factory Requirements.fromJson(Map<String, dynamic> json) {
    return Requirements(
      skillsRequired: List<String>.from(json['skillsRequired']),
      educationLevel: json['educationLevel'],
    );
  }
}
