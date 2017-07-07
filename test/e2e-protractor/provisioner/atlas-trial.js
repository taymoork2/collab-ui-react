export const Offers = {
  OFFER_CALL: 'CALL',
  OFFER_ROOM_SYSTEMS: 'ROOMSYSTEMS',
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

export class TrialOffer {
  constructor(obj = {
    id: undefined,
    licenseCount: undefined,
  }) {
    this.id = obj.id;
    this.licenseCount = obj.licenseCount || 0;
  }
}
