import 'package:flutter_test/flutter_test.dart';
import 'package:junqo_front/main.dart';

void main() {
  testWidgets('Test de navigation vers la page Signup', (WidgetTester tester) async {
    await tester.pumpWidget(MyApp());

    expect(find.text('Créer un profil'), findsOneWidget);
  });
}
