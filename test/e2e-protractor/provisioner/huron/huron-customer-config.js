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
  let allPstnNumbers = [];
  if (options.doAllFeatures) {
    options.users = {};
    options.places = {};
    options.users.noOfUsers = 2;
    options.users.noOfDids = 2;
    options.places.noOfPlaces = 2;
    options.places.noOfDids = 2;
  }
  if (options.pstn) {
    allPstnNumbers = customerNumbersPSTN(options.pstn);
  };
  if (options.users && options.users.noOfDids > 0) {
    var userPstnNumbers = customerNumbersPSTN(options.users.noOfDids);
    allPstnNumbers.push.apply(allPstnNumbers, userPstnNumbers);
  };
  if (options.places && options.places.noOfDids > 0) {
    var placesPstnNumbers = customerNumbersPSTN(options.places.noOfDids);
    allPstnNumbers.push.apply(allPstnNumbers, placesPstnNumbers);
  };
  if (allPstnNumbers.length < 1) {
    allPstnNumbers = undefined;
  };
  const customer = {
    partner: testPartner(options),
    name: customerName,
    email: `${partnerEmail}${customerName}_${now}@gmail.com`,
    offers: options.offers || ['CALL'],
    callOptions: callOptions(options, allPstnNumbers),
    users: huronUsers(options.users ? options.users.noOfUsers : false, options.numberRange ? options.numberRange.beginNumber : undefined, userPstnNumbers),
    doFtsw: options.doFtsw || false,
    places: huronPlaces(options.places ? options.places.noOfPlaces : false, options.numberRange ? options.numberRange.beginNumber : undefined, placesPstnNumbers),
    doHuntGroup: options.doHuntGroup || false,
    doCallPickup: options.doCallPickup || false,
    doCallPark: options.doCallPark || false,
    doCallPaging: options.doCallPaging || false,
    doAllFeatures: options.doAllFeatures || false,
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
