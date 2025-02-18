import 'package:junqo_front/shared/dto/user_type.dart';

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
    return UserData(
        id: json['id'],
        name: json['name'],
        email: json['email'],
        type: stringToUserType(json['type']));
  }
}
