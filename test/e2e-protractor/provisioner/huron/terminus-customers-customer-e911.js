const CARRIER_ID = '565885e5-73d1-45ff-9f5a-e630e3607691';
//const CARRIER_NAME = 'WEBEX_BTS_INTELEPEER_SWIVEL_PSTN';

export class PstnCustomerE911Signee {
  constructor(obj = {
    firstName: undefined,
    lastName: undefined,
    email: undefined,
    name: undefined,
    pstnCarrierId: undefined,
    trial: true,
    e911Signee: undefined,
  }) {
    this.firstName = obj.firstName || [];
    this.lastName = obj.lastName || 'prov_test';
    this.email = obj.email;
    this.name = obj.name;
    this.pstnCarrierId = obj.pstnCarrierId || CARRIER_ID;
    this.e911Signee = obj.e911Signee;
  }
}
