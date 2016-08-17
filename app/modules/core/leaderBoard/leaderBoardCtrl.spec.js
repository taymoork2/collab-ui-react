'use strict';

describe('LeaderBoard', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));

  var $controller, $q, $scope, Orgservice, TrialService, WebExUtilsFact;
  var usageOnlySharedDevicesFixture = getJSONFixture('core/json/organizations/usageOnlySharedDevices.json');

  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _Orgservice_, _TrialService_, _WebExUtilsFact_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    Orgservice = _Orgservice_;
    TrialService = _TrialService_;
    WebExUtilsFact = _WebExUtilsFact_;

    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(usageOnlySharedDevicesFixture));
    spyOn(TrialService, 'getDaysLeftForCurrentUser').and.returnValue($q.when());
    spyOn(WebExUtilsFact, 'isCIEnabledSite').andReturnValue(true);
  }));

  function initController() {
    $controller('leaderBoardCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }

  describe('when organization has only Shared Devices', function () {
    beforeEach(initController);

    it('should aggregate the Shared Devices volume', function () {
      expect($scope.roomSystemsCount).toBe(20);
    });
  });
});
