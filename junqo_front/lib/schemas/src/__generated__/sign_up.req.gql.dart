// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';
import 'package:ferry_exec/ferry_exec.dart' as _i1;
import 'package:gql/ast.dart' as _i7;
import 'package:gql_exec/gql_exec.dart' as _i4;
import 'package:junqo_front/schemas/__generated__/serializers.gql.dart' as _i6;
import 'package:junqo_front/schemas/src/__generated__/sign_up.ast.gql.dart'
    as _i5;
import 'package:junqo_front/schemas/src/__generated__/sign_up.data.gql.dart'
    as _i2;
import 'package:junqo_front/schemas/src/__generated__/sign_up.var.gql.dart'
    as _i3;

part 'sign_up.req.gql.g.dart';

abstract class GsignupReq
    implements
        Built<GsignupReq, GsignupReqBuilder>,
        _i1.OperationRequest<_i2.GsignupData, _i3.GsignupVars> {
  GsignupReq._();

  factory GsignupReq([void Function(GsignupReqBuilder b) updates]) =
      _$GsignupReq;

  static void _initializeBuilder(GsignupReqBuilder b) => b
    ..operation = _i4.Operation(
      document: _i5.document,
      operationName: 'signup',
    )
    ..executeOnListen = true;

  @override
  _i3.GsignupVars get vars;
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
  _i2.GsignupData? Function(
    _i2.GsignupData?,
    _i2.GsignupData?,
  )? get updateResult;
  @override
  _i2.GsignupData? get optimisticResponse;
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
  _i2.GsignupData? parseData(Map<String, dynamic> json) =>
      _i2.GsignupData.fromJson(json);

  @override
  Map<String, dynamic> varsToJson() => vars.toJson();

  @override
  Map<String, dynamic> dataToJson(_i2.GsignupData data) => data.toJson();

  @override
  _i1.OperationRequest<_i2.GsignupData, _i3.GsignupVars> transformOperation(
          _i4.Operation Function(_i4.Operation) transform) =>
      this.rebuild((b) => b..operation = transform(operation));

  static Serializer<GsignupReq> get serializer => _$gsignupReqSerializer;

  Map<String, dynamic> toJson() => (_i6.serializers.serializeWith(
        GsignupReq.serializer,
        this,
      ) as Map<String, dynamic>);

  static GsignupReq? fromJson(Map<String, dynamic> json) =>
      _i6.serializers.deserializeWith(
        GsignupReq.serializer,
        json,
      );
}

abstract class GdataReq
    implements
        Built<GdataReq, GdataReqBuilder>,
        _i1.FragmentRequest<_i2.GdataData, _i3.GdataVars> {
  GdataReq._();

  factory GdataReq([void Function(GdataReqBuilder b) updates]) = _$GdataReq;

  static void _initializeBuilder(GdataReqBuilder b) => b
    ..document = _i5.document
    ..fragmentName = 'data';

  @override
  _i3.GdataVars get vars;
  @override
  _i7.DocumentNode get document;
  @override
  String? get fragmentName;
  @override
  Map<String, dynamic> get idFields;
  @override
  _i2.GdataData? parseData(Map<String, dynamic> json) =>
      _i2.GdataData.fromJson(json);

  @override
  Map<String, dynamic> varsToJson() => vars.toJson();

  @override
  Map<String, dynamic> dataToJson(_i2.GdataData data) => data.toJson();

  static Serializer<GdataReq> get serializer => _$gdataReqSerializer;

  Map<String, dynamic> toJson() => (_i6.serializers.serializeWith(
        GdataReq.serializer,
        this,
      ) as Map<String, dynamic>);

  static GdataReq? fromJson(Map<String, dynamic> json) =>
      _i6.serializers.deserializeWith(
        GdataReq.serializer,
        json,
      );
}
