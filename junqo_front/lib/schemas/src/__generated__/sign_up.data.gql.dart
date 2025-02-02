// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i1;

part 'sign_up.data.gql.g.dart';

abstract class GsignupData implements Built<GsignupData, GsignupDataBuilder> {
  GsignupData._();

  factory GsignupData([void Function(GsignupDataBuilder b) updates]) =
      _$GsignupData;

  static void _initializeBuilder(GsignupDataBuilder b) =>
      b..G__typename = 'Mutation';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  GsignupData_signUp get signUp;
  static Serializer<GsignupData> get serializer => _$gsignupDataSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignupData.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignupData? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignupData.serializer,
        json,
      );
}

abstract class GsignupData_signUp
    implements Built<GsignupData_signUp, GsignupData_signUpBuilder> {
  GsignupData_signUp._();

  factory GsignupData_signUp(
          [void Function(GsignupData_signUpBuilder b) updates]) =
      _$GsignupData_signUp;

  static void _initializeBuilder(GsignupData_signUpBuilder b) =>
      b..G__typename = 'AuthPayload';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  String get token;
  GsignupData_signUp_user get user;
  static Serializer<GsignupData_signUp> get serializer =>
      _$gsignupDataSignUpSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignupData_signUp.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignupData_signUp? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignupData_signUp.serializer,
        json,
      );
}

abstract class GsignupData_signUp_user
    implements
        Built<GsignupData_signUp_user, GsignupData_signUp_userBuilder>,
        Gdata {
  GsignupData_signUp_user._();

  factory GsignupData_signUp_user(
          [void Function(GsignupData_signUp_userBuilder b) updates]) =
      _$GsignupData_signUp_user;

  static void _initializeBuilder(GsignupData_signUp_userBuilder b) =>
      b..G__typename = 'User';

  @override
  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  @override
  String get id;
  @override
  String get name;
  @override
  String get email;
  static Serializer<GsignupData_signUp_user> get serializer =>
      _$gsignupDataSignUpUserSerializer;

  @override
  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignupData_signUp_user.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignupData_signUp_user? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignupData_signUp_user.serializer,
        json,
      );
}

abstract class Gdata {
  String get G__typename;
  String get id;
  String get name;
  String get email;
  Map<String, dynamic> toJson();
}

abstract class GdataData implements Built<GdataData, GdataDataBuilder>, Gdata {
  GdataData._();

  factory GdataData([void Function(GdataDataBuilder b) updates]) = _$GdataData;

  static void _initializeBuilder(GdataDataBuilder b) => b..G__typename = 'User';

  @override
  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  @override
  String get id;
  @override
  String get name;
  @override
  String get email;
  static Serializer<GdataData> get serializer => _$gdataDataSerializer;

  @override
  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GdataData.serializer,
        this,
      ) as Map<String, dynamic>);

  static GdataData? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GdataData.serializer,
        json,
      );
}
