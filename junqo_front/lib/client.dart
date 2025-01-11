import 'package:gql_http_link/gql_http_link.dart';
import 'package:ferry/ferry.dart';
import 'package:ferry_hive_store/ferry_hive_store.dart';
import 'package:hive_flutter/hive_flutter.dart';

const apiUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://localhost:3000/graphql',
);

/// Initializes a GraphQL client with local caching using Hive.
///
/// [clearBox] - When true, clears any existing cached data.
///
/// Throws [HiveError] if box initialization fails.
/// Throws [HttpLinkError] if API URL is invalid.
Future<Client> initClient({bool clearBox = false}) async {
  try {
    await Hive.initFlutter();

    final box = await Hive.openBox<Map<String, dynamic>>("graphql");

    if (clearBox) {
      await box.clear();
    }

    final store = HiveStore(box);
    final cache = Cache(store: store);
    final link = HttpLink(
      apiUrl,
      defaultHeaders: {'Accept': 'application/json'},
    );

    final client = Client(
      link: link,
      cache: cache,
    );

    return client;
  } catch (e) {
    throw Exception('Failed to initialize GraphQL client: $e');
  }
}