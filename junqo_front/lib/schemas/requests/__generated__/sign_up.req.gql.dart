// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:ferry_exec/ferry_exec.dart' as _i1;
import 'package:gql/ast.dart' as _i7;
import 'package:gql_exec/gql_exec.dart' as _i4;
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i6;
import 'package:junqo_front/schemas/requests/__generated__/sign_up.ast.gql.dart'
    as _i5;
import 'package:junqo_front/schemas/requests/__generated__/sign_up.data.gql.dart'
    as _i2;
import 'package:junqo_front/schemas/requests/__generated__/sign_up.var.gql.dart'
    as _i3;

part 'sign_up.req.gql.g.dart';

abstract class GsignUpGetUserReq
    implements
        Built<GsignUpGetUserReq, GsignUpGetUserReqBuilder>,
        _i1.OperationRequest<_i2.GsignUpGetUserData, _i3.GsignUpGetUserVars> {
  GsignUpGetUserReq._();

  factory GsignUpGetUserReq(
          [void Function(GsignUpGetUserReqBuilder b) updates]) =
      _$GsignUpGetUserReq;

  static void _initializeBuilder(GsignUpGetUserReqBuilder b) => b
    ..operation = _i4.Operation(
      document: _i5.document,
      operationName: 'signUpGetUser',
    )
    ..executeOnListen = true;

  @override
  _i3.GsignUpGetUserVars get vars;
  @override
  _i4.Operation get operation;
  @override
  _i4.Request get execRequest => _i4.Request(
        operation: operation,
        variables: vars.toJson(),
        context: context ?? const _i4.Context(),
      );

  @override
  String? get requestId;
  @override
  @BuiltValueField(serialize: false)
  _i2.GsignUpGetUserData? Function(
    _i2.GsignUpGetUserData?,
    _i2.GsignUpGetUserData?,
  )? get updateResult;
  @override
  _i2.GsignUpGetUserData? get optimisticResponse;
  @override
  String? get updateCacheHandlerKey;
  @override
  Map<String, dynamic>? get updateCacheHandlerContext;
  @override
  _i1.FetchPolicy? get fetchPolicy;
  @override
  bool get executeOnListen;
  @override
  @BuiltValueField(serialize: false)
  _i4.Context? get context;
  @override
  _i2.GsignUpGetUserData? parseData(Map<String, dynamic> json) =>
      _i2.GsignUpGetUserData.fromJson(json);

  @override
  Map<String, dynamic> varsToJson() => vars.toJson();

  @override
  Map<String, dynamic> dataToJson(_i2.GsignUpGetUserData data) => data.toJson();

  @override
  _i1.OperationRequest<_i2.GsignUpGetUserData, _i3.GsignUpGetUserVars>
      transformOperation(_i4.Operation Function(_i4.Operation) transform) =>
          this.rebuild((b) => b..operation = transform(operation));

  static Serializer<GsignUpGetUserReq> get serializer =>
      _$gsignUpGetUserReqSerializer;

  Map<String, dynamic> toJson() => (_i6.serializers.serializeWith(
        GsignUpGetUserReq.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignUpGetUserReq? fromJson(Map<String, dynamic> json) =>
      _i6.serializers.deserializeWith(
        GsignUpGetUserReq.serializer,
        json,
      );
}

abstract class GuserDataReq
    implements
        Built<GuserDataReq, GuserDataReqBuilder>,
        _i1.FragmentRequest<_i2.GuserDataData, _i3.GuserDataVars> {
  GuserDataReq._();

  factory GuserDataReq([void Function(GuserDataReqBuilder b) updates]) =
      _$GuserDataReq;

  static void _initializeBuilder(GuserDataReqBuilder b) => b
    ..document = _i5.document
    ..fragmentName = 'userData';

  @override
  _i3.GuserDataVars get vars;
  @override
  _i7.DocumentNode get document;
  @override
  String? get fragmentName;
  @override
  Map<String, dynamic> get idFields;
  @override
  _i2.GuserDataData? parseData(Map<String, dynamic> json) =>
      _i2.GuserDataData.fromJson(json);

  @override
  Map<String, dynamic> varsToJson() => vars.toJson();

  @override
  Map<String, dynamic> dataToJson(_i2.GuserDataData data) => data.toJson();

  static Serializer<GuserDataReq> get serializer => _$guserDataReqSerializer;

  Map<String, dynamic> toJson() => (_i6.serializers.serializeWith(
        GuserDataReq.serializer,
        this,
      ) as Map<String, dynamic>);

  static GuserDataReq? fromJson(Map<String, dynamic> json) =>
      _i6.serializers.deserializeWith(
        GuserDataReq.serializer,
        json,
      );
}
