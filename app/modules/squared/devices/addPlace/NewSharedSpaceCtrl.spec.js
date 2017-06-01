'use strict';

describe('NewSharedSpaceCtrl: Ctrl', function () {
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
    controller = $controller('NewSharedSpaceCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
    });
  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
  });
  beforeEach(installPromiseMatchers);

  describe('Initialization', function () {
    it('sets all the necessary fields', function () {
      var title = 'title';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              title: title,
            },
          };
        },
      };
      initController();

      expect(controller.title).toBe(title);
    });
  });

  describe('Next function', function () {
    var deviceDisplayName;
    beforeEach(function () {
      deviceDisplayName = 'deviceDisplayName';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {},
          };
        },
        next: function () {},
      };
      initController();
      controller.deviceName = deviceDisplayName;
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
    });

    it('should set the wizardState with correct fields for show activation code modal', function () {
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.name).toBe(deviceDisplayName);
    });
  });
});
