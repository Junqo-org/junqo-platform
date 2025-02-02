// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart' show StandardJsonPlugin;
import 'package:ferry_exec/ferry_exec.dart';
import 'package:gql_code_builder_serializers/gql_code_builder_serializers.dart'
    show OperationSerializer;
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart'
    show GUserType;
import 'package:junqo_front/schemas/src/__generated__/sign_up.data.gql.dart'
    show GdataData, GsignupData, GsignupData_signUp, GsignupData_signUp_user;
import 'package:junqo_front/schemas/src/__generated__/sign_up.req.gql.dart'
    show GdataReq, GsignupReq;
import 'package:junqo_front/schemas/src/__generated__/sign_up.var.gql.dart'
    show GdataVars, GsignupVars;

part 'serializers.gql.g.dart';

final SerializersBuilder _serializersBuilder = _$serializers.toBuilder()
  ..add(OperationSerializer())
  ..addPlugin(StandardJsonPlugin());
@SerializersFor([
  GUserType,
  GdataData,
  GdataReq,
  GdataVars,
  GsignupData,
  GsignupData_signUp,
  GsignupData_signUp_user,
  GsignupReq,
  GsignupVars,
])
final Serializers serializers = _serializersBuilder.build();
