import 'package:ferry/ferry.dart';
import 'package:junqo_front/core/response_handler.dart';
import 'package:junqo_front/schemas/requests/__generated__/get_user_by_id.req.gql.dart';
import 'package:junqo_front/shared/dto/user_data.dart';
import 'package:junqo_front/shared/dto/user_type.dart';

class UserService {
  final Client client;
  UserData? _userData;

  UserService(this.client);

  UserData? get userData => _userData;

  Future<UserData?> fetchUserData(String id) async {
    final request = GgetUserByIdReq((b) => b..vars.id = id);
    final response = await client.request(request).first;
    final data =
        await ResponseHandler.handleGraphQLResponse(response, "GetUserById");

    if (data == null) {
      return null;
    }
    UserType? userType;

    if (data.user?.type != null) {
      userType = gUserTypeToUserType(data.user!.type);
    }
    _userData = UserData(
        id: id, name: data.user?.name, email: data.user?.email, type: userType);
    return _userData;
  }
}
