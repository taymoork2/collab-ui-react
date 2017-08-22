import * as os from 'os';
import { CmiCustomer } from './cmi-customer';
import { CmiSite } from './cmi-site';
import { CmiNumberRange } from './cmi-number-range';
import { AtlasTrial, TrialOffer, Offers } from '../atlas-trial';

const testPartner = isProductionBackend ? 'huron-ui-test-partner-prod' : 'huron-ui-test-partner';
const partnerEmail = isProductionBackend ? 'huron.ui.test.partner+production_' : 'huron.ui.test.partner+';
const now = Date.now();

let offers = [];

export function huronCustomer(test, numberRange, users, pstn, pstnLines, doFtsw, selectedOffer) {
  switch (selectedOffer) {
    case 'CALL':
      offers.push(new TrialOffer({
        id: Offers.OFFER_CALL,
        licenseCount: 100,
      }));
      break;
    case 'ROOMSYSTEMS':
      offers.push(new TrialOffer({
        id: Offers.OFFER_ROOM_SYSTEMS,
        licenseCount: 5,
      }));
      break;
    default:
      offers.push(new TrialOffer({
        id: Offers.OFFER_CALL,
        licenseCount: 100,
      }));
      offers.push(new TrialOffer({
        id: Offers.OFFER_ROOM_SYSTEMS,
        licenseCount: 5,
      }));
  }
  const customerName = `${os.userInfo().username}_${test}`;
  const customer = {
    partner: testPartner,
    name: customerName,
    trial: new AtlasTrial({
      customerName: customerName,
      customerEmail: `${partnerEmail}${customerName}_${now}@gmail.com`,
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
    pstnLines: pstnLines || 3,
    doFtsw: doFtsw || false,
  };
  return customer;
}
