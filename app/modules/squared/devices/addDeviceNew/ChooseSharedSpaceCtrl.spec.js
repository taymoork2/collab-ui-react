'use strict';

describe('ChooseSharedSpaceCtrl: Ctrl', function () {
  var controller, $stateParams, $state, $scope, $q, CsdmDataModelService;
  var $controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, $rootScope, _$stateParams_, _$state_, _$q_, _CsdmDataModelService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $q = _$q_;
    CsdmDataModelService = _CsdmDataModelService_;
  }));

  function initController() {
    controller = $controller('ChooseSharedSpaceCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams
    });
  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });
  beforeEach(installPromiseMatchers);

  describe('Initialization', function () {
    it('sets all the necessary fields', function () {
      var title = 'title';
      var deviceType = 'deviceType';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              title: title,
              account: {
                deviceType: deviceType
              }
            }
          };
        }
      };
      initController();

      expect(controller.title).toBe(title);
      expect(controller.deviceType).toBe(deviceType);
    });
  });

  describe('Next function', function () {
    var deviceDisplayName;
    var deviceCisUuid;
    var deviceType;
    beforeEach(function () {
      deviceDisplayName = 'deviceDisplayName';
      deviceCisUuid = 'deviceCisUuid';
      deviceType = 'deviceType';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: deviceType
              }
            }
          };
        },
        next: function () {}
      };
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.when({}));
      initController();
      controller.deviceName = deviceDisplayName;
      controller.place = { cisUuid: deviceCisUuid };
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
    });

    it('should set the wizardState with correct fields for show activation code modal', function () {
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.type).toBe('shared');
      expect(wizardState.account.name).toBe(deviceDisplayName);
      expect(wizardState.account.cisUuid).toBe(deviceCisUuid);
    });
  });
});
