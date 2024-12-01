import 'package:flutter_test/flutter_test.dart';

import 'package:junqo_front/main.dart';

void main() {
  testWidgets('L\'application démarre sans erreurs', (WidgetTester tester) async {
    await tester.pumpWidget(MyApp());

    expect(find.byType(MyApp), findsOneWidget);
  });
}
