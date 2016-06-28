'use strict';

describe('Component: upgradeScheduleConfiguration', function() {
  var component, Authinfo, $scope, $q, $compile, FusionClusterService;

  beforeEach(module('Hercules'));
  beforeEach(module(function($compileProvider) {
    // mock <cs-select>
    $compileProvider.directive('csSelect', function() {
      return {
        template: '<cs-select-mock></cs-select-mock>',
        // priority has to be higher than the "original" directive
        priority: 10,
        // stop there and don't try to match with another directive
        terminal: true,
        replace: true
      };
    });
  }));
  beforeEach(inject(dependencies));

  var upgradeScheduleMock = {
    scheduleDays: ['3'],
    scheduleTime: '05:00',
    scheduleTimeZone: 'Pacific/Tahiti',
    nextUpgradeWindow: {
      startTime: '2016-06-29T15:00:57.332Z',
      endTime: '2016-06-29T16:00:57.332Z'
    },
    acknowledged: true,
    moratoria: [{
      timeWindow: {
        startTime: '2016-06-29T15:00:35Z',
        endTime: '2016-06-29T16:00:35Z'
      },
      id: 'deadbeef'
    }]
  };

  function dependencies($rootScope, _$q_, _$compile_, _Authinfo_, _FusionClusterService_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    FusionClusterService = _FusionClusterService_;
    spyOn(FusionClusterService, 'getUpgradeSchedule').and.returnValue($q.resolve(upgradeScheduleMock));
  }

  function compileComponent($scope) {
    $scope.clusterId = '1234';
    var template = '<upgrade-schedule-configuration can-postpone="true" daily="false" cluster-id="clusterId"></upgrade-schedule-configuration>';
    var element = $compile(angular.element(template))($scope);
    $scope.$apply();
    return element;
  }

  it('should disable the day selector if daily is true', function() {
    $scope.clusterId = 'deadbeef';
    var element = compileComponent($scope);
    // now what is the right way to test if day selector is disabled?!
  });
});
