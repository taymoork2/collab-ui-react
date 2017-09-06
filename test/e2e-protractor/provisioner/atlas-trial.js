import * as _ from 'lodash';

export const Offers = {
  OFFER_CALL: 'CALL',
  OFFER_ROOM_SYSTEMS: 'ROOMSYSTEMS',
  OFFER_MESSAGE: 'MESSAGE',
  OFFER_MEETING: 'MEETING',
};

export class AtlasTrial {
  constructor(obj = {
    customerName: undefined,
    customerEmail: undefined,
    trialPeriod: undefined,
    country: undefined,
    dealId: undefined,
    startDate: undefined,
    details: {
      devices: [],
    },
    offers: undefined,
  }) {
    this.customerName = obj.customerName;
    this.customerEmail = obj.customerEmail;
    this.trialPeriod = obj.trialPeriod || 90;
    this.country = obj.country || 'US';
    this.dealId = obj.dealId || '';
    this.startDate = obj.startDate || new Date();
    this.details = obj.details || { details: { devices: [] } };
    this.offers = obj.offers;
  }
};

export function getTrialOffers(offerList) {
  let offers = [];
  let id;
  let licenseCount;

  _.forEach(offerList, (offer) => {
    switch (offer) {
      case 'CALL':
        id = Offers.OFFER_CALL;
        licenseCount = 100;
        break;
      case 'ROOMSYSTEMS':
        id = Offers.OFFER_ROOM_SYSTEMS;
        licenseCount = 5;
        break;
      case 'MEETING':
        id = Offers.OFFER_MEETING;
        licenseCount = 100;
        break;
      default:
        id = Offers.OFFER_MESSAGE;
    }
    offers.push(new TrialOffer({
      id,
      licenseCount,
    }));
  })
  return offers;
}

export class TrialOffer {
  constructor(obj = {
    id: undefined,
    licenseCount: undefined,
  }) {
    this.id = obj.id;
    this.licenseCount = obj.licenseCount || 0;
  }
}
