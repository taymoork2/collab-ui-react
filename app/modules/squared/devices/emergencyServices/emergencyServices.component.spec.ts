describe('component: emergencyServices', () => {
  const EMERGENCYNUMBER_SELECT = '.csSelect-container[name="emergencyCallbackNumber"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';

  beforeEach(function() {
    this.initModules('Huron');
    this.injectDependencies('$q', 'EmergencyServicesService', '$httpBackend');

    this.$httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});

    spyOn(this.EmergencyServicesService, 'getOptions').and
    .returnValue(this.$q.resolve(['1', '2']));

    spyOn(this.EmergencyServicesService, 'getCompanyECN').and
    .returnValue(this.$q.resolve('1'));

    spyOn(this.EmergencyServicesService, 'getImpactedUsers').and
    .returnValue(this.$q.resolve([]));

    spyOn(this.EmergencyServicesService, 'getInitialData').and
    .returnValue({
      emergency: {
        emergencyNumber: '1',
        emergencyAddress: {

        },
      },
      currentDevice: {
        cisUuid: '12345',
      },
      status: 'ACTIVE',
      stateOptions: [{ abbreviation: 'TX', name: 'Texas' }],
    });

    spyOn(this.EmergencyServicesService, 'getAddressForNumber').and
    .returnValue(this.$q.resolve({
      e911Address: {

      },
      status: 'PENDING',
    }));

    this.compileComponent('ucEmergencyServices');
    spyOn(this.controller, 'validateAddress').and.returnValue(undefined);
    spyOn(this.controller, 'saveAddress').and.returnValue(undefined);
  });

  it('should instantiate emergencyServices', function() {
    expect(this.view.find(EMERGENCYNUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('1');
    expect(this.view.find(EMERGENCYNUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('2');
  });

  it('should call for address if number is changed', function() {
    this.view.find(EMERGENCYNUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1).click();

    expect(this.EmergencyServicesService.getAddressForNumber).toHaveBeenCalled();
    this.controller.resetSettings();
    expect(this.controller.emergency).toBe(undefined);
  });

  it('should validate and saveAddress', function() {
    this.controller.validateAndSaveAddress();
    expect(this.controller.validateAddress).toHaveBeenCalled();
    expect(this.controller.saveAddress).not.toHaveBeenCalled();

    this.controller.addressFound = true;
    this.controller.validateAndSaveAddress();
    expect(this.controller.saveAddress).toHaveBeenCalled();
  });
});
