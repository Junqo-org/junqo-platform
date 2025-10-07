import 'dart:io';

void main(List<String> args) {
  if (args.isEmpty) {
    stderr.writeln('Usage: dart run tools/generate_sitemap.dart <baseUrl>');
    exit(2);
  }
  final baseUrl = args[0].trim().replaceAll(RegExp(r'/$'), '');
  const routerPath = 'lib/router.dart';
  const outPath = 'web/sitemap.xml';

  final routerFile = File(routerPath);
  if (!routerFile.existsSync()) {
    stderr.writeln('Cannot find $routerPath');
    exit(2);
  }

  final content = routerFile.readAsStringSync();
  final reg = RegExp(r'''case\s+['"]([^'"]+)['"]\s*:''');
  final matches = reg.allMatches(content);
  final routes = <String>{for (final m in matches) m.group(1)!};

  if (!routes.contains('/')) routes.add('/');

  final now = DateTime.now().toUtc();
  final lastmod =
      '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

  final buffer = StringBuffer();
  buffer.writeln('<?xml version="1.0" encoding="UTF-8"?>');
  buffer
      .writeln('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  final sorted = routes.toList()..sort();
  for (final route in sorted) {
    final path = route == '/' ? '' : route;
    final loc = '$baseUrl$path';
    final priority = route == '/' ? '1.00' : '0.80';
    buffer.writeln('  <url>');
    buffer.writeln('    <loc>$loc</loc>');
    buffer.writeln('    <lastmod>$lastmod</lastmod>');
    buffer.writeln('    <priority>$priority</priority>');
    buffer.writeln('  </url>');
  }

  buffer.writeln('</urlset>');

  final outFile = File(outPath);
  outFile.createSync(recursive: true);
  outFile.writeAsStringSync(buffer.toString());
  stdout.writeln('Sitemap written to $outPath (${routes.length} routes)');
}
