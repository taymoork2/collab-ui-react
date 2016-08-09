'use strict';

describe('LeaderBoard', function() {
    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    var controller, $controller, $q, $rootScope, $scope, $translate, Config, Authinfo, Orgservice, TrialService;
    var usageOnlySharedDevicesFixture = getJSONFixture('core/json/organizations/usageOnlySharedDevices.json');

    beforeEach(inject(function (_$controller_, _$q_, $rootScope, _$translate_, _Config_, _Orgservice_, _TrialService_) {
        $scope = $rootScope.$new();
        $controller = _$controller_;
        $q = _$q_;
        $translate = _$translate_;
        Config = _Config_;
        Orgservice = _Orgservice_;
        TrialService = _TrialService_;
        

        spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(usageOnlySharedDevicesFixture));
        spyOn(TrialService, 'getDaysLeftForCurrentUser').and.returnValue($q.when());
    }));

    function initController() {
        controller = $controller('leaderBoardCtrl', {
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
