'use strict';

describe('ChooseSharedSpaceCtrl: Ctrl', function () {
  var controller, $stateParams, $state, $scope, $q, CsdmDataModelService;
  var $controller, $httpBackend;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$controller_, _$httpBackend_, $rootScope, _$stateParams_, _$state_, _$q_, _CsdmDataModelService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $q = _$q_;
    CsdmDataModelService = _CsdmDataModelService_;
    $httpBackend = _$httpBackend_;

    $httpBackend.expectGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/null/places/?type=all&query=xy').respond($q.resolve({}));
  }));

  function initController() {
    controller = $controller('ChooseSharedSpaceCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: $stateParams,
    });
    $httpBackend.flush();
  }

  afterEach(function () {
    jasmine.getJSONFixtures().clearCache();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  beforeEach(installPromiseMatchers);

  describe('Initialization', function () {
    it('sets all the necessary fields', function () {
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve({}));
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
              showPersonal: true,
              multipleRoomDevices: true,
            },
          };
        },
      };
      initController();

      expect(controller.title).toBe(title);
      expect(controller.deviceType).toBe(deviceType);
      expect(controller.initialDeviceType).toBe(deviceType);
      expect(controller.showPersonal).toBe(true);
      expect(controller.multipleRoomDevices).toBe(true);
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

  describe('getRooms', function () {
    var huronPlaceUrl;
    var cloudberryPlaceWithDevicesUrl;
    var cloudberryPlaceWithoutDevicesUrl;
    var placeMap;
    beforeEach(function () {
      huronPlaceUrl = 'https://placeUrl/huron';
      cloudberryPlaceWithDevicesUrl = 'https://placeUrl/cloudberryWithDevices';
      cloudberryPlaceWithoutDevicesUrl = 'https://placeUrl/cloudberryWithoutDevices';
      placeMap = {
        huronPlaceUrl: {
          url: huronPlaceUrl,
          type: 'huron',
        },
        cloudberryPlaceWithDevicesUrl: {
          url: cloudberryPlaceWithDevicesUrl,
          type: 'cloudberry',
          devices: [{}],
        },
        cloudberryPlaceWithoutDevicesUrl: {
          url: cloudberryPlaceWithoutDevicesUrl,
          type: 'cloudberry',
        },
      };
    });

    it('should return all places if both showPersonal and multipleRoomDevices', function () {
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve(placeMap));
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {},
              showPersonal: true,
              multipleRoomDevices: true,
            },
          };
        },
        next: function () {},
      };
      initController();

      var foundPlaces;
      controller.getRooms('', 3).then(function (places) {
        foundPlaces = places;
      }).catch(function (error) {
        fail(error);
      });
      $scope.$apply();
      expect(CsdmDataModelService.getPlacesMap).toHaveBeenCalled();
      expect(foundPlaces).not.toBeUndefined();
      expect(foundPlaces.length).toBe(3);
      expect(_.find(foundPlaces, { url: huronPlaceUrl })).not.toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithDevicesUrl })).not.toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithoutDevicesUrl })).not.toBeUndefined();
    });

    it('should return empty cloudberry and all huron places if showPersonal but not multipleRoomDevices', function () {
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve(placeMap));
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {},
              showPersonal: true,
              multipleRoomDevices: false,
            },
          };
        },
        next: function () {},
      };
      initController();

      var foundPlaces;
      controller.getRooms('', 3).then(function (places) {
        foundPlaces = places;
      }).catch(function (error) {
        fail(error);
      });
      $scope.$apply();
      expect(CsdmDataModelService.getPlacesMap).toHaveBeenCalled();
      expect(foundPlaces).not.toBeUndefined();
      expect(foundPlaces.length).toBe(2);
      expect(_.find(foundPlaces, { url: huronPlaceUrl })).not.toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithDevicesUrl })).toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithoutDevicesUrl })).not.toBeUndefined();
    });

    it('should return all cloudberry places if not showPersonal but multipleRoomDevices and deviceType is cloudberry', function () {
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve(placeMap));
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: 'cloudberry',
              },
              showPersonal: false,
              multipleRoomDevices: true,
            },
          };
        },
        next: function () {},
      };
      initController();

      var foundPlaces;
      controller.getRooms('', 3).then(function (places) {
        foundPlaces = places;
      }).catch(function (error) {
        fail(error);
      });
      $scope.$apply();
      expect(CsdmDataModelService.getPlacesMap).toHaveBeenCalled();
      expect(foundPlaces).not.toBeUndefined();
      expect(foundPlaces.length).toBe(2);
      expect(_.find(foundPlaces, { url: huronPlaceUrl })).toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithDevicesUrl })).not.toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithoutDevicesUrl })).not.toBeUndefined();
    });

    it('should return empty cloudberry places if not showPersonal and not multipleRoomDevices and deviceType is cloudberry', function () {
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve(placeMap));
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: 'cloudberry',
              },
              showPersonal: false,
              multipleRoomDevices: false,
            },
          };
        },
        next: function () {},
      };
      initController();

      var foundPlaces;
      controller.getRooms('', 3).then(function (places) {
        foundPlaces = places;
      }).catch(function (error) {
        fail(error);
      });
      $scope.$apply();
      expect(CsdmDataModelService.getPlacesMap).toHaveBeenCalled();
      expect(foundPlaces).not.toBeUndefined();
      expect(foundPlaces.length).toBe(1);
      expect(_.find(foundPlaces, { url: huronPlaceUrl })).toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithDevicesUrl })).toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithoutDevicesUrl })).not.toBeUndefined();
    });

    it('should return huron places if not showPersonal and deviceType is huron', function () {
      spyOn(CsdmDataModelService, 'getPlacesMap').and.returnValue($q.resolve(placeMap));
      $stateParams.wizard = {
        state: function () {
          return {
            data: {
              account: {
                deviceType: 'huron',
              },
              showPersonal: false,
            },
          };
        },
        next: function () {},
      };
      initController();

      var foundPlaces;
      controller.getRooms('', 3).then(function (places) {
        foundPlaces = places;
      }).catch(function (error) {
        fail(error);
      });
      $scope.$apply();
      expect(CsdmDataModelService.getPlacesMap).toHaveBeenCalled();
      expect(foundPlaces).not.toBeUndefined();
      expect(foundPlaces.length).toBe(1);
      expect(_.find(foundPlaces, { url: huronPlaceUrl })).not.toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithDevicesUrl })).toBeUndefined();
      expect(_.find(foundPlaces, { url: cloudberryPlaceWithoutDevicesUrl })).toBeUndefined();
    });
  });
});
