// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i1;

part 'is_logged_in.var.gql.g.dart';

abstract class GisLoggedInVars
    implements Built<GisLoggedInVars, GisLoggedInVarsBuilder> {
  GisLoggedInVars._();

  factory GisLoggedInVars([void Function(GisLoggedInVarsBuilder b) updates]) =
      _$GisLoggedInVars;

  static Serializer<GisLoggedInVars> get serializer =>
      _$gisLoggedInVarsSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GisLoggedInVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GisLoggedInVars? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GisLoggedInVars.serializer,
        json,
      );
}
