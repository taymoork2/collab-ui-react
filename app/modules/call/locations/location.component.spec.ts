import callLocation from './index';
import {
  LocationSettingsOptions, CallLocationSettingsData,
} from './shared';
import { SWIVEL } from 'modules/huron/pstn';

//Test Data
const customer = getJSONFixture('huron/json/pstnSetup/customer.json');
const carrier = getJSONFixture('huron/json/pstnSetup/carrierIntelepeer.json');
let ftsw: boolean;
let provider;
let locationSettingsOptions: LocationSettingsOptions;
let callLocationSettingsData: CallLocationSettingsData;

//Tests
describe('Component: CallLocationComponent', () => {
  beforeEach(function() {
    this.initModules(callLocation);
    this.injectDependencies(
      '$q',
      '$scope',
      'PstnModel',
      'Authinfo',
      'PstnService',
      'LocationSettingsOptionsService',
      'CallLocationSettingsService',
    );
    setTestData.bind(this)();

    spyOn(this.Authinfo, 'getOrgId').and.returnValue(customer.uuid);
    spyOn(this.PstnService, 'getCustomerV2').and.returnValue(this.$q.resolve());
    spyOn(this.LocationSettingsOptionsService, 'getOptions').and.returnValue(this.$q.resolve(locationSettingsOptions));
    spyOn(this.CallLocationSettingsService, 'get').and.returnValue(this.$q.resolve(callLocationSettingsData));
  });

  function setTestData() {
    ftsw = false;
    provider = _.cloneDeep(carrier);
    this.PstnModel.setProvider(provider);
    locationSettingsOptions = new LocationSettingsOptions();
    callLocationSettingsData = new CallLocationSettingsData();
  }

  function compileComponent() {
    this.compileComponent('ucCallLocation', {
      ftsw: ftsw,
      uuid: '123456',
      name: customer.name,
    });
  }

  describe('initialize as FTSW -', () => {
    beforeEach(function() {
      ftsw = true;
    });
    beforeEach(compileComponent);
    it('should create component', function () {
      expect(this.controller).toExist();
    });
  });

  describe('initialize as NOT FTSW -', () => {
    beforeEach(compileComponent);
    it('should create component', function () {
      expect(this.controller).toExist();
    });
  });

  describe('PSTN API Type', () => {
    beforeEach(compileComponent);
    it('should show Emergency Service: PSTN = INTELEPEER', function () {
      expect(this.controller.showES()).toEqual(true);
    });

    it('should NOT show Emergency Service: PSTN = SWIVEL', function () {
      this.PstnModel.getProvider().apiImplementation = SWIVEL;
      expect(this.controller.showES()).toEqual(false);
    });
  });
});
