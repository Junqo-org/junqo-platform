// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i1;

part 'is_logged_in.data.gql.g.dart';

abstract class GisLoggedInData
    implements Built<GisLoggedInData, GisLoggedInDataBuilder> {
  GisLoggedInData._();

  factory GisLoggedInData([void Function(GisLoggedInDataBuilder b) updates]) =
      _$GisLoggedInData;

  static void _initializeBuilder(GisLoggedInDataBuilder b) =>
      b..G__typename = 'Query';

  @BuiltValueField(wireName: '__typename')
  String get G__typename;
  bool get isLoggedIn;
  static Serializer<GisLoggedInData> get serializer =>
      _$gisLoggedInDataSerializer;

  Map<String, dynamic> toJson() => (_i1.serializers.serializeWith(
        GisLoggedInData.serializer,
        this,
      ) as Map<String, dynamic>);

  static GisLoggedInData? fromJson(Map<String, dynamic> json) =>
      _i1.serializers.deserializeWith(
        GisLoggedInData.serializer,
        json,
      );
}
