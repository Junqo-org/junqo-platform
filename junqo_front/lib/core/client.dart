import 'package:gql_exec/gql_exec.dart';
import 'package:gql_http_link/gql_http_link.dart';
import 'package:ferry/ferry.dart';
import 'package:ferry_hive_store/ferry_hive_store.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:junqo_front/core/config.dart';

/// Initializes a GraphQL client with local caching and authentication using Hive.
///
/// [clearBox] - When true, clears any existing cached data.
///
/// Throws [HiveError] if box initialization fails.
/// Throws [HttpLinkError] if API URL is invalid.
Future<Client> initClient({bool clearBox = false}) async {
  try {
    final authBox = await Hive.openBox<String>('auth');

    if (clearBox) {
      await authBox.clear();
    }

    final authLink = Link.function((request, [forward]) {
      String? token = authBox.get('token');

      final headers = {
        'Accept': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final modifiedRequest =
          request.withContextEntry(HttpLinkHeaders(headers: headers));
      return forward!(modifiedRequest);
    });

    final link = authLink.concat(HttpLink(AppConfig.apiUrl));

    final client = Client(
      link: link,
    );

    return client;
  } catch (e) {
    throw Exception('Failed to initialize GraphQL client: $e');
  }
}
