import moduleName from './index';

describe('HelpDeskHybridServicesOrgCardComponentCtrl', () => {

  let $componentController, $scope, $q, CloudConnectorService, LicenseService, HybridServicesClusterService, ServiceDescriptorService, ctrl;

  beforeEach(function () {
    this.initModules(moduleName);
  });

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(getJSONFixture('hercules/fusion-cluster-service-test-clusters.json')));
    spyOn(CloudConnectorService, 'getService');
    spyOn(LicenseService, 'orgIsEntitledTo').and.callThrough();
    spyOn(ServiceDescriptorService, 'getServices');
  }

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, $rootScope, _$q_, _CloudConnectorService_, _HybridServicesClusterService_, _LicenseService_, _ServiceDescriptorService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    CloudConnectorService = _CloudConnectorService_;
    LicenseService = _LicenseService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function cleanup() {
    $componentController = $scope = $q = ctrl = CloudConnectorService = LicenseService = ServiceDescriptorService = HybridServicesClusterService = undefined;
  }

  function initController(org) {
    return $componentController('helpDeskHybridServicesOrgCard', {}, {
      org: org,
    });
  }

  it('should return correct hybrid service card for org with only Expressway-based calendar setup', () => {

    const calendarOrg = {
      id: '1234-5678',
      services: ['squared-fusion-cal'],
    };

    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{ enabled: true, id: 'squared-fusion-cal' }]));
    CloudConnectorService.getService.and.returnValues($q.resolve({ serviceId: 'squared-fusion-o365', setup: false }));

    ctrl = initController(calendarOrg);
    ctrl.$onInit();
    $scope.$apply();

    const card = _.find(ctrl.hybridServicesCard.services, (service: any) => service.serviceId === 'squared-fusion-cal');
    expect(ctrl.hybridServicesCard.entitled).toBe(true);
    expect(card.setup).toBe(true);
    expect(card.cssClass).toBe('success');
  });

  it('should return correct for org with only Exchange-based calendar setup, but with entitlements for hybrid call and media as well', () => {

    const calendarOrg = {
      id: '1234-5678',
      services: ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media'],
    };

    CloudConnectorService.getService.and.returnValue($q.reject({}));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{ enabled: true, id: 'squared-fusion-cal' }]));

    ctrl = initController(calendarOrg);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(ctrl.hybridServicesCard.services.length).toEqual(1);

    expect(ctrl.hybridServicesCard.services[0].serviceId).toEqual('squared-fusion-cal');
    expect(ctrl.hybridServicesCard.services[0].status).toEqual('operational');
    expect(ctrl.hybridServicesCard.services[0].setup).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[0].cssClass).toEqual('success');

  });

  it('should return correct hybrid service card when google calendar is enabled', () => {
    const org = {
      services: ['squared-fusion-mgmt', 'squared-fusion-gcal'],
    };
    CloudConnectorService.getService.and.returnValue($q.resolve({ serviceId: 'squared-fusion-gcal', setup: true, status: 'OK', cssClass: 'success' }));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([]));
    ctrl = initController(org);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(ctrl.hybridServicesCard.services.length).toBe(1);

    expect(ctrl.hybridServicesCard.services[0].serviceId).toEqual('squared-fusion-gcal');
    expect(ctrl.hybridServicesCard.services[0].status).toEqual('OK');
    expect(ctrl.hybridServicesCard.services[0].setup).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[0].cssClass).toEqual('success');
  });

  it('should show ccc-based Office 365, also when Expressway-based calendar is not enabled', () => {
    const org = {
      services: ['squared-fusion-mgmt', 'squared-fusion-cal'],
    };
    CloudConnectorService.getService.and.returnValue($q.resolve({ serviceId: 'squared-fusion-o365', setup: true, status: 'OK', cssClass: 'success' }));
    ServiceDescriptorService.getServices.and.returnValue($q.resolve([]));
    ctrl = initController(org);
    ctrl.$onInit();
    $scope.$apply();

    const card = _.find(ctrl.hybridServicesCard.services, (service: any) => service.serviceId === 'squared-fusion-o365');

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(card.serviceId).toEqual('squared-fusion-o365');
    expect(card.status).toEqual('OK');
    expect(card.setup).toBeTruthy();
    expect(card.cssClass).toEqual('success');
  });

  it('should get and display Hybrid IM and Presence status if the organization is entitled', () => {
    const org = {
      services: ['squared-fusion-mgmt', 'spark-hybrid-impinterop'],
    };

    ServiceDescriptorService.getServices.and.returnValue($q.resolve([{ enabled: true, id: 'spark-hybrid-impinterop' }]));

    ctrl = initController(org);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(ctrl.hybridServicesCard.services.length).toBe(1);

    expect(ctrl.hybridServicesCard.services[0].serviceId).toEqual('spark-hybrid-impinterop');
    expect(ctrl.hybridServicesCard.services[0].status).toEqual('setupNotComplete');
    expect(ctrl.hybridServicesCard.services[0].setup).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[0].cssClass).toEqual('disabled');

  });

});
