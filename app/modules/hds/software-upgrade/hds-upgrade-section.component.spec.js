'use strict';

describe('Component: hdsUpgradeSection', function () {
  var controller, $componentController, $scope, $rootScope, $modal,
    mockCluster, mockUpgradingCluster, ClusterService;

  beforeEach(angular.mock.module('HDS'));
  beforeEach(inject(dependencies));
  beforeEach(initData);


  function dependencies(_$rootScope_, _$componentController_, _ClusterService_, _$modal_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $componentController = _$componentController_;
    ClusterService = _ClusterService_;
    $modal = _$modal_;
  }

  function initData() {
    jasmine.getJSONFixtures().clearCache();
    mockCluster = getJSONFixture('hds/hds-cluster.json');
    mockUpgradingCluster = getJSONFixture('hds/hds-upgrading-cluster.json');
  }

  function initControllerAndSpies(cluster) {
    spyOn(ClusterService, 'getCluster').and.returnValue(cluster);
    controller = $componentController('hdsUpgradeSection', {
      $scope: $scope,
      ClusterService: ClusterService,
    });
    controller.$onInit();
    $scope.$apply();
  }


  it('Check if values had been properly initialized for cluster with no upgrades avaialble.', function () {
    initControllerAndSpies(mockCluster);
    expect(controller).toBeDefined();
    expect(ClusterService).toBeDefined();
    expect(ClusterService.getCluster).toHaveBeenCalled();
    expect(controller.cluster).toEqual(mockCluster);
    expect(controller.upgradeDetails).toBeUndefined();
    expect(controller.softwareUpgrade).toBeDefined();
    expect(controller.softwareUpgrade.provisionedVersion).toBe('2017.4.20.66');
    expect(controller.softwareUpgrade.availableVersion).toBe('2017.4.20.66');
    expect(controller.softwareUpgrade.isUpgradeAvailable).toBe(false);
    expect(controller.softwareUpgrade.hasUpgradeWarning).toBe(false);
    expect(controller.softwareUpgrade.numberOfHosts).toBe(1);
    expect(controller.softwareUpgrade.clusterStatus).toBe('running');
    expect(controller.softwareUpgrade.showUpgradeWarning()).toBe(false);
    expect(controller.showUpgradeProgress).toBeUndefined();
  });


  it('Check if required values are defined in HDSUpgradeSectionCtrl for upgrading cluster', function () {
    initControllerAndSpies(mockUpgradingCluster);
    expect(controller).toBeDefined();
    expect(ClusterService).toBeDefined();
    expect(ClusterService.getCluster).toHaveBeenCalled();
    expect(controller.cluster).toEqual(mockUpgradingCluster);
    expect(controller.softwareUpgrade).toBeDefined();
    expect(controller.softwareUpgrade.provisionedVersion).toBe('2017.4.20.66');
    expect(controller.softwareUpgrade.availableVersion).toBe('2017.4.20.67');
    expect(controller.softwareUpgrade.isUpgradeAvailable).toBe(true);
    expect(controller.softwareUpgrade.hasUpgradeWarning).toBe(true);
    expect(controller.softwareUpgrade.numberOfHosts).toBe(1);
    expect(controller.softwareUpgrade.clusterStatus).toBe('running');
    expect(controller.softwareUpgrade.showUpgradeWarning()).toBe(true);
    expect(controller.upgradeDetails).toBeDefined();
    expect(controller.upgradeDetails.numberOfUpsmthngHosts).toBe(1);
    expect(controller.upgradeDetails.upgradingHostname).toBe('hds-test1.cisco.com');
    expect(controller.showUpgradeProgress).toBe(true);
  });


  it('Should open the correct modal window when showUpgradeNowDialog() is called', function () {
    initControllerAndSpies(mockUpgradingCluster);
    expect(controller).toBeDefined();
    spyOn($modal, 'open').and.returnValue({
      result: {
        then: function () {
        },
      },
    });
    var correctShowUpgradeNowDialogOptions = {
      controller: 'HDSUpgradeNowController',
      controllerAs: 'hdsUpgradeNowController',
      templateUrl: 'modules/hds/software-upgrade/hds-upgrade-now-cluster-dialog.html',
    };
    controller.showUpgradeNowDialog();
    expect($modal.open).toHaveBeenCalledWith(jasmine.objectContaining(correctShowUpgradeNowDialogOptions));
  });
});
