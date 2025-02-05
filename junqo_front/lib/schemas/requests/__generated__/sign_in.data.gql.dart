// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart'
    as _i2;
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i1;

part 'sign_in.data.gql.g.dart';

abstract class GsignInGetUserData
    implements Built<GsignInGetUserData, GsignInGetUserDataBuilder> {
  GsignInGetUserData._();

  factory GsignInGetUserData(
          [void Function(GsignInGetUserDataBuilder b) updates]) =
      _$GsignInGetUserData;

  static void _initializeBuilder(GsignInGetUserDataBuilder b) =>
      b..G__typename = 'Mutation';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  GsignInGetUserData_signIn get signIn;
  static Serializer<GsignInGetUserData> get serializer =>
      _$gsignInGetUserDataSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignInGetUserData.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignInGetUserData? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignInGetUserData.serializer,
        json,
      );
}

abstract class GsignInGetUserData_signIn
    implements
        Built<GsignInGetUserData_signIn, GsignInGetUserData_signInBuilder> {
  GsignInGetUserData_signIn._();

  factory GsignInGetUserData_signIn(
          [void Function(GsignInGetUserData_signInBuilder b) updates]) =
      _$GsignInGetUserData_signIn;

  static void _initializeBuilder(GsignInGetUserData_signInBuilder b) =>
      b..G__typename = 'AuthPayload';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  String get token;
  GsignInGetUserData_signIn_user get user;
  static Serializer<GsignInGetUserData_signIn> get serializer =>
      _$gsignInGetUserDataSignInSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignInGetUserData_signIn.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignInGetUserData_signIn? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignInGetUserData_signIn.serializer,
        json,
      );
}

abstract class GsignInGetUserData_signIn_user
    implements
        Built<GsignInGetUserData_signIn_user,
            GsignInGetUserData_signIn_userBuilder>,
        GuserData {
  GsignInGetUserData_signIn_user._();

  factory GsignInGetUserData_signIn_user(
          [void Function(GsignInGetUserData_signIn_userBuilder b) updates]) =
      _$GsignInGetUserData_signIn_user;

  static void _initializeBuilder(GsignInGetUserData_signIn_userBuilder b) =>
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
  static Serializer<GsignInGetUserData_signIn_user> get serializer =>
      _$gsignInGetUserDataSignInUserSerializer;

  @override
  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GsignInGetUserData_signIn_user.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignInGetUserData_signIn_user? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GsignInGetUserData_signIn_user.serializer,
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
