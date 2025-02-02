// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint

import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'schema.schema.gql.g.dart';

class GUserType extends EnumClass {
  const GUserType._(String name) : super(name);

  static const GUserType STUDENT = _$gUserTypeSTUDENT;

  static const GUserType SCHOOL = _$gUserTypeSCHOOL;

  static const GUserType COMPANY = _$gUserTypeCOMPANY;

  static const GUserType ADMIN = _$gUserTypeADMIN;

  static Serializer<GUserType> get serializer => _$gUserTypeSerializer;

  static BuiltSet<GUserType> get values => _$gUserTypeValues;

  static GUserType valueOf(String name) => _$gUserTypeValueOf(name);
}

const Map<String, Set<String>> possibleTypesMap = {};
