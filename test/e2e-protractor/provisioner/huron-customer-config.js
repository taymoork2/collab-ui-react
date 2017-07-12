import * as os from 'os';
import { CmiCustomer } from './cmi-customer';
import { CmiSite } from './cmi-site';
import { CmiNumberRange } from './cmi-number-range';
import { AtlasTrial, TrialOffer, Offers } from './atlas-trial';

const testPartner = 'huron-ui-test-partner';
const partnerEmail = 'huron.ui.test.partner';
let offers = [];
offers.push(new TrialOffer({
  id: Offers.OFFER_CALL,
  licenseCount: 100,
}));
offers.push(new TrialOffer({
  id: Offers.OFFER_ROOM_SYSTEMS,
  licenseCount: 5,
}));

export function huronCustomer(test, numberRange, users, pstn, pstnLines) {
  const customerName = `${os.userInfo().username}_${test}`;
  const customer = {
    partner: testPartner,
    name: customerName,
    trial: new AtlasTrial({
      customerName: customerName,
      customerEmail: `${partnerEmail}+${customerName}@gmail.com`,
      offers: offers,
    }),
    cmiCustomer: new CmiCustomer(),
    cmiSite: new CmiSite(),
    numberRange: new CmiNumberRange({
      beginNumber: numberRange ? numberRange.beginNumber : '300',
      endNumber: numberRange ? numberRange.endNumber : '399',
    }),
    users: undefined,
    pstn: pstn || undefined,
    pstnLines: pstnLines || undefined,
  };
  return customer;
}

