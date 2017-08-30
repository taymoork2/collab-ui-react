import * as provisionerHelper from '../provisioner.helper';
import * as cmiHelper from './provisioner.helper.cmi';

export function setupHuntGroup(customer) {
  const huntGroupName = `${customer.name}_HG`
  const memberEmail = `${customer.name}_0@gmail.com`
  const fallbackEmail = `${customer.name}_1@gmail.com`
  const huntingType = 'DA_LONGEST_IDLE_TIME'
  const huntPilotDN = '310'
  const dn_type = 'NUMBER_FORMAT_EXTENSION'
  let tempArray = ''
  let memberUUID = ''
  let fallbackUUID = ''
  if (customer.doHuntGroup) {
    console.log(`Need to provision hunt group for ${customer.name}!`);
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        console.log('Got token for provisionUsers!');
        console.log('Get UUID of member')
        return cmiHelper.getMemberUUID(token, customer.cmiCustomer.uuid, `${memberEmail}`)
          .then((response) => {
            tempArray = _.find(_.get(response, 'members', undefined), ['userName', `${memberEmail}`]);
            memberUUID = tempArray.numbers[0].uuid
            console.log(`Got UUID of member ${memberUUID}`)
            console.log('Get UUID of fallback Destination')
            return cmiHelper.getMemberUUID(token, customer.cmiCustomer.uuid, `${fallbackEmail}`)
              .then((response) => {
                tempArray = _.find(_.get(response, 'members', undefined), ['userName', `${fallbackEmail}`]);
                fallbackUUID = tempArray.numbers[0].uuid
                console.log(`Got UUID of fallback destination ${fallbackUUID}`)
                console.log('prepare post for hunt group and post it!')
                var hgBody = {
                  fallbackDestination: {
                    numberUuid: `${fallbackUUID}`,
                    sendToVoicemail: false,
                  },
                  huntMethod: `${huntingType}`,
                  members: [
                    `${memberUUID}`,
                  ],
                  name: `${huntGroupName}`,
                  numbers: [{
                    number: `${huntPilotDN}`,
                    type: `${dn_type}`,
                  }],
                }
                return cmiHelper.createCmiHuntGroup(token, customer.cmiCustomer.uuid, hgBody)
                  .then(() => {
                    console.log(`Successfully added hunt group for ${customer.name}!`);
                  });
              });
          });
      });
  }
}
