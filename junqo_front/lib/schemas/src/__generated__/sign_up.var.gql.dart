// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart'
    as _i1;
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i2;

part 'sign_up.var.gql.g.dart';

abstract class GsignupVars implements Built<GsignupVars, GsignupVarsBuilder> {
  GsignupVars._();

  factory GsignupVars([void Function(GsignupVarsBuilder b) updates]) =
      _$GsignupVars;

  _i1.GUserType get type;
  String get email;
  String get name;
  String get password;
  static Serializer<GsignupVars> get serializer => _$gsignupVarsSerializer;

  Map<String, dynamic> toJson() => (_i2.serializers.serializeWith(
        GsignupVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignupVars? fromJson(Map<String, dynamic> json) =>
      _i2.serializers.deserializeWith(
        GsignupVars.serializer,
        json,
      );
}

abstract class GdataVars implements Built<GdataVars, GdataVarsBuilder> {
  GdataVars._();

  factory GdataVars([void Function(GdataVarsBuilder b) updates]) = _$GdataVars;

  static Serializer<GdataVars> get serializer => _$gdataVarsSerializer;

  Map<String, dynamic> toJson() => (_i2.serializers.serializeWith(
        GdataVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GdataVars? fromJson(Map<String, dynamic> json) =>
      _i2.serializers.deserializeWith(
        GdataVars.serializer,
        json,
      );
}
