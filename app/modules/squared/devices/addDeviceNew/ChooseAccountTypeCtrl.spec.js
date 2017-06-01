'use strict';

describe('ChooseAccountTypeCtrl: Ctrl', function () {
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
    controller = $controller('ChooseAccountTypeCtrl', {
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
    var accountType;

    var initControllerAndValues = function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {},
          };
        },
        next: function () {
        },
      };
      initController();
      spyOn($stateParams.wizard, 'next');
      $scope.$apply();
    };

    describe('when selected shared account type', function () {

      beforeEach(function () {
        accountType = 'shared';
        initControllerAndValues();
        controller.shared();
        controller.next();
      });


      it('should set the wizardState with correct fields for choose shared space modal', function () {
        expect($stateParams.wizard.next).toHaveBeenCalledWith(jasmine.anything(), accountType);
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.type).toBe(accountType);
      });
    });

    describe('when selected personal account type', function () {

      beforeEach(function () {
        accountType = 'personal';
        initControllerAndValues();
        controller.personal();
        controller.next();
      });

      it('should set the wizardState with correct fields for choose personal modal', function () {
        expect($stateParams.wizard.next).toHaveBeenCalledWith(jasmine.anything(), accountType);
        var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
        expect(wizardState.account.type).toBe(accountType);
      });
    });
  });
});
