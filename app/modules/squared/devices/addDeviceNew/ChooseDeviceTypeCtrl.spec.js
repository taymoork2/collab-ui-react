'use strict';

describe('ChooseDeviceTypeCtrl: Ctrl', function () {
  var controller, $stateParams, $state, $scope;
  var $controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, $rootScope, _$stateParams_, _$state_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $stateParams = _$stateParams_;
  }));

  function initController() {
    controller = $controller('ChooseDeviceTypeCtrl', {
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
      var showPlaces = true;
      var showDarling = true;
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              title: title,
              showPlaces: showPlaces,
              showDarling: showDarling
            }
          };
        }
      };
      initController();

      expect(controller.title).toBe(title);
      expect(controller.showPlaces).toBe(showPlaces);
      expect(controller.showDarling).toBe(showDarling);
    });
  });

  describe('Next function', function () {
    var deviceType;
    beforeEach(function () {
      deviceType = 'deviceType';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {}
          };
        },
        next: function () {}
      };
      initController();
      controller.selectedDeviceType = deviceType;
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
    });

    it('should set the wizardState with correct fields for show activation code modal', function () {
      expect($stateParams.wizard.next).toHaveBeenCalledWith(jasmine.anything(), deviceType);
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.deviceType).toBe(deviceType);
    });
  });
});
