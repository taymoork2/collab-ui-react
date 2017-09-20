import * as provisionerHelper from '../provisioner.helper';
import * as cmiHelper from './provisioner.helper.cmi';
import * as hgHelper from './huron-huntgroup-config';

export function setupHuntGroup(customer) {
  if (customer.doHuntGroup) {
    hgHelper.createHuntGroup(customer);
  }
}

export function setupCallPickup(customer) {
  if (customer.doCallPickUp) {
    const callPickupName = `${customer.name}_test_pickup`
    const member_Obi = 'Obi'
    const member_Princess = 'Princess'
    let uuid_Obi = ''
    let uuid_Princess = ''
    console.log(`Provisioing call pickup for ${customer.name}!`);
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        return cmiHelper.getUserUUID(token, customer.callOptions.cmiCustomer.uuid, `${member_Obi}`)
          .then(response => {
            return cmiHelper.getNumberUUID(token, customer.callOptions.cmiCustomer.uuid, `${response.members[0].uuid}`)
              .then(response => {
                uuid_Obi = `${response.numbers[0].uuid}`
                return cmiHelper.getUserUUID(token, customer.callOptions.cmiCustomer.uuid, `${member_Princess}`)
                  .then(response => {
                    return cmiHelper.getNumberUUID(token, customer.callOptions.cmiCustomer.uuid, `${response.members[0].uuid}`)
                      .then(response => {
                        uuid_Princess = `${response.numbers[0].uuid}`
                        var pickUpBody = {
                          name: `${callPickupName}`,
                          members: [
                            `${uuid_Obi}`,
                            `${uuid_Princess}`,
                          ],
                        }
                        return cmiHelper.createCallPickUp(token, customer.callOptions.cmiCustomer.uuid, pickUpBody)
                          .then(() => {
                            console.log(`Successfully added call pickup${customer.name}!`);
                          })
                      })
                  })
              })
          })
      })
  }
}

export function setupCallPark(customer) {
  var promises = [];
  var userMembers = [];

  if (customer.doCallPark && (customer.users.length >= 2)) {
    const callParkName = `${customer.name}_test_callpark`

    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        // Skip the last user so it can be added in a test.
        for (let i = 0; i < customer.users.length - 1; i++) {
          promises.push(
            cmiHelper.getUserUUID(token, customer.callOptions.cmiCustomer.uuid, customer.users[i].name.givenName)
              .then((response) => {
                userMembers.push(response.members[0].uuid);
              })
          );
        }

        Promise.all(promises).then(() => {
          var callParkBody = {
            name: callParkName,
            startRange: (parseInt(customer.callOptions.numberRange.beginNumber) + 50).toString(),
            endRange: (parseInt(customer.callOptions.numberRange.beginNumber) + 59).toString(),
            members: userMembers,
          };

          return cmiHelper.createCallPark(token, customer.callOptions.cmiCustomer.uuid, callParkBody)
            .then(() => {
              console.log(`Successfully added call park for ${customer.name}.`);
            });
        });
      });
  }
}
