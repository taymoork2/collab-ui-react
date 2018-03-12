import { AdvancedMeetingOfferName, OfferName } from './offer-name.keys';

export class OfferNameService {
  public isAdvancedMeetingOfferName(offerName: OfferName): boolean {
    return _.has(AdvancedMeetingOfferName, offerName);
  }

  public getSortedAdvancedMeetingOfferNames(): OfferName[] {
    return _.sortBy(_.values(AdvancedMeetingOfferName));
  }
}
