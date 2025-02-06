// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart' show StandardJsonPlugin;
import 'package:ferry_exec/ferry_exec.dart';
import 'package:gql_code_builder_serializers/gql_code_builder_serializers.dart'
    show OperationSerializer;
import 'package:junqo_front/schemas/__generated__/schema.schema.gql.dart'
    show GUserType;
import 'package:junqo_front/schemas/requests/__generated__/is_logged_in.data.gql.dart'
    show GisLoggedInData;
import 'package:junqo_front/schemas/requests/__generated__/is_logged_in.req.gql.dart'
    show GisLoggedInReq;
import 'package:junqo_front/schemas/requests/__generated__/is_logged_in.var.gql.dart'
    show GisLoggedInVars;
import 'package:junqo_front/schemas/requests/__generated__/sign_in.data.gql.dart'
    show
        GsignInGetUserData,
        GsignInGetUserData_signIn,
        GsignInGetUserData_signIn_user,
        GuserDataData;
import 'package:junqo_front/schemas/requests/__generated__/sign_in.req.gql.dart'
    show GsignInGetUserReq, GuserDataReq;
import 'package:junqo_front/schemas/requests/__generated__/sign_in.var.gql.dart'
    show GsignInGetUserVars, GuserDataVars;
import 'package:junqo_front/schemas/requests/__generated__/sign_up.data.gql.dart'
    show
        GsignUpGetUserData,
        GsignUpGetUserData_signUp,
        GsignUpGetUserData_signUp_user;
import 'package:junqo_front/schemas/requests/__generated__/sign_up.req.gql.dart'
    show GsignUpGetUserReq;
import 'package:junqo_front/schemas/requests/__generated__/sign_up.var.gql.dart'
    show GsignUpGetUserVars;

part 'serializers.gql.g.dart';

final SerializersBuilder _serializersBuilder = _$serializers.toBuilder()
  ..add(OperationSerializer())
  ..addPlugin(StandardJsonPlugin());
@SerializersFor([
  GUserType,
  GisLoggedInData,
  GisLoggedInReq,
  GisLoggedInVars,
  GsignInGetUserData,
  GsignInGetUserData_signIn,
  GsignInGetUserData_signIn_user,
  GsignInGetUserReq,
  GsignInGetUserVars,
  GsignUpGetUserData,
  GsignUpGetUserData_signUp,
  GsignUpGetUserData_signUp_user,
  GsignUpGetUserReq,
  GsignUpGetUserVars,
  GuserDataData,
  GuserDataReq,
  GuserDataVars,
])
final Serializers serializers = _serializersBuilder.build();
