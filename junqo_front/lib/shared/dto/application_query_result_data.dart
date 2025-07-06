import './application_data.dart'; // Adjusted path

class ApplicationQueryResultData {
  final List<ApplicationData> rows;
  final int count;

  ApplicationQueryResultData({
    required this.rows,
    required this.count,
  });

  factory ApplicationQueryResultData.fromJson(Map<String, dynamic> json) {
    var list = json['rows'] as List;
    List<ApplicationData> applicationsList =
        list.map((i) => ApplicationData.fromJson(i)).toList();

    return ApplicationQueryResultData(
      rows: applicationsList,
      count: json['count'] as int,
    );
  }
} 