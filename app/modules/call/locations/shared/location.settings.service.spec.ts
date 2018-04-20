import CallLocationSettingsService from './index';

describe('Service: CallLocationSettingsService', () => {
  beforeEach(function() {
    this.initModules(CallLocationSettingsService);
    this.injectDependencies(
        '$q',
        '$rootScope',
        'LocationsService',
        'PstnModel',
        'PstnAddressService',
        'MediaOnHoldService',
        'LocationCosService',
        'InternalNumberRangeService',
        'HuronCustomerService',
        'ExtensionLengthService',
        'AvrilService',
        'SettingSetupInitService',
        'CallLocationSettingsService',
    );
    spyOn(this.CallLocationSettingsService, 'getLocation').and.returnValue(this.$q.resolve());
    spyOn(this.CallLocationSettingsService, 'getEmergencyCallbackNumber').and.returnValue(this.$q.resolve());
    spyOn(this.CallLocationSettingsService, 'getLocationMedia').and.returnValue(this.$q.resolve());
    spyOn(this.CallLocationSettingsService, 'getEmergencyServiceAddress').and.returnValue(this.$q.resolve({ uuid: '12345' }));
    spyOn(this.CallLocationSettingsService, 'getInternalNumberRanges').and.returnValue(this.$q.resolve());
    spyOn(this.CallLocationSettingsService, 'getCosRestrictions').and.returnValue(this.$q.resolve());
    spyOn(this.CallLocationSettingsService, 'getCustomerVoice').and.returnValue(this.$q.resolve());
    spyOn(this.CallLocationSettingsService, 'getCustomer').and.returnValue(this.$q.resolve({ hasVoicemailService: false }));
    spyOn(this.CallLocationSettingsService, 'getAvrilCustomer').and.returnValue(this.$q.resolve());
    spyOn(this.LocationsService, 'getDefaultLocation').and.returnValue(this.$q.resolve({ uuid: '123' }));
  });

  it('should return empty address on new location', function (done) {
    this.CallLocationSettingsService.get(undefined, true).then((response) => {
      expect(response.address.uuid).toBe(undefined);
      done();
    });
    this.$rootScope.$apply();
  });

  it('should return default address', function (done) {
    this.CallLocationSettingsService.get().then((response) => {
      expect(response.address.uuid).toEqual('12345');
      done();
    });
    this.$rootScope.$apply();
  });
});
