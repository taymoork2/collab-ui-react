'use strict';

describe('ChoosePersonalCtrl: Ctrl', function () {
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
    controller = $controller('ChoosePersonalCtrl', {
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
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              title: title
            }
          };
        }
      };
      initController();

      expect(controller.title).toBe(title);
    });
  });

  describe('Next function', function () {
    var displayName;
    var firstName;
    var userCisUuid;
    var email;
    var orgId;
    beforeEach(function () {
      displayName = 'displayName';
      firstName = 'firstName';
      userCisUuid = 'userCisUuid';
      email = 'email@address.com';
      orgId = 'orgId';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {}
          };
        },
        next: function () {}
      };
      initController();
      controller.deviceName = displayName;
      controller.displayName = displayName;
      controller.userName = email;
      controller.organizationId = orgId;
      controller.cisUuid = userCisUuid;
      controller.firstName = firstName;
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
    });

    it('should set the wizardState with correct fields for show activation code modal', function () {
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.name).toBe(displayName);
      expect(wizardState.account.cisUuid).toBe(userCisUuid);
      expect(wizardState.account.username).toBe(email);
      expect(wizardState.recipient.displayName).toBe(displayName);
      expect(wizardState.recipient.firstName).toBe(firstName);
      expect(wizardState.recipient.cisUuid).toBe(userCisUuid);
      expect(wizardState.recipient.email).toBe(email);
      expect(wizardState.recipient.organizationId).toBe(orgId);
    });
  });
});
