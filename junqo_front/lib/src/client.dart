import 'package:gql_http_link/gql_http_link.dart';
import 'package:ferry/ferry.dart';
import 'package:ferry_hive_store/ferry_hive_store.dart';
import 'package:hive_flutter/adapters.dart';
import 'package:hive_flutter/hive_flutter.dart';

const apiUrl = 'localhost:3000';

Future<Client> initClient({bool clearBox = false}) async {
  await Hive.initFlutter();

  final box = await Hive.openBox<Map<String, dynamic>>("graphql");

  if (clearBox) {
    await box.clear();
  }

  final store = HiveStore(box);

  final cache = Cache(store: store);

  final link = HttpLink(apiUrl);

  final client = Client(
    link: link,
    cache: cache,
  );

  return client;
}
