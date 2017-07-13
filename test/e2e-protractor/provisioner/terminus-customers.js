const CARRIER_ID = '565885e5-73d1-45ff-9f5a-e630e3607691';
//const CARRIER_NAME = 'WEBEX_BTS_INTELEPEER_SWIVEL_PSTN';

export class PstnCustomer {
  constructor(obj = {
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    name: undefined,
    pstnCarrierId: undefined,
    resellerId: undefined,
    trial: true,
    uuid: undefined,
  }) {
    this.firstName = obj.firstName || [];
    this.lastName = obj.lastName || 'prov_test';
    this.email = obj.email;
    this.name = obj.name;
    this.pstnCarrierId = obj.pstnCarrierId || CARRIER_ID;
    this.resellerId = obj.resellerId;
    this.uuid = obj.uuid;
  }
}
