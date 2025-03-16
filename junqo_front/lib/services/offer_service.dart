import 'package:ferry/ferry.dart';
import 'package:built_collection/built_collection.dart';
import 'package:junqo_front/core/response_handler.dart';
import 'package:junqo_front/schemas/requests/__generated__/create_offer.req.gql.dart';
import 'package:junqo_front/schemas/requests/__generated__/create_offer.data.gql.dart';
import 'package:junqo_front/shared/dto/offer_data.dart';

class OfferService {
  final Client client;

  OfferService(this.client);

  Future<GcreateOfferData?> createOffer(OfferData offerData) async {
    final request = GcreateOfferReq((b) => b
      ..vars.input.title = offerData.title
      ..vars.input.description = offerData.description
      ..vars.input.category = offerData.category
      ..vars.input.tags = ListBuilder(offerData.tags)
      ..vars.input.expiresAt = offerData.expiresAt
      ..vars.input.userId = offerData.userId);

    final response = await client.request(request).first;
    return await ResponseHandler.handleGraphQLResponse(response, "CreateOffer");
  }
}
