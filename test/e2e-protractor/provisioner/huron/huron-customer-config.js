import * as _ from 'lodash';
import * as os from 'os';
import { atlasCustomer } from '../atlas-customer-config';
import { CmiCustomer } from './cmi-customer';
import { CmiSite } from './cmi-site';
import { CmiNumberRange } from './cmi-number-range';
import { customerNumbersPSTN } from './provisioner.helper.pstn';
import { huronUsers } from './huron-users-config';

const testPartner = isProductionBackend ? 'huron-ui-test-partner-prod' : 'huron-ui-test-partner';
export const partnerEmail = isProductionBackend ? 'huron.ui.test.partner+production_' : 'huron.ui.test.partner+';
const now = Date.now();

export function huronCustomer(huronCustomerOptions) {
  const options = huronCustomerOptions;
  const customerName = `${os.userInfo().username}_${options.test}`;
  const pstnNumbers = customerNumbersPSTN(options.pstn);
  function getCallOptions() {
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
  const customer = {
    partner: testPartner,
    name: customerName,
    email: `${partnerEmail}${customerName}_${now}@gmail.com`,
    offers: options.offers || ['CALL'],
    callOptions: getCallOptions(),
    users: huronUsers(options.users, options.numberRange ? options.numberRange.beginNumber : undefined, pstnNumbers),
    doFtsw: options.doFtsw || false,
    // doHuntGroup: doHuntGroup || false,
  };
  return atlasCustomer(customer);
}
