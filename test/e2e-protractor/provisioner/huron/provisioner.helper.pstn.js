import * as provisionerHelper from '../provisioner.helper';
import { PstnCustomer } from './terminus-customers';
import { PstnCustomerE911Signee } from './terminus-customers-customer-e911';
import { PstnNumbersOrders } from './terminus-numbers-orders';

export function createPstnCustomer(token, customer) {
  const options = {
    method: 'POST',
    uri: `${config.getTerminusServiceUrl()}v2/customers`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: customer,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function putE911Signee(token, customerE911) {
  const options = {
    method: 'PUT',
    uri: `${config.getTerminusServiceUrl()}v1/customers/${customerE911.e911Signee}`,
    headers: {
      Authorization: `Bearer  ${token}`,
    },
    body: customerE911,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function addPstnNumbers(token, customerNumbers, uuid) {
  const options = {
    method: 'POST',
    uri: `${config.getTerminusServiceUrl()}v2/customers/${uuid}/numbers/orders`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: customerNumbers,
    json: true,
  };
  return provisionerHelper.makeRequest(options);
}

export function setupPSTN(customer) {
  if (customer.callOptions.pstn) {
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        console.log('Creating PSTN customer');
        var obj = {};
        obj.firstName = customer.callOptions.cmiCustomer.name;
        obj.email = customer.trial.customerEmail;
        obj.uuid = customer.callOptions.cmiCustomer.uuid;
        obj.name = customer.name;
        obj.resellerId = helper.auth[customer.partner].org;
        const pstnCustomer = new PstnCustomer(obj);
        return createPstnCustomer(token, pstnCustomer)
          .then(() => {
            console.log('Adding e911 signature to customer');
            obj = {};
            obj.firstName = customer.callOptions.cmiCustomer.name;
            obj.email = customer.trial.customerEmail;
            obj.name = customer.name;
            obj.e911Signee = customer.callOptions.cmiCustomer.uuid;
            const pstnCustomerE911 = new PstnCustomerE911Signee(obj);
            return putE911Signee(token, pstnCustomerE911)
              .then(() => {
                console.log('Adding phone numbers to customer');
                obj = {};
                obj.numbers = customer.callOptions.pstn;
                const pstnNumbersOrders = new PstnNumbersOrders(obj);
                return addPstnNumbers(token, pstnNumbersOrders, customer.callOptions.cmiCustomer.uuid);
              });
          });
      });
  }
}

export function customerNumbersPSTN(number) {
  if (number) {
    var prevNumber = 0;
    var pstnNumbers = [];
    for (var i = 0; i < number; i++) {
      var numbers = numberPSTN(prevNumber);
      prevNumber = numbers[1];
      pstnNumbers.push(numbers[0]);
    }
    return pstnNumbers;
  }
}

export function numberPSTN(prevNumber) {
  var randNum = Math.floor(Math.random() * 999999) + 10000;
  if (randNum <= prevNumber) {
    randNum = ++prevNumber;
  } else {
    prevNumber = randNum;
  }
  randNum = randNum.toString();
  randNum = ('7997293' + randNum).slice(-7);
  randNum = ('+1919' + randNum);
  console.log('Added Phone Number: ' + randNum);
  return [randNum, prevNumber];
}
