// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart'
    as _i2;
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i1;

part 'sign_up.data.gql.g.dart';

abstract class GsignUpGetUserData
    implements Built<GsignUpGetUserData, GsignUpGetUserDataBuilder> {
  GsignUpGetUserData._();

  factory GsignUpGetUserData(
          [void Function(GsignUpGetUserDataBuilder b) updates]) =
      _$GsignUpGetUserData;

  static void _initializeBuilder(GsignUpGetUserDataBuilder b) =>
      b..G__typename = 'Mutation';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  GsignUpGetUserData_signUp get signUp;
  static Serializer<GsignUpGetUserData> get serializer =>
      _$gsignUpGetUserDataSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignUpGetUserData.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignUpGetUserData? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignUpGetUserData.serializer,
        json,
      );
}

abstract class GsignUpGetUserData_signUp
    implements
        Built<GsignUpGetUserData_signUp, GsignUpGetUserData_signUpBuilder> {
  GsignUpGetUserData_signUp._();

  factory GsignUpGetUserData_signUp(
          [void Function(GsignUpGetUserData_signUpBuilder b) updates]) =
      _$GsignUpGetUserData_signUp;

  static void _initializeBuilder(GsignUpGetUserData_signUpBuilder b) =>
      b..G__typename = 'AuthPayload';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  String get token;
  GsignUpGetUserData_signUp_user get user;
  static Serializer<GsignUpGetUserData_signUp> get serializer =>
      _$gsignUpGetUserDataSignUpSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignUpGetUserData_signUp.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignUpGetUserData_signUp? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignUpGetUserData_signUp.serializer,
        json,
      );
}

abstract class GsignUpGetUserData_signUp_user
    implements
        Built<GsignUpGetUserData_signUp_user,
            GsignUpGetUserData_signUp_userBuilder>,
        GuserData {
  GsignUpGetUserData_signUp_user._();

  factory GsignUpGetUserData_signUp_user(
          [void Function(GsignUpGetUserData_signUp_userBuilder b) updates]) =
      _$GsignUpGetUserData_signUp_user;

  static void _initializeBuilder(GsignUpGetUserData_signUp_userBuilder b) =>
      b..G__typename = 'User';

  @override
  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  @override
  String get id;
  @override
  _i2.GUserType get type;
  @override
  String get name;
  @override
  String get email;
  static Serializer<GsignUpGetUserData_signUp_user> get serializer =>
      _$gsignUpGetUserDataSignUpUserSerializer;

  @override
  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignUpGetUserData_signUp_user.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignUpGetUserData_signUp_user? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignUpGetUserData_signUp_user.serializer,
        json,
      );
}

abstract class GuserData {
  String get G__typename;
  String get id;
  _i2.GUserType get type;
  String get name;
  String get email;
  Map<String, dynamic> toJson();
}

abstract class GuserDataData
    implements Built<GuserDataData, GuserDataDataBuilder>, GuserData {
  GuserDataData._();

  factory GuserDataData([void Function(GuserDataDataBuilder b) updates]) =
      _$GuserDataData;

  static void _initializeBuilder(GuserDataDataBuilder b) =>
      b..G__typename = 'User';

  @override
  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  @override
  String get id;
  @override
  _i2.GUserType get type;
  @override
  String get name;
  @override
  String get email;
  static Serializer<GuserDataData> get serializer => _$guserDataDataSerializer;

  @override
  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GuserDataData.serializer,
        this,
      ) as Map<String, dynamic>);

  static GuserDataData? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GuserDataData.serializer,
        json,
      );
}
