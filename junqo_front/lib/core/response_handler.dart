import 'package:ferry/ferry.dart';
import 'package:junqo_front/shared/errors/graphql_exception.dart';

class ResponseHandler {
  static Future<Data?> handleGraphQLResponse<Data, Vars>(
      OperationResponse<Data, Vars> response, String operation) async {
    if (response.hasErrors) {
      if (response.graphqlErrors != null) {
        throw GraphQLException(
          "$operation failed",
          errors: response.graphqlErrors?.map((e) => e.message).toList(),
        );
      }
      if (response.linkException != null) {
        throw 'Link Exception: ${response.linkException?.originalStackTrace}';
      }
      return null;
    }
    return response.data;
  }
}
