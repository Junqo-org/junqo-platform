import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/widgets.dart';

void main() {
  test('widgets binding initializes successfully', () {
    WidgetsFlutterBinding.ensureInitialized();

    expect(WidgetsBinding.instance, isNotNull);
    expect(WidgetsBinding.instance, isA<WidgetsFlutterBinding>());
  });
}
