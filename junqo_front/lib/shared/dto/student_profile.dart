class StudentProfile {
  final String userId;
  final String name;
  final String? avatar;
  final List<String>? skills;
  final List<Education>? education;
  final List<ExperienceDTO>? experiences;
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
    this.experiences,
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

    // Safe conversion for experience list
    List<ExperienceDTO>? safeExperienceList(dynamic value) {
      if (value == null) return null;
      if (value is List) {
        return value
            .map((e) {
              if (e is Map<String, dynamic>) {
                return ExperienceDTO.fromJson(e);
              } else {
                // Handle potential malformed data if necessary, or return null/empty
                return null; // Or throw an error, or return an empty ExperienceDTO()
              }
            })
            .whereType<ExperienceDTO>() // Filter out nulls
            .toList();
      }
      return null;
    }

    return StudentProfile(
      userId: safeString(json['userId']) ?? '',
      name: safeString(json['name']) ?? '',
      avatar: safeString(json['avatar']),
      skills: safeStringList(json['skills']),
      education: safeEducationList(json['education']),
      experiences: safeExperienceList(json['experiences']),
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
      if (experiences != null) 'experiences': experiences!.map((e) => e.toJson()).toList(),
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

class ExperienceDTO {
  final String? id;
  final String title;
  final String company;
  final String startDate;
  final String? endDate;
  final String? description;
  final List<String>? skills;

  ExperienceDTO({
    this.id,
    required this.title,
    required this.company,
    required this.startDate,
    this.endDate,
    this.description,
    this.skills,
  });

  factory ExperienceDTO.fromJson(Map<String, dynamic> json) {
    // Safe conversion function (can reuse from StudentProfile or define locally)
    String? safeString(dynamic value) {
      if (value == null) return null;
      if (value is String) return value;
      return value.toString();
    }
    List<String>? safeStringList(dynamic value) {
      if (value == null) return null;
      if (value is List) {
        return value.map((item) => item.toString()).toList();
      }
      if (value is String) return [value];
      return null;
    }

    return ExperienceDTO(
      id: safeString(json['id']),
      title: safeString(json['title']) ?? '',
      company: safeString(json['company']) ?? '',
      startDate: safeString(json['startDate']) ?? '',
      endDate: safeString(json['endDate']),
      description: safeString(json['description']),
      skills: safeStringList(json['skills']),
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (id != null) data['id'] = id;
    data['title'] = title;
    data['company'] = company;
    data['startDate'] = startDate;
    if (endDate != null) data['endDate'] = endDate;
    if (description != null) data['description'] = description;
    if (skills != null) data['skills'] = skills;
    return data;
  }
} 