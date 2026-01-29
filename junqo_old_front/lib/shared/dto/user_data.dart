import 'package:junqo_front/shared/enums/user_type.dart';

class UserData {
  String id;
  String? name;
  String? email;
  UserType? type;

  UserData({
    required this.id,
    this.name,
    this.email,
    this.type,
  });

  factory UserData.fromJson(Map<String, dynamic> json) {
    final id = json['id'];

    if (id == null || id is! String) {
      throw const FormatException('Invalid or missing id in UserData JSON');
    }
    return UserData(
        id: id,
        name: json['name'] as String?,
        email: json['email'] as String?,
        type: stringToUserType(json['type']));
  }
}
