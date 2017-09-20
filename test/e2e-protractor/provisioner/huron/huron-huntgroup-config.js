import * as provisionerHelper from '../provisioner.helper';
import * as cmiHelper from './provisioner.helper.cmi';

export function getUUIDS(token, customer) {
  let member = 'Obi';
  let fallback = 'Pri'
  let uuidArray = [];
  return cmiHelper.getMemberUUID(token, customer.callOptions.cmiCustomer.uuid, `${member}`)
    .then((response) => {
      uuidArray[0] = response.members[0].numbers[0].uuid;
      return cmiHelper.getMemberUUID(token, customer.callOptions.cmiCustomer.uuid, `${fallback}`)
        .then((response) => {
          uuidArray[1] = response.members[0].numbers[0].uuid;
          return uuidArray; 
        });
    });
}

export function createHuntGroup(customer) {
  return provisionerHelper.getToken(customer.partner)
    .then(token => {
      return getUUIDS(token, customer)
        .then((uuidArray) => {
          var hgBody = {
            fallbackDestination: {
              numberUuid: `${uuidArray[0]}`,
              sendToVoicemail: false,
            },
            huntMethod: 'DA_LONGEST_IDLE_TIME',
            members: [
              `${uuidArray[1]}`,
            ],
            name: `${customer.name}_test_hg`,
            numbers: [{
              number: '310',
              type: 'NUMBER_FORMAT_EXTENSION',
            }],
          }
          return cmiHelper.createCmiHuntGroup(token, customer.callOptions.cmiCustomer.uuid, hgBody)
            .then(() => {
              console.log(`Successfully added hunt group for ${customer.name}!`);
            });
        });
    });
}
