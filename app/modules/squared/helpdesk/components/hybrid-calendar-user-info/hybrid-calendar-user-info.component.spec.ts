import componentName from './index';

describe('Component: HelpDeskHybridCalendarUserInfoComponent ', () => {

  let $componentController, $q, $scope, HybridServicesClusterService;

  beforeEach(function () {
    this.initModules(componentName);
  });

  beforeEach(inject((_$componentController_, _$q_, _$rootScope_, _HybridServicesClusterService_) => {
    $componentController = _$componentController_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    HybridServicesClusterService = _HybridServicesClusterService_;
  }));

  beforeEach(function () {
    spyOn(HybridServicesClusterService, 'getHomedClusternameAndHostname');
  });

  afterEach(function () {
    $componentController = $q = $scope = HybridServicesClusterService = undefined;
  });

  function initController(user?, status?) {
    const ctrl = $componentController('helpDeskHybridCalendarUserInfo', {}, {});
    ctrl.$onChanges({
      user: {
        previousValue: undefined,
        currentValue: user || { some: 'thing' },
        isFirstChange() {
          return true;
        },
      },
      status: {
        previousValue: undefined,
        currentValue: status || { some: 'thing' },
        isFirstChange() {
          return true;
        },
      },
    });
    $scope.$apply();
    return ctrl;
  }

  it('should get the cluster and node names from FMS if the user is not owned by the CCC', () => {

    const expectedHostName = 'something';
    const expectedClusterName = 'something else';
    const connectorId = '1234@foobar';
    HybridServicesClusterService.getHomedClusternameAndHostname.and.returnValue($q.resolve({
      hostname: expectedHostName,
      clustername: expectedClusterName,
    }));
    const status = {
      owner: 'das',
      connectorId: connectorId,
    };

    const ctrl = initController(undefined, status);
    expect(HybridServicesClusterService.getHomedClusternameAndHostname.calls.count()).toBe(1);
    expect(HybridServicesClusterService.getHomedClusternameAndHostname).toHaveBeenCalledWith(connectorId);
    expect(ctrl.clusterName).toBe(expectedClusterName);
    expect(ctrl.hostName).toBe(expectedHostName);
  });

  it('should not try to get a cluster name and hostname if the user is owned by the CCC', () => {
    const status = {
      owner: 'ccc',
      connectorId: 'something',
    };

    const ctrl = initController(undefined, status);
    expect(HybridServicesClusterService.getHomedClusternameAndHostname).not.toHaveBeenCalled();
    expect(ctrl.clusterName).toBe('common.ciscoCollaborationCloud');
    expect(ctrl.hostName).not.toBeDefined();
  });

  it('should parse the preferred webex site from the user object', () => {
    const expectedWebExSite = 'something';
    const user = {
      userPreferences: [`"calSvcPreferredWebexSite":"${expectedWebExSite}"`],
    };

    const ctrl = initController(user);
    expect(ctrl.preferredWebExSite).toBe(expectedWebExSite);
  });

});
