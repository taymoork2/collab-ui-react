import * as _ from 'lodash';
import * as os from 'os';
import { atlasCustomer } from '../atlas-customer-config';
import { CmiCustomer } from './cmi-customer';
import { CmiSite } from './cmi-site';
import { CmiNumberRange } from './cmi-number-range';
import { customerNumbersPSTN } from './provisioner.helper.pstn';
import { huronUsers } from './huron-users-config';
import { huronPlaces } from './huron-places-config';

export const partnerEmail = isProductionBackend ? 'huron.ui.test.partner+production_' : 'huron.ui.test.partner+';
const now = Date.now();

export function huronCustomer(huronCustomerOptions) {
  const options = huronCustomerOptions;
  const customerName = `${os.userInfo().username}_${options.test}`;
  const pstnNumbers = customerNumbersPSTN(options.pstn);
  const customer = {
    partner: testPartner(options),
    name: customerName,
    email: `${partnerEmail}${customerName}_${now}@gmail.com`,
    offers: options.offers || ['CALL'],
    callOptions: callOptions(options, pstnNumbers),
    users: huronUsers(options.users, options.numberRange ? options.numberRange.beginNumber : undefined, pstnNumbers),
    doFtsw: options.doFtsw || false,
    places: huronPlaces(options.places, options.numberRange ? options.numberRange.beginNumber : undefined, pstnNumbers),
    // doHuntGroup: doHuntGroup || false,
    doCallPickUp: options.doCallPickUp || false,
    doCallPark: options.doCallPark || false,
  };
  return atlasCustomer(customer);
}

function callOptions(options, pstnNumbers) {
  if (_.includes(options.offers, 'CALL') || _.includes(options.offers, 'ROOMSYSTEMS') || !options.offers) {
    const callOptions = options.callOptions || {
      cmiCustomer: new CmiCustomer(options.cmiCustomer),
      cmiSite: new CmiSite(options.cmiSite),
      numberRange: new CmiNumberRange(options.numberRange ? options.numberRange : undefined),
      pstn: pstnNumbers || undefined,
    };
    return callOptions;
  }
}

function testPartner(options) {
  const toggle = _.get(options, 'toggle');
  if (toggle) {
    return isProductionBackend ? 'huron-ui-test-partner-prod' : `huron-ui-test-partner-${toggle}`;
  }
  return isProductionBackend ? 'huron-ui-test-partner-prod' : 'huron-ui-test-partner';
}
