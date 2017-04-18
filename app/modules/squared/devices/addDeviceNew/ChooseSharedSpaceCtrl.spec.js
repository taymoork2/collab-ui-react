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
      var deviceType = 'deviceType';
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              title: title,
              account: {
                deviceType: deviceType,
              },
            },
          };
        },
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
    var radioSelect;
    beforeEach(function () {
      deviceDisplayName = 'deviceDisplayName';
      deviceCisUuid = 'deviceCisUuid';
      deviceType = 'deviceType';
      radioSelect = 'radioSelect';
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({}));
    });

    it('should set the wizardState with correct fields for show activation code modal without personal, without addPlace and without radioSelect', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: deviceType,
              },
            },
          };
        },
        next: function () {},
      };
      initController();
      controller.deviceName = deviceDisplayName;
      controller.place = { cisUuid: deviceCisUuid };
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.type).toBe('shared');
      expect(wizardState.account.name).toBe(deviceDisplayName);
      expect(wizardState.account.cisUuid).toBe(deviceCisUuid);
      var nextOptions = $stateParams.wizard.next.calls.mostRecent().args[1];
      expect(nextOptions).toBe(deviceType + '_existing');
    });

    it('should set the wizardState with correct fields for show activation code modal without personal and with addPlace', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              function: 'addPlace',
              account: {
                deviceType: deviceType,
              },
            },
          };
        },
        next: function () {},
      };
      initController();
      controller.deviceName = deviceDisplayName;
      controller.place = { cisUuid: deviceCisUuid };
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.type).toBe('shared');
      expect(wizardState.account.name).toBe(deviceDisplayName);
      expect(wizardState.account.cisUuid).toBe(deviceCisUuid);
      var nextOptions = $stateParams.wizard.next.calls.mostRecent().args[1];
      expect(nextOptions).toBe(deviceType + '_create');
    });

    it('should set the wizardState with correct fields for show activation code modal without personal, without addPlace and with radioSelect', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: deviceType,
              },
            },
          };
        },
        next: function () {},
      };
      initController();
      controller.deviceName = deviceDisplayName;
      controller.place = { cisUuid: deviceCisUuid };
      spyOn($stateParams.wizard, 'next');
      controller.radioSelect = radioSelect;
      controller.next();
      $scope.$apply();
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.type).toBe('shared');
      expect(wizardState.account.name).toBe(deviceDisplayName);
      expect(wizardState.account.cisUuid).toBe(deviceCisUuid);
      var nextOptions = $stateParams.wizard.next.calls.mostRecent().args[1];
      expect(nextOptions).toBe(deviceType + '_' + radioSelect);
    });

    it('should set the wizardState with correct fields for show activation code modal with personal, without addPlace and without radioSelect', function () {
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: deviceType,
              },
              showPersonal: true,
            },
          };
        },
        next: function () {},
      };
      initController();
      controller.deviceName = deviceDisplayName;
      controller.place = { cisUuid: deviceCisUuid };
      spyOn($stateParams.wizard, 'next');
      controller.next();
      $scope.$apply();
      expect($stateParams.wizard.next).toHaveBeenCalled();
      var wizardState = $stateParams.wizard.next.calls.mostRecent().args[0];
      expect(wizardState.account.type).toBe('shared');
      expect(wizardState.account.name).toBe(deviceDisplayName);
      expect(wizardState.account.cisUuid).toBe(deviceCisUuid);
      var nextOptions = $stateParams.wizard.next.calls.mostRecent().args[1];
      expect(nextOptions).toBe('existing');
    });
  });
});
