'use strict';

describe('Controller: ExpresswayServiceClusterController', function () {


  var controller, $controller, $scope, $q, clusterServiceMock, fusionClusterServiceMock;

  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initController);


  function dependencies($rootScope, _$controller_, _$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
  }

  function initController() {

    jasmine.getJSONFixtures().clearCache(); // See https://github.com/velesin/jasmine-jquery/issues/239
    var twoClusters = getJSONFixture('hercules/expressway-clusters-with-calendar-and-management.json');
    var twoClustersDuringUpgrade = getJSONFixture('hercules/expressway-clusters-with-calendar-and-management-during-upgrade.json');

    var changing = sinon.stub();
    changing.onCall(0).returns(twoClusters);
    changing.returns(twoClustersDuringUpgrade);

    clusterServiceMock = {
      getClusterWithManagement: changing
    };

    fusionClusterServiceMock = {
      get: sinon.stub().returns($q.resolve({
        upgradeSchedule: {
          scheduleTimeZone: 'Europe: Magdeburg'
        }
      })),
      buildSidepanelConnectorList: sinon.stub().returns(),
      formatTimeAndDate: sinon.stub().returns()
    };

    controller = $controller('ExpresswayServiceClusterController', {
      $scope: $scope,
      hasF237FeatureToggle: true,
      ClusterService: clusterServiceMock,
      FusionClusterService: fusionClusterServiceMock,
      $stateParams: {
        connectorType: 'c_cal',
        clusterId: '12345678-abcd'
      }
    });
    $scope.$apply();
  }

  it('should find tvasset-ex.rd.cisco.com to be the upgrading management connector hostname', function () {
    expect(controller.managementUpgradeDetails.upgradingHostname).toBe('tvasset-ex.rd.cisco.com');
  });

  it('should not have calendar connector upgrade details, because calendar connector is not upgrading', function () {
    expect(controller.upgradeDetails).toBe(undefined);
  });

  it('should *not* show an upgrade warning for a healthy cluster', function () {
    expect(controller.softwareUpgrade.showUpgradeWarning()).toBe(false);
  });

  it('should show an upgrade warning when there is a management connector upgrade available, and there are offline hosts', function () {
    controller.softwareUpgrade.hasManagementUpgradeWarning = true;
    expect(controller.softwareUpgrade.showUpgradeWarning()).toBe(true);
  });

});
