import 'package:flutter/material.dart';
import '../shared/widgets/navbar.dart';

class RecruiterDashboard extends StatefulWidget {
  const RecruiterDashboard({super.key});

  @override
  _RecruiterDashboardState createState() => _RecruiterDashboardState();
}

class Activity {
  final DateTime date;
  final int applications;
  final int interviews;

  Activity({
    required this.date,
    required this.applications,
    required this.interviews,
  });

  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      date: DateTime.parse(json['date']),
      applications: json['applications'],
      interviews: json['interviews'],
    );
  }
}

class DateFormat {
  String format(DateTime date) {
    return date.toIso8601String().split('T').first;
  }
}

class _RecruiterDashboardState extends State<RecruiterDashboard> {
  List<Activity> _activities = [];

  List<Color> gradientColors = [
    const Color(0xff23b6e6),
    const Color(0xff02d39a),
  ];

  @override
  void initState() {
    super.initState();
    _fetchActivities();
  }

  Future<void> _fetchActivities() async {
    // TODO: Implement API call
    _activities = [
      Activity(
          date: DateTime.parse("2024-02-01"), applications: 15, interviews: 5),
      Activity(
          date: DateTime.parse("2024-02-02"), applications: 20, interviews: 7),
      Activity(
          date: DateTime.parse("2024-02-03"), applications: 12, interviews: 4),
      Activity(
          date: DateTime.parse("2024-02-04"), applications: 25, interviews: 9),
      Activity(
          date: DateTime.parse("2024-02-05"), applications: 18, interviews: 6),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          const Navbar(currentIndex: 0),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    "Tableau de bord Recruteur",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildStatsCard(),
                  const SizedBox(height: 24),
                  _buildActivityChart(),
                  const SizedBox(height: 24),
                  _buildActivityTable(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCard() {
    int totalApplications =
        _activities.fold(0, (sum, activity) => sum + activity.applications);
    int totalInterviews =
        _activities.fold(0, (sum, activity) => sum + activity.interviews);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildStatItem("Candidatures", totalApplications.toString()),
            _buildStatItem("Entretiens", totalInterviews.toString()),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 16, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildActivityChart() {
    final _dateFormatter = DateFormat();

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "Activité quotidienne",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 250,
              child: ListView.builder(
                itemCount: _activities.length,
                itemBuilder: (context, index) {
                  final activity = _activities[index];
                  return ListTile(
                    title: Text(_dateFormatter.format(activity.date)),
                    subtitle: Text(
                      'Candidatures: ${activity.applications}, Entretiens: ${activity.interviews}',
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityTable() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              "Détails des activités",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            DataTable(
              columns: const [
                DataColumn(label: Text("Date")),
                DataColumn(label: Text("Candidatures")),
                DataColumn(label: Text("Entretiens")),
              ],
              rows: _activities.map((activity) {
                return DataRow(cells: [
                  DataCell(
                      Text(activity.date.toIso8601String().split('T').first)),
                  DataCell(Text(activity.applications.toString())),
                  DataCell(Text(activity.interviews.toString())),
                ]);
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
