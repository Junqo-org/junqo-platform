// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i1;

part 'sign_in.var.gql.g.dart';

abstract class GsignInGetUserVars
    implements Built<GsignInGetUserVars, GsignInGetUserVarsBuilder> {
  GsignInGetUserVars._();

  factory GsignInGetUserVars(
          [void Function(GsignInGetUserVarsBuilder b) updates]) =
      _$GsignInGetUserVars;

  String get email;
  String get password;
  static Serializer<GsignInGetUserVars> get serializer =>
      _$gsignInGetUserVarsSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignInGetUserVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignInGetUserVars? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignInGetUserVars.serializer,
        json,
      );
}

abstract class GuserDataVars
    implements Built<GuserDataVars, GuserDataVarsBuilder> {
  GuserDataVars._();

  factory GuserDataVars([void Function(GuserDataVarsBuilder b) updates]) =
      _$GuserDataVars;

  static Serializer<GuserDataVars> get serializer => _$guserDataVarsSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GuserDataVars.serializer,
        this,
      ) as Map<String, dynamic>);

  static GuserDataVars? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GuserDataVars.serializer,
        json,
      );
}
