import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:junqo_front/main.dart';
import 'package:junqo_front/signup.dart';

void main() {
  testWidgets('Test de navigation vers la page Signup', (WidgetTester tester) async {
    await tester.pumpWidget(MyApp());

    expect(find.text('Créer un profil'), findsOneWidget);
  });
}
