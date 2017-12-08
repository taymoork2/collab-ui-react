import moduleName from './index';

describe('HelpDeskHybridServicesOrgCardComponentCtrl', () => {

  let $componentController, $scope, $q, CloudConnectorService, LicenseService, HybridServicesClusterService, ctrl;

  beforeEach(function () {
    this.initModules(moduleName);
  });

  function initSpies() {
    spyOn(HybridServicesClusterService, 'getAll').and.returnValue($q.resolve(getJSONFixture('hercules/fusion-cluster-service-test-clusters.json')));
    spyOn(HybridServicesClusterService, 'getStatusForService');
    spyOn(CloudConnectorService, 'getService');
    spyOn(LicenseService, 'orgIsEntitledTo').and.callThrough();
  }

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies (_$componentController_, $rootScope, _$q_, _CloudConnectorService_, _HybridServicesClusterService_, _LicenseService_) {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = $rootScope.$new();
    CloudConnectorService = _CloudConnectorService_;
    LicenseService = _LicenseService_;
    HybridServicesClusterService = _HybridServicesClusterService_;
  }

  function cleanup() {
    $componentController = $scope = $q = ctrl = CloudConnectorService = LicenseService = HybridServicesClusterService = undefined;
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

    HybridServicesClusterService.getStatusForService.and.returnValue({
      setup: true,
      serviceId: 'squared-fusion-cal',
      status: 'operational',
      cssClass: 'success',
    });
    CloudConnectorService.getService.and.returnValues($q.resolve({ serviceId: 'squared-fusion-o365', setup: false }));

    ctrl = initController(calendarOrg);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBe(true);
    expect(ctrl.hybridServicesCard.services[0].serviceId).toBe('squared-fusion-cal');
    expect(ctrl.hybridServicesCard.services[0].cssClass).toBe('success');
  });

  it('should return correct for org with only Exchange-based calendar setup, but with entitlements for hybrid call and media as well', () => {

    const calendarOrg = {
      id: '1234-5678',
      services: ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-media'],
    };

    HybridServicesClusterService.getStatusForService.and.callFake((serviceId) => {
      if (serviceId === 'squared-fusion-cal') {
        return {
          setup: true,
          serviceId: 'squared-fusion-cal',
          status: 'operational',
          cssClass: 'success',
        };
      } else {
        return {
          setup: false,
          serviceId: serviceId,
          status: 'setupNotComplete',
          cssClass: 'disabled',
        };
      }
    });
    CloudConnectorService.getService.and.returnValue($q.reject({}));

    ctrl = initController(calendarOrg);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(ctrl.hybridServicesCard.services.length).toEqual(3);

    expect(ctrl.hybridServicesCard.services[0].serviceId).toEqual('squared-fusion-cal');
    expect(ctrl.hybridServicesCard.services[0].status).toEqual('operational');
    expect(ctrl.hybridServicesCard.services[0].setup).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[0].cssClass).toEqual('success');

    expect(ctrl.hybridServicesCard.services[1].serviceId).toEqual('squared-fusion-uc');
    expect(ctrl.hybridServicesCard.services[1].status).toEqual('setupNotComplete');
    expect(ctrl.hybridServicesCard.services[1].setup).toBeFalsy();
    expect(ctrl.hybridServicesCard.services[1].cssClass).toEqual('disabled');

    expect(ctrl.hybridServicesCard.services[2].serviceId).toEqual('squared-fusion-media');
    expect(ctrl.hybridServicesCard.services[2].status).toEqual('setupNotComplete');
    expect(ctrl.hybridServicesCard.services[2].setup).toBeFalsy();
    expect(ctrl.hybridServicesCard.services[2].cssClass).toEqual('disabled');

  });

  it('should return correct hybrid service card when google calendar is enabled', () => {
    const org = {
      services: ['squared-fusion-mgmt', 'squared-fusion-gcal'],
    };
    CloudConnectorService.getService.and.returnValue($q.resolve({ serviceId: 'squared-fusion-gcal', setup: true, status: 'OK', cssClass: 'success' }));
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
    HybridServicesClusterService.getStatusForService.and.returnValue({
      setup: false,
      serviceId: 'squared-fusion-cal',
      cssClass: 'disabled',
    });
    CloudConnectorService.getService.and.returnValue($q.resolve({ serviceId: 'squared-fusion-o365', setup: true, status: 'OK', cssClass: 'success' }));
    ctrl = initController(org);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[0].setup).toBeFalsy();
    expect(ctrl.hybridServicesCard.services[1].serviceId).toEqual('squared-fusion-o365');
    expect(ctrl.hybridServicesCard.services[1].status).toEqual('OK');
    expect(ctrl.hybridServicesCard.services[1].setup).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[1].cssClass).toEqual('success');
  });

  it('should get and display Hybrid IM and Presence status if the organization is entitled', () => {
    const org = {
      services: ['squared-fusion-mgmt', 'spark-hybrid-impinterop'],
    };

    HybridServicesClusterService.getStatusForService.and.callFake((serviceId) => {
      if (serviceId === 'spark-hybrid-impinterop') {
        return {
          setup: true,
          serviceId: 'spark-hybrid-impinterop',
          status: 'operational',
          cssClass: 'success',
        };
      } else {
        return {
          setup: false,
          serviceId: serviceId,
          status: 'setupNotComplete',
          cssClass: 'disabled',
        };
      }
    });

    ctrl = initController(org);
    ctrl.$onInit();
    $scope.$apply();

    expect(ctrl.hybridServicesCard.entitled).toBeTruthy();
    expect(ctrl.hybridServicesCard.services.length).toBe(1);

    expect(ctrl.hybridServicesCard.services[0].serviceId).toEqual('spark-hybrid-impinterop');
    expect(ctrl.hybridServicesCard.services[0].status).toEqual('operational');
    expect(ctrl.hybridServicesCard.services[0].setup).toBeTruthy();
    expect(ctrl.hybridServicesCard.services[0].cssClass).toEqual('success');

  });

});
