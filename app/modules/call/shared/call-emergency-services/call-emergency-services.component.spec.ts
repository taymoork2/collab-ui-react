import callEmergencyServicesComponent from './index';
import {
  Address, PstnCarrier,
} from 'modules/huron/pstn';
import { IOption } from 'modules/huron/dialing';

//Test Data
const customer = getJSONFixture('huron/json/pstnSetup/customer.json');
let ecbn: IOption | null;
let numberOptions: IOption[] | null;
let pstnCarriers: PstnCarrier[];
let eba: Address;
let testRequired = true;
let testPstnSetup = true;
let testAllowEcbn = true;

//Tests
describe('Component: CallEmergencyServicesComponent -', () => {
  beforeEach(function() {
    this.initModules(callEmergencyServicesComponent);
    this.injectDependencies(
      '$q',
      '$scope',
      'PstnModel',
      'PstnService',
      'PstnAddressService',
      'Notification',
      'NumberService',
      'PhoneNumberService',
    );

    this.$scope.ecbnChangeFn = jasmine.createSpy('ecbnChangeFn');
    spyOn(this.PstnService, 'listCustomerCarriers').and.returnValue(this.$q.resolve(pstnCarriers));
    createTestData();
    this.PstnModel.setCustomerId(customer.uuid);
  });

  function createTestData() {
    testRequired = true;
    testPstnSetup = true;
    testAllowEcbn = true;

    ecbn = {
      label: '1212',
      value: '+14095551212',
    };

    numberOptions = [
      _.cloneDeep(ecbn),
      {
        label: '2121',
        value: '+14095552121',
      },
      {
        label: '1313',
        value: '+14095551313',
      },
    ];

    eba = new Address();
    eba.streetAddress = '123 Street';
    eba.city = 'city';
    eba.state = 'state';
    eba.zip = '77101';

    pstnCarriers = [];
    pstnCarriers.push(new PstnCarrier());
    pstnCarriers[0].name = 'Test Carrier 1';
    pstnCarriers[0].title = pstnCarriers[0].name;
  }

  function initComponent() {
    this.compileComponent('ucCallEmergencyServices', {
      number: ecbn,
      numberOptions: numberOptions,
      address: eba,
      required: testRequired,
      isPstnSetup: testPstnSetup,
      allowEcbnSetup: testAllowEcbn,
      ecbnChangeFn: this.$scope.ecbnChangeFn,
    });
  }

  describe('Initialize', () => {
    beforeEach(initComponent);

    it('should create controller', function() {
      expect(this.controller).toExist();
    });

    it('should show ESA setup', function () {
      expect(this.controller.showES()).toEqual(true);
    });

    it('should not show messages', function () {
      expect(this.controller.showNumberMessage()).toEqual(false);
    });
  });

  describe('No PSTN', () => {
    beforeEach(function () {
      this.PstnModel.setCustomerId('');
      testPstnSetup = false;
    });
    beforeEach(initComponent);

    it('should show PSTN warning', function() {
      expect(this.controller.showES()).toEqual(false);
    });
  });

  describe('No Number w/ optons', () => {
    beforeEach(function () {
      ecbn = null;
    });
    beforeEach(initComponent);

    it('should show number messages', function() {
      expect(this.controller.showNumberMessage()).toEqual(true);
    });

    it('should show \"NOT SELECTED\" message', function() {
      expect(this.controller.stateECBN).toEqual(this.controller.ECBN_NOT_SELECTED);
    });
  });

  describe('No Number w/o optons', () => {
    beforeEach(function () {
      ecbn = null;
      numberOptions = null;
    });
    beforeEach(initComponent);

    it('should show number messages', function() {
      expect(this.controller.showNumberMessage()).toEqual(true);
    });

    it('should show \"NO NUMBERS\" message', function() {
      expect(this.controller.stateECBN).toEqual(this.controller.ECBN_NO_NUMBERS);
    });
  });

  describe('Number w/o optons', () => {
    beforeEach(function () {
      numberOptions = [];
    });
    beforeEach(initComponent);

    it('should show number messages', function() {
      expect(this.controller.showNumberMessage()).toEqual(true);
    });

    it('should show \"NUMBER UNASSIGNED\" message', function() {
      expect(this.controller.stateECBN).toEqual(this.controller.ECBN_MISSING_ASSIGN);
    });
  });

  describe('Number w/ no matching optons', () => {
    beforeEach(function () {
      if (numberOptions) {
        numberOptions[0].label = '1515';
        numberOptions[0].value = '+14095551515';
      }
    });
    beforeEach(initComponent);

    it('should show number messages', function() {
      expect(this.controller.showNumberMessage()).toEqual(true);
    });

    it('should show \"NUMBER UNASSIGNED\" message', function() {
      expect(this.controller.stateECBN).toEqual(this.controller.ECBN_MISSING_ASSIGN);
    });
  });
});
