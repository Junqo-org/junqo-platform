import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:ferry/ferry.dart';

import 'package:junqo_front/src/client.dart';
import 'package:junqo_front/src/app.dart';

void main() async {
  final client = await initClient();
  // Register the client to be accessible globally
  GetIt.instance.registerLazySingleton<TypedLink>(() => client);

  runApp(const App());
}
