import 'package:gql_http_link/gql_http_link.dart';
import 'package:ferry/ferry.dart';
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

    final apiUrl = AppConfig.apiUrl;

    bool isUriValid = Uri.tryParse(apiUrl)?.hasScheme ?? false;
    if (isUriValid == false) {
      throw HttpLinkError('Invalid API URL: $apiUrl');
    }

    final link = authLink.concat(HttpLink(AppConfig.apiUrl));

    final client = Client(
      link: link,
    );

    return client;
  } on HiveError catch (e) {
    throw Exception('Failed to initialize auth storage: $e');
  } on HttpLinkError catch (e) {
    throw Exception('Failed to initialize HTTP link: $e');
  } catch (e) {
    throw Exception('Failed to initialize GraphQL client: $e');
  }
}

class HttpLinkError extends Error {
  final String message;

  HttpLinkError(this.message);

  @override
  String toString() => 'HttpLinkError: $message';
}
