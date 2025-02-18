import 'package:flutter/material.dart';
import '../shared/widgets/navbar.dart';

class RecruiterDashboard extends StatefulWidget {
  const RecruiterDashboard({super.key});

  @override
  _RecruiterDashboardState createState() => _RecruiterDashboardState();
}

class _RecruiterDashboardState extends State<RecruiterDashboard> {
  final List<Map<String, dynamic>> _activities = [
    {"date": "2024-02-01", "applications": 15, "interviews": 5},
    {"date": "2024-02-02", "applications": 20, "interviews": 7},
    {"date": "2024-02-03", "applications": 12, "interviews": 4},
    {"date": "2024-02-04", "applications": 25, "interviews": 9},
    {"date": "2024-02-05", "applications": 18, "interviews": 6},
  ];

  List<Color> gradientColors = [
    const Color(0xff23b6e6),
    const Color(0xff02d39a),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          const Navbar(currentIndex: 1),
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
    int totalApplications = _activities.fold(
        0, (sum, activity) => sum + (activity["applications"] as int));
    int totalInterviews = _activities.fold(
        0, (sum, activity) => sum + (activity["interviews"] as int));

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
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              "Activité quotidienne",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            SizedBox(
              height: 250,
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
                  DataCell(Text(activity["date"])),
                  DataCell(Text(activity["applications"].toString())),
                  DataCell(Text(activity["interviews"].toString())),
                ]);
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
