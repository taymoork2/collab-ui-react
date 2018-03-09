import { OfferName } from './offer-name.keys';

export class OfferNameService {
  public static readonly ADVANCED_MEETING_OFFER_NAMES = {
    CMR: OfferName.CMR,
    EC: OfferName.EC,
    EE: OfferName.EE,
    MC: OfferName.MC,
    SC: OfferName.SC,
    TC: OfferName.TC,
  };

  public isAdvancedMeetingOfferName(offerName: OfferName): boolean {
    return _.has(OfferNameService.ADVANCED_MEETING_OFFER_NAMES, offerName);
  }

  public getSortedAdvancedMeetingOfferNames(): OfferName[] {
    return _.sortBy(_.values(OfferNameService.ADVANCED_MEETING_OFFER_NAMES));
  }
}
