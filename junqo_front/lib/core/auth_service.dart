import 'package:ferry/ferry.dart';
import 'package:hive/hive.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart';
import 'package:junqo_front/schemas/src/__generated__/sign_up.req.gql.dart';

class AuthService {
  final Client client;
  final Box<String> authBox = Hive.box<String>('auth');

  AuthService(this.client);

  Future<bool> register(
      String name, String email, String password, GUserType type) async {
    final request = GsignupReq(
      (b) => b
        ..vars.name = name
        ..vars.email = email
        ..vars.password = password
        ..vars.type = type,
    );

    final response = await client.request(request).first;

    if (response.hasErrors) {
      print('Error: when registering');
      if (response.graphqlErrors != null) {
        for (final error in response.graphqlErrors!) {
          print('Error: graphqlError ${error.message}');
        }
      }
      if (response.linkException != null) {
        print(
            'Error: linkException ${response.linkException?.originalStackTrace}');
      }
      return false;
    }

    final token = response.data?.signUp.token;

    if (token != null) {
      await authBox.put('token', token);
      print('Token: $token');
      return true;
    }
    return false;
  }

  Future<void> logout() async {
    await authBox.delete('token');
  }

  String? get token => authBox.get('token');

  bool get isLoggedIn => token != null;
}
