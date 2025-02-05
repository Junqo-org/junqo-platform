// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart'
    as _i1;
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i2;

part 'sign_up.var.gql.g.dart';

abstract class GsignUpGetUserVars
    implements Built<GsignUpGetUserVars, GsignUpGetUserVarsBuilder> {
  GsignUpGetUserVars._();

  factory GsignUpGetUserVars(
          [void Function(GsignUpGetUserVarsBuilder b) updates]) =
      _$GsignUpGetUserVars;

  _i1.GUserType get type;
  String get email;
  String get name;
  String get password;
  static Serializer<GsignUpGetUserVars> get serializer =>
      _$gsignUpGetUserVarsSerializer;

  Map<String, dynamic> toJson() => (_i2.serializers.serializeWith(
        GsignUpGetUserVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignUpGetUserVars? fromJson(Map<String, dynamic> json) =>
      _i2.serializers.deserializeWith(
        GsignUpGetUserVars.serializer,
        json,
      );
}

abstract class GuserDataVars
    implements Built<GuserDataVars, GuserDataVarsBuilder> {
  GuserDataVars._();

  factory GuserDataVars([void Function(GuserDataVarsBuilder b) updates]) =
      _$GuserDataVars;

  static Serializer<GuserDataVars> get serializer => _$guserDataVarsSerializer;

  Map<String, dynamic> toJson() => (_i2.serializers.serializeWith(
        GuserDataVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GuserDataVars? fromJson(Map<String, dynamic> json) =>
      _i2.serializers.deserializeWith(
        GuserDataVars.serializer,
        json,
      );
}
