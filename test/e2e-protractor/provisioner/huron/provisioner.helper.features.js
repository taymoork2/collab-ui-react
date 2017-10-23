import * as provisionerHelper from '../provisioner.helper';
import * as cmiHelper from './provisioner.helper.cmi';
import * as hgHelper from './huron-huntgroup-config';

export function setupHuntGroup(customer) {
  if (customer.doHuntGroup || customer.doAllFeatures) {
    hgHelper.createHuntGroup(customer);
  }
}

export function setupCallPickup(customer) {
  if (customer.doCallPickup || customer.doAllFeatures) {
    const callPickupName = `${customer.name}_test_pickup`
    const member0 = customer.users[0].name.givenName
    const member1 = customer.users[1].name.givenName
    let uuid0 = ''
    let uuid1 = ''
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        return cmiHelper.getUserUUID(token, customer.callOptions.cmiCustomer.uuid, member0)
          .then(response => {
            return cmiHelper.getNumberUUID(token, customer.callOptions.cmiCustomer.uuid, `${response.members[0].uuid}`)
              .then(response => {
                uuid0 = `${response.numbers[0].uuid}`
                return cmiHelper.getUserUUID(token, customer.callOptions.cmiCustomer.uuid, member1)
                  .then(response => {
                    return cmiHelper.getNumberUUID(token, customer.callOptions.cmiCustomer.uuid, `${response.members[0].uuid}`)
                      .then(response => {
                        uuid1 = `${response.numbers[0].uuid}`
                        var pickupBody = {
                          name: `${callPickupName}`,
                          members: [
                            uuid0,
                            uuid1,
                          ],
                        }
                        return cmiHelper.createCallPickup(token, customer.callOptions.cmiCustomer.uuid, pickupBody)
                          .then(() => {
                            console.log(`Successfully added call pickup ${customer.name}!`);
                          })
                      })
                  })
              })
          })
      })
  }
}

export function setupCallPark(customer) {
  if ((customer.doCallPark && (customer.users.length >= 2)) || customer.doAllFeatures) {
    var promises = [];
    var userMembers = [];

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

export function setupCallPaging(customer) {
  if (customer.doCallPaging || customer.doAllFeatures) {
    const callPagingName = 'Death Star'
    const userName = customer.users[0].name.givenName
    const placeName = customer.places[0].name
    let userToAdd = {}
    let placeToAdd = {}
    const initiator = 'CUSTOM'
    let setExtension = (parseInt(customer.callOptions.numberRange.beginNumber) + 75).toString()
    return provisionerHelper.getToken(customer.partner)
      .then(token => {
        return cmiHelper.getUserUUID(token, customer.callOptions.cmiCustomer.uuid, userName)
          .then(response => {
            userToAdd.uuid = response.members[0].uuid;
            userToAdd.type = 'USER';
            return cmiHelper.getPlaceUUID(token, customer.callOptions.cmiCustomer.uuid, placeName)
              .then(response => {
                placeToAdd.uuid = response.places[0].uuid;
                placeToAdd.type = 'PLACE';
                var pagingBody = {
                  name: callPagingName,
                  extension: setExtension,
                  initiatorType: initiator,
                  initiators: [{
                    initiatorId: userToAdd.uuid,
                    type: userToAdd.type,
                  }, {
                    initiatorId: placeToAdd.uuid,
                    type: placeToAdd.type,
                  }],
                  members: [{
                    memberId: userToAdd.uuid,
                    type: userToAdd.type,
                  }, {
                    memberId: placeToAdd.uuid,
                    type: placeToAdd.type,
                  }],
                }
                return cmiHelper.createCallPaging(token, customer.callOptions.cmiCustomer.uuid, pagingBody)
                  .then(() => {
                    console.log(`Successfully added call paging group for ${customer.name}`);
                  })
              })
          })
      })
  }
}
