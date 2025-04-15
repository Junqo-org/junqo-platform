
class StudentProfile {
  final String userId;
  final String name;
  final String? avatar;
  final List<String>? skills;
  final List<Education>? education;
  final String? description;
  final String? title;
  final String? schoolName;
  final int? age;

  StudentProfile({
    required this.userId,
    required this.name,
    this.avatar,
    this.skills,
    this.education,
    this.description,
    this.title,
    this.schoolName,
    this.age,
  });

  factory StudentProfile.fromJson(Map<String, dynamic> json) {
    // Safe conversion function to handle potential list/dynamic values
    String? safeString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      if (value is List && value.isNotEmpty) return value[0].toString();
      return value.toString();
    }

    // Safe conversion for integer values
    int? safeInt(dynamic value) {
      if (value == null) return null;
      if (value is int) return value;
      if (value is String) return int.tryParse(value);
      if (value is List && value.isNotEmpty) {
        var firstItem = value[0];
        if (firstItem is int) return firstItem;
        if (firstItem is String) return int.tryParse(firstItem);
      }
      return null;
    }

    // Safe conversion for list of strings
    List<String>? safeStringList(dynamic value) {
      if (value == null) return null;
      if (value is List) {
        return value.map((item) => item.toString()).toList();
      }
      if (value is String) return [value];
      return null;
    }

    // Safe conversion for education list
    List<Education>? safeEducationList(dynamic value) {
      if (value == null) return null;
      if (value is List) {
        return value.map((e) {
          if (e is Map<String, dynamic>) {
            return Education.fromJson(e);
          } else if (e is String) {
            // If it's a string, create a minimal education object
            return Education(school: e);
          } else {
            // For other types, create an empty education object
            return Education();
          }
        }).toList();
      }
      return null;
    }

    return StudentProfile(
      userId: safeString(json['userId']) ?? '',
      name: safeString(json['name']) ?? '',
      avatar: safeString(json['avatar']),
      skills: safeStringList(json['skills']),
      education: safeEducationList(json['education']),
      description: safeString(json['description']),
      title: safeString(json['title']),
      schoolName: safeString(json['schoolName']),
      age: safeInt(json['age']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      if (avatar != null) 'avatar': avatar,
      if (skills != null) 'skills': skills,
      if (education != null) 'education': education!.map((e) => e.toJson()).toList(),
      if (description != null) 'description': description,
      if (title != null) 'title': title,
      if (schoolName != null) 'schoolName': schoolName,
      if (age != null) 'age': age,
    };
  }
}

class Education {
  final String? school;
  final String? year;
  final String? duration;
  final String? program;

  Education({
    this.school,
    this.year,
    this.duration,
    this.program,
  });

  factory Education.fromJson(Map<String, dynamic> json) {
    // Safe conversion function to handle potential list/dynamic values
    String? safeString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      if (value is List && value.isNotEmpty) return value[0].toString();
      return value.toString();
    }

    return Education(
      school: safeString(json['school']),
      year: safeString(json['year']),
      duration: safeString(json['duration']),
      program: safeString(json['program']),
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (school != null) data['school'] = school;
    if (year != null) data['year'] = year;
    if (duration != null) data['duration'] = duration;
    if (program != null) data['program'] = program;
    return data;
  }
} 