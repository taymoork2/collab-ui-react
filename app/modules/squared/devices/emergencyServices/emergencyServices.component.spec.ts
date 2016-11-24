describe('component: emergencyServices', () => {
  const EMERGENCYNUMBER_SELECT = '.csSelect-container[name="emergencyCallbackNumber"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';

  beforeEach(function() {
    this.initModules('Huron');
    this.injectDependencies('$q', 'EmergencyServicesService', '$httpBackend');

    this.$httpBackend.whenGET('modules/huron/pstnSetup/states.json').respond([{
      name: 'Texas',
      abbreviation: 'TX',
    }]);

    spyOn(this.EmergencyServicesService, 'getOptions').and
    .returnValue(this.$q.when(['1', '2']));

    spyOn(this.EmergencyServicesService, 'getCompanyECN').and
    .returnValue(this.$q.when('1'));

    spyOn(this.EmergencyServicesService, 'getImpactedUsers').and
    .returnValue(this.$q.when([]));

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
    .returnValue(this.$q.when({
      e911Address: {

      },
      status: 'PENDING',
    }));
    this.compileComponent('ucEmergencyServices');
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
});
