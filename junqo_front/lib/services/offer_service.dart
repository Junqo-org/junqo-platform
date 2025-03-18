import 'package:ferry/ferry.dart';
import 'package:built_collection/built_collection.dart';
import 'package:junqo_front/core/response_handler.dart';
import 'package:junqo_front/schemas/requests/__generated__/create_offer.req.gql.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';

class OfferService {
  final Client client;

  OfferService(this.client);

  Future<void> createOffer(OfferData offerData) async {
    final request = GcreateOfferReq((b) => b
      ..vars.input.title = offerData.title
      ..vars.input.description = offerData.description
      ..vars.input.offerType = offerData.offerType
      ..vars.input.duration = offerData.duration
      ..vars.input.salary = offerData.salary
      ..vars.input.workLocationType = offerData.workLocationType
      ..vars.input.expiresAt = offerData.expiresAt
      ..vars.input.skills = ListBuilder(offerData.skills)
      ..vars.input.benefits = ListBuilder(offerData.benefits)
      ..vars.input.educationLevel = offerData.educationLevel
      ..vars.input.userId = offerData.userid);

    final response = await client.request(request).first;
    return await ResponseHandler.handleGraphQLResponse(response, "CreateOffer");
  }
}
