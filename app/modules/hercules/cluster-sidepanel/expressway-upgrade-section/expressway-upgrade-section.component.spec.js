'use strict';

describe('Controller: ExpresswayServiceClusterController', function () {
  beforeEach(function () {
    this.initModules('Hercules', 'Squared');
    this.injectDependencies(
      '$componentController',
      '$scope',
      '$q',
      'ClusterService',
      'FeatureToggleService'
    );

    var calendarCluster = getJSONFixture('hercules/expressway-cluster-with-calendar.json');
    var managementCluster = getJSONFixture('hercules/expressway-clusters-with-management-upgrade.json');

    spyOn(this.ClusterService, 'getCluster').and.returnValues(_.cloneDeep(calendarCluster), _.cloneDeep(managementCluster), _.cloneDeep(calendarCluster), _.cloneDeep(managementCluster));

    this.initController = function () {
      this.controller = this.$componentController('expresswayUpgradeSection', {
        $scope: this.$scope,
        ClusterService: this.ClusterService,
      }, {
        clusterId: '12345678-abcd',
        connectorType: 'c_mgmt',
      });
      this.controller.$onInit();
      this.$scope.$apply();
    };
  });

  it('should find tvasset-ex.rd.cisco.com to be the upgrading management connector hostname', function () {
    this.initController();
    expect(this.controller.managementUpgradeDetails.upgradingHostname).toBe('tvasset-ex.rd.cisco.com');
  });

  it('should not have calendar connector upgrade details, because calendar connector is not upgrading', function () {
    this.initController();
    expect(this.controller.upgradeDetails).toBe(undefined);
  });

  it('should *not* show an upgrade warning for a healthy cluster', function () {
    this.initController();
    expect(this.controller.softwareUpgrade.showUpgradeWarning()).toBe(false);
  });

  it('should show an upgrade warning when there is a management connector upgrade available, and there are offline hosts', function () {
    this.initController();
    this.controller.softwareUpgrade.hasManagementUpgradeWarning = true;
    expect(this.controller.softwareUpgrade.showUpgradeWarning()).toBe(true);
  });
});
