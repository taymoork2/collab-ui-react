'use strict';

describe('Service: CsdmDataModelService', function () {
  beforeEach(angular.mock.module('Squared'));

  var CsdmDataModelService;
  var CsdmConverter;
  var $httpBackend;
  var $rootScope;
  var testScope;
  var $timeout;

  var placesUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/';
  var pWithoutDeviceUuid = '938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var pWithoutDeviceUrl = placesUrl + '938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var pWithDevicesUuid = 'a19b308a-PlaceWithDevice-71898e423bec';
  var pWithDeviceUrl = placesUrl + pWithDevicesUuid;
  var device1Url = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f';
  var devicesUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/devices';

  var huronDevicesUrl = devicesUrl + '/?type=huron';
  var pWithHuronDevice2Url = placesUrl + '68351854-Place2WithHuronDevice-c9c844421ec2';
  var huronDevice2Url = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-ace151f631fa';
  var huronDevice2CsdmUrl = devicesUrl + '/2c586b22-hurondev_inplace2-ace151f631fa?type=huron&cisUuid=68351854-Place2WithHuronDevice-c9c844421ec2';
  var huronPersonalDeviceUrl = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-PERSON-ace151f631fa';
  var nonExistentPlaceBasedOnPersonalUserUrl = placesUrl + '68351854-PERSON-c9c844421ec2';
  var huronPlaceWithoutDeviceUrl = placesUrl + '938d9c32-huronPlaceWithoutDevice-88d7c1a7f63ev';

  var initialDeviceMap;
  var initialDeviceCount;
  var initialPlaceMap;
  var initialPlaceCount;

  var initialHuronDevices = getJSONFixture('squared/json/huronDevices.json');
  var initialHttpDevices = getJSONFixture('squared/json/devices.json');
  var accounts = getJSONFixture('squared/json/accounts.json');
  var objectsConverted = false;

  beforeEach(inject(function (Authinfo) {
    spyOn(Authinfo, 'getOrgId').and.returnValue('testOrg');
    spyOn(Authinfo, 'getLicenses').and.returnValue([{
      licenseType: 'COMMUNICATION',
    }]);
  }));

  beforeEach(inject(function (_CsdmDataModelService_, _$httpBackend_, _$rootScope_, _$timeout_, _CsdmConverter_) {
    CsdmDataModelService = _CsdmDataModelService_;
    CsdmConverter = _CsdmConverter_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    testScope = $rootScope.$new();

    if (!objectsConverted) {
      initialHuronDevices = CsdmConverter.convertHuronDevices(initialHuronDevices);
      initialHttpDevices = CsdmConverter.convertCloudberryDevices(initialHttpDevices);
      accounts = CsdmConverter.convertPlaces(accounts);
      objectsConverted = true;
    }

    $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/?type=all&query=xy').respond({});
    $httpBackend.whenGET(devicesUrl + '?checkDisplayName=false&checkOnline=false').respond(initialHttpDevices);
    $httpBackend.whenGET(devicesUrl).respond(initialHttpDevices);
    $httpBackend.whenGET(huronDevicesUrl).respond(initialHuronDevices);
    $httpBackend.whenGET('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/places/?shallow=true&type=all').respond(accounts);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/testOrg/v1/Users/me').respond({});
  }));

  afterEach(function () {
    testScope.$destroy();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  function executeGetCallsAndInitPromises() {
    var initialDeviceMapPromise = CsdmDataModelService.getDevicesMap();

    CsdmDataModelService.getPlacesMap().then(function (placesMap) {
      initialPlaceMap = placesMap;
      initialDeviceMapPromise.then(function (deviceMap) {
        initialDeviceMap = deviceMap;
        initialDeviceCount = Object.keys(initialDeviceMap).length;
      });
    });

    $httpBackend.flush();
    $rootScope.$apply();

    //Not inside the getPlacesMap promise, but will be run by http flush:
    initialPlaceCount = Object.keys(initialPlaceMap).length;
  }

  describe('devices', function () {
    it('should return a list of devices', function () {
      executeGetCallsAndInitPromises();

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        expect(Object.keys(devices).length).toBe(initialDeviceCount);
      });
    });

    it('should contain csdm endpoints', function () {
      executeGetCallsAndInitPromises();

      expect(initialDeviceMap[device1Url].tags).toEqual(['one', 'two', 'three']);
    });

    it('should contain huron endpoints', function () {
      executeGetCallsAndInitPromises();

      expect(initialDeviceMap[huronDevice2Url].tags).toEqual(['hey', 'ho', 'letsgo']);
    });

    it('should contain huron personal endpoints', function () {
      executeGetCallsAndInitPromises();

      expect(initialDeviceMap[huronPersonalDeviceUrl].tags).toEqual(['sheena', 'was', 'a punkrocker']);
    });

    it('get devices should call both fast and slow url', function () {
      $httpBackend.expectGET(devicesUrl + '?checkDisplayName=false&checkOnline=false');
      $httpBackend.expectGET(devicesUrl);

      executeGetCallsAndInitPromises();

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        expect(Object.keys(devices).length).toBe(initialDeviceCount);
      });
    });

    it('get devices should call huron when requested', function () {
      executeGetCallsAndInitPromises();

      $httpBackend.expectGET(huronDevicesUrl);

      CsdmDataModelService.getDevicesMap(true).then(function (devices) {
        expect(Object.keys(devices).length).toBe(initialDeviceCount);
      });

      $httpBackend.flush();
    });

    it('should have converted devices', function () {
      executeGetCallsAndInitPromises();
      CsdmDataModelService.getDevicesMap().then(function (devices) {
        expect(devices[device1Url].tags).toEqual(['one', 'two', 'three']);
      });
    });

    describe('reloadDevice', function () {
      it(' should reload a device and update the device in both devices and places', function () {
        executeGetCallsAndInitPromises();
        var deviceToReloadUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
        var newDispName = 'Cloud Side Updated Display Name';
        var devicesWithOneModified = JSON.parse(JSON.stringify(initialHttpDevices));
        devicesWithOneModified[deviceToReloadUrl].displayName = newDispName;
        $httpBackend.expectGET(deviceToReloadUrl).respond(devicesWithOneModified[deviceToReloadUrl]);

        var promiseExecuted;

        CsdmDataModelService.getDevicesMap().then(function (devices) {
          CsdmDataModelService.getPlacesMap().then(function (places) {
            var originalDevice = devices[deviceToReloadUrl];

            CsdmDataModelService.reloadDevice(originalDevice).then(function (reloadedDevice) {
              expect(reloadedDevice.displayName).toEqual(newDispName);
              expect(originalDevice.displayName).toEqual(newDispName);
              expect(devices[deviceToReloadUrl].displayName).toEqual(newDispName);
              expect(places[pWithDeviceUrl].devices[deviceToReloadUrl].displayName).toEqual(newDispName);

              expect(originalDevice).toBe(devices[deviceToReloadUrl]);
              promiseExecuted = 'YES';
            });
          });
        });

        $httpBackend.flush();
        expect(promiseExecuted).toBeTruthy();
      });
    });

    it('add code to an existing place is not reflected in device list', function () {
      executeGetCallsAndInitPromises();
      var codeToAddUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/codes/12121-code-to-add-21212';

      $httpBackend.expectPOST('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/codes')
        .respond({ url: codeToAddUrl, id: pWithoutDeviceUuid }); //api uses id
      var promiseExecuted, changeNotification;

      CsdmDataModelService.getDevicesMap().then(function (deviceMap) {
        CsdmDataModelService.getPlacesMap().then(function () {
          CsdmDataModelService.subscribeToChanges(testScope, function () {
            changeNotification = 'YES';
          });

          CsdmDataModelService.createCodeForExisting(pWithoutDeviceUuid).then(function () {
            expect(deviceMap[codeToAddUrl]).toBeUndefined();
            promiseExecuted = 'YES';
          });
        });
      });
      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
      expect(changeNotification).toBeFalsy();
    });

    it('failing to delete device is not reflected in device list and place list returned by earlier getDevicesMap', function () {
      executeGetCallsAndInitPromises();
      var deviceToDeleteUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';

      $httpBackend.expectDELETE(deviceToDeleteUrl + '?keepPlace=true').respond(403);

      var promiseExecuted;

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        CsdmDataModelService.getPlacesMap().then(function (places) {
          expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);

          var deviceToDelete = devices[deviceToDeleteUrl];

          CsdmDataModelService.deleteItem(deviceToDelete).catch(function () {
            expect(devices[deviceToDeleteUrl]).toBe(deviceToDelete);
            expect(places[pWithDeviceUrl]).toBeDefined();
            expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);
            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();

      expect(promiseExecuted).toBeTruthy();
    });

    function testDeleteDeviceIsReflectedInDevAndPlaceList(deviceUrlToDelete, placeUrl) {
      executeGetCallsAndInitPromises();

      var promiseExecuted, changeNotification;

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        CsdmDataModelService.getPlacesMap().then(function (places) {
          var deviceToDelete = devices[deviceUrlToDelete];
          if (deviceToDelete.isCloudberryDevice2()) {
            $httpBackend.expectDELETE(deviceUrlToDelete + '?keepPlace=true').respond(204);
          } else {
            $httpBackend.expectDELETE(deviceUrlToDelete).respond(204);
          }

          var place = places[placeUrl];
          var devicesInPlace;

          devicesInPlace = _.values(place.devices);

          var initalDeviceCountForPlace = devicesInPlace.length;

          expect(devicesInPlace).toContain(deviceToDelete);

          CsdmDataModelService.subscribeToChanges(testScope, function () {
            changeNotification = 'YES';
          });

          CsdmDataModelService.deleteItem(deviceToDelete).then(function () {
            expect(devices[deviceUrlToDelete]).toBeUndefined();
            if (!deviceToDelete.isHuronDevice2() && !deviceToDelete.isCloudberryDevice2()) {
              expect(places[placeUrl]).toBeUndefined();
            } else {
              expect(places[placeUrl]).toBeDefined();
            }
            devicesInPlace = _.values(place.devices);

            expect(devicesInPlace).toHaveLength(initalDeviceCountForPlace - 1);

            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
      expect(changeNotification).toBeTruthy();
    }

    it('delete cloudberry device is reflected in device list (all devices under same place) and place list', function () {
      var deviceUrlToDelete = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      testDeleteDeviceIsReflectedInDevAndPlaceList(deviceUrlToDelete, pWithDeviceUrl);
    });

    it('delete huron device is reflected in device list (all devices under same place) and place list', function () {
      testDeleteDeviceIsReflectedInDevAndPlaceList(huronDevice2Url, pWithHuronDevice2Url);
    });

    it('change device name is not possible', function () {
      executeGetCallsAndInitPromises();
      var deviceUrlToUpdate = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      var originalName = 'PlaceWithDevice';
      var newDeviceName = 'This Is The New name !!';
      var promiseRejected;

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        CsdmDataModelService.getPlacesMap().then(function (places) {
          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].displayName).toBe(originalName);

          CsdmDataModelService.updateItemName(devices[deviceUrlToUpdate], newDeviceName).then(function () {
            fail('Should be rejected');
          }).catch(function () {
            promiseRejected = 'YES';
          });
        });
      });

      $rootScope.$digest();
      expect(promiseRejected).toBeTruthy();
    });

    function cloneDevice(device) {
      return device.isHuronDevice2() ? CsdmConverter.convertHuronDevice(device) : CsdmConverter.convertCloudberryDevice(device);
    }

    function testAddTagIsReflectedInDevAndPlaceList(deviceUrlForUpdateTags, deviceUrlToUpdate, placeUrl) {
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlForUpdateTags).respond(204);

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var newTag = 'This Is A New Tag added by test';
        var deviceToUpdateArgument = cloneDevice(deviceToUpdate);
        var newTags = deviceToUpdateArgument.tags.concat(newTag);

        CsdmDataModelService.getPlacesMap().then(function (places) {
          var arrayWithDevice = places[placeUrl].devices;

          expect(arrayWithDevice[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          CsdmDataModelService.updateTags(deviceToUpdateArgument, newTags).then(function (updatedDevice) {
            //Argument should not be updated:
            expect(deviceToUpdateArgument.tags).toHaveLength(originalTagsCount);
            expect(deviceToUpdateArgument.tags).not.toContain(newTag);

            //response object should be updated:
            expect(updatedDevice.tags).toHaveLength(originalTagsCount + 1);
            expect(updatedDevice.tags).toContain(newTag);

            //devices map should be updated:
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(devices[deviceUrlToUpdate].tags).toContain(newTag);

            //devices on the place should be updated:
            expect(arrayWithDevice[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(arrayWithDevice[deviceUrlToUpdate].tags).toContain(newTag);

            promiseExecuted = 'YES';
          });
        });
      });
      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    }

    it('add a cloudberry device tag is reflected in device list and place list', function () {
      var deviceUrlToUpdate = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      testAddTagIsReflectedInDevAndPlaceList(deviceUrlToUpdate, deviceUrlToUpdate, pWithDeviceUrl);
    });

    it('add a huron device tag is reflected in device list and place list', function () {
      testAddTagIsReflectedInDevAndPlaceList(huronDevice2CsdmUrl, huronDevice2Url, pWithHuronDevice2Url);
    });

    it('add a device tag and sending in a cloned object is reflected in device list and place list', function () {
      var deviceUrlToUpdate = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(204);

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var newTag = 'This Is A New Tag added by test';
        var newTags = deviceToUpdate.tags.concat(newTag);

        CsdmDataModelService.getPlacesMap().then(function (places) {
          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          var deviceToUpdateClone = cloneDevice(deviceToUpdate);

          CsdmDataModelService.updateTags(deviceToUpdateClone, newTags).then(function (updatedDevice) {
            expect(deviceToUpdateClone.tags).toHaveLength(originalTagsCount);
            expect(deviceToUpdateClone.tags).not.toContain(newTag);
            expect(updatedDevice.tags).toHaveLength(originalTagsCount + 1);
            expect(updatedDevice.tags).toContain(newTag);
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(devices[deviceUrlToUpdate].tags).toContain(newTag);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toContain(newTag);

            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('failing to add a device tag is not reflected in device list and place list', function () {
      var deviceUrlToUpdate = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(403);

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var newTag = 'This Is A New Tag added by test';
        var newTags = deviceToUpdate.tags.concat(newTag);

        CsdmDataModelService.getPlacesMap().then(function (places) {
          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          CsdmDataModelService.updateTags(deviceToUpdate, newTags).catch(function () {
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);
            expect(devices[deviceUrlToUpdate].tags).not.toContain(newTag);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).not.toContain(newTag);

            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('remove a device tag is reflected in device list and place list', function () {
      var deviceUrlToUpdate = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(204);

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var removedTag = deviceToUpdate.tags[0];
        var newTags = deviceToUpdate.tags.slice(1);

        CsdmDataModelService.getPlacesMap().then(function (places) {
          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          CsdmDataModelService.updateTags(deviceToUpdate, newTags).then(function (updatedDevice) {
            expect(updatedDevice.tags).toHaveLength(originalTagsCount - 1);
            expect(updatedDevice.tags).not.toContain(removedTag);
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount - 1);
            expect(devices[deviceUrlToUpdate].tags).not.toContain(removedTag);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount - 1);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).not.toContain(removedTag);

            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });


    it('failing to remove a device tag is not reflected in device list and place list', function () {
      var deviceUrlToUpdate = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(403);

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var removedTag = deviceToUpdate.tags[0];
        var newTags = deviceToUpdate.tags.slice(1);

        CsdmDataModelService.getPlacesMap().then(function (places) {
          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          CsdmDataModelService.updateTags(deviceToUpdate, newTags).catch(function () {
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);
            expect(devices[deviceUrlToUpdate].tags).toContain(removedTag);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toContain(removedTag);

            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });
  });

  describe('places', function () {
    beforeEach(function () {
      executeGetCallsAndInitPromises();
    });

    it('should return a list of places including those containing devices', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        expect(_.values(places).length).toBe(initialPlaceCount);
        expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });

    it('should return a list of places where places generated from a device should contain all place fields', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);

        expect(places[pWithDeviceUrl].displayName).toBe('PlaceWithDevice');
        expect(places[pWithDeviceUrl].type).toBe('cloudberry');
        expect(places[pWithDeviceUrl].readableType).toBe('addDeviceWizard.chooseDeviceType.roomSystem');
        expect(places[pWithDeviceUrl].sipUrl).toBe('foodelete1@trialorg.room.ciscospark.com');
        expect(places[pWithDeviceUrl].cisUuid).toBe('a19b308a-PlaceWithDevice-71898e423bec');
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });

    it('should return a list of places where places generated from a account should contain all place fields', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places[pWithoutDeviceUrl].devices).length).toBe(0);

        expect(places[pWithoutDeviceUrl].displayName).toBe('PlaceWithoutMissingNonExistingDevice');
        expect(places[pWithoutDeviceUrl].type).toBe('cloudberry');
        expect(places[pWithoutDeviceUrl].readableType).toBe('addDeviceWizard.chooseDeviceType.roomSystem');
        expect(places[pWithoutDeviceUrl].sipUrl).toBe('foodelete2@trialorg.room.ciscospark.com');
        expect(places[pWithoutDeviceUrl].cisUuid).toBe('938d9c32-placeWithoutDevice-88d7c1a7f63e');
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });

    it('should return a list of places where places generated from a huron account should contain all place fields', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places[huronPlaceWithoutDeviceUrl].devices).length).toBe(0);

        expect(places[huronPlaceWithoutDeviceUrl].displayName).toBe('HuronPlaceWithoutDevices');
        expect(places[huronPlaceWithoutDeviceUrl].type).toBe('huron');
        expect(places[huronPlaceWithoutDeviceUrl].readableType).toBe('addDeviceWizard.chooseDeviceType.ciscoPhone');
        expect(places[huronPlaceWithoutDeviceUrl].cisUuid).toBe('938d9c32-huronPlaceWithoutDevice-88d7c1a7f63ev');
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });

    it('should not generate a place for a personal huron device', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(places[nonExistentPlaceBasedOnPersonalUserUrl]).toBeUndefined();
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });


    it('should return a list of places including those not containing devices', function () {
      var expectCall;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        expect(_.values(places).length).toBe(initialPlaceCount);

        expect(Object.keys(places[pWithoutDeviceUrl].devices).length).toBe(0);

        expectCall = true;
      });
      $rootScope.$digest();
      expect(expectCall).toBe(true);
    });

    it('get should return an updated item and update the model when a device was activated', function () {
      var expectCall, changeNotification;
      var placeToUpdateUrl = huronPlaceWithoutDeviceUrl;

      var updatedPlace = {
        url: huronPlaceWithoutDeviceUrl,
        devices: { 'http://new/device': { url: 'http://new/device' } },
      };
      $httpBackend.expectGET(placeToUpdateUrl).respond(updatedPlace);

      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        var placeToUpdate = places[placeToUpdateUrl];

        expect(Object.keys(placeToUpdate.devices)).toHaveLength(0);
        expect(initialDeviceMap['http://new/device']).toBeUndefined();
        expect(Object.keys(initialDeviceMap)).not.toContain('http://new/device');
        CsdmDataModelService.subscribeToChanges(testScope, function () {
          changeNotification = 'YES';
        });

        CsdmDataModelService.reloadPlace(placeToUpdate).then(function (returnedPlace) {
          expect(Object.keys(returnedPlace.devices)).toHaveLength(1);
          expect(Object.keys(placeToUpdate.devices)).toHaveLength(1);

          expect(Object.keys(initialDeviceMap)).toContain('http://new/device');

          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
      expect(changeNotification).toBeTruthy();
    });

    it('get should return an updated item and update the model when a personal device was activated', function () {
      var expectCall, changeNotification;
      var uWithDevicesUuid = '36437546-PERSON-b3b345441ba6';
      var type = 'shouldJustBePassedThrough';
      var devicesForUserUrl = 'https://csdm-intb.ciscospark.com/csdm/api/v1/organization/testOrg/devices?type=' + type + '&cisUuid=' + uWithDevicesUuid;
      var newPersonalDevice = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/' + uWithDevicesUuid;

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        expect(Object.keys(devices).length).toBe(initialDeviceCount);

        expect(initialDeviceMap['http://new/device']).toBeUndefined();
        expect(Object.keys(initialDeviceMap)).not.toContain('http://new/device');
        CsdmDataModelService.subscribeToChanges(testScope, function () {
          changeNotification = 'YES';
        });

        var userDevices = {};
        userDevices[newPersonalDevice] = {
          url: newPersonalDevice,
        };
        $httpBackend.expectGET(devicesForUserUrl).respond(userDevices);

        CsdmDataModelService.reloadDevicesForUser(uWithDevicesUuid, type).then(function (returnedUserDevices) {
          expect(Object.keys(returnedUserDevices)).toHaveLength(1);
          expect(Object.keys(returnedUserDevices)).toContain(newPersonalDevice);
          expectCall = true;

          CsdmDataModelService.getDevicesMap().then(function (devicesFromMap) {
            expect(Object.keys(devicesFromMap)).toHaveLength(initialDeviceCount + 1);
            expect(Object.keys(devicesFromMap)).toContain(newPersonalDevice);
          });
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
      expect(changeNotification).toBeTruthy();
    });

    it('get should return an updated item and update the model when place was renamed', function () {
      var expectCall, changeNotification;
      var placeToUpdateUrl = huronPlaceWithoutDeviceUrl;

      var newDisplayName = 'New display name! Wow!';
      var updatedPlace = {
        displayName: newDisplayName,
        url: huronPlaceWithoutDeviceUrl,
      };
      $httpBackend.expectGET(placeToUpdateUrl).respond(updatedPlace);

      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        var placeToUpdate = places[placeToUpdateUrl];

        CsdmDataModelService.subscribeToChanges(testScope, function () {
          changeNotification = 'YES';
        });

        CsdmDataModelService.reloadPlace(placeToUpdate).then(function (returnedPlace) {
          expect(returnedPlace.displayName).toBe(newDisplayName);
          expect(placeToUpdate.displayName).toBe(newDisplayName);

          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
      expect(changeNotification).toBeTruthy();
    });

    it('reloadPlace should return an updated item and update the model when a device was deleted server side', function () {
      var expectCall, changeNotification;
      var placeToUpdateUrl = pWithDeviceUrl;

      var updatedPlace = {
        cisUuid: pWithDevicesUuid,
        url: pWithDeviceUrl,
        displayName: initialPlaceMap[pWithDeviceUrl].displayName,
        devices: {},
      };
      $httpBackend.expectGET(placeToUpdateUrl).respond(updatedPlace);

      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        var placeToUpdate = places[placeToUpdateUrl];

        expect(Object.keys(placeToUpdate.devices).length).toBeGreaterThan(0);
        expect(initialDeviceMap[device1Url]).toBeDefined();
        expect(Object.keys(initialDeviceMap)).toContain(device1Url);
        CsdmDataModelService.subscribeToChanges(testScope, function () {
          changeNotification = 'YES';
        });

        CsdmDataModelService.reloadPlace(placeToUpdate).then(function (returnedPlace) {
          expect(Object.keys(returnedPlace.devices)).toHaveLength(0);
          expect(Object.keys(placeToUpdate.devices)).toHaveLength(0);

          expect(Object.keys(initialDeviceMap)).not.toContain(device1Url);

          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
      expect(changeNotification).toBeTruthy();
    });

    it('updateItemName should update place and devices', function () {
      var promiseExecuted, changeNotification;

      var placeToUpdateUrl = pWithDeviceUrl;
      var deviceToUpdateUrl = device1Url;

      var newName = 'new name from test';
      var newSipUrl = 'This Is A sip url from test';

      var placeReturnedFromPatch = {
        url: placeToUpdateUrl,
        sipUrl: newSipUrl,
        displayName: newName,
        devices: {
          deviceToUpdateUrl: { url: deviceToUpdateUrl, sipUrl: newSipUrl },
        },
      };

      $httpBackend.expectPATCH(placeToUpdateUrl).respond(placeReturnedFromPatch);

      expect(changeNotification).toBeFalsy();
      CsdmDataModelService.subscribeToChanges(testScope, function () {
        changeNotification = 'YES';
      });

      CsdmDataModelService.getDevicesMap().then(function (devices) {
        CsdmDataModelService.getPlacesMap().then(function (places) {
          var placeToUpdate = places[placeToUpdateUrl];
          var deviceToUpdate = devices[deviceToUpdateUrl];

          var oldName = placeToUpdate.displayName;
          var oldSipUrl = placeToUpdate.sipUrl;

          var placeToUpdateArgument = _.cloneDeep(placeToUpdate);

          CsdmDataModelService.updateItemName(placeToUpdateArgument, newName).then(function (updatedPlace) {
            //argument should not be updated:
            expect(placeToUpdateArgument.displayName).toEqual(oldName);
            expect(placeToUpdateArgument.sipUrl).toEqual(oldSipUrl);

            //Place in place map should be updated:
            expect(placeToUpdate.displayName).toEqual(newName);
            expect(placeToUpdate.sipUrl).toEqual(newSipUrl);

            //Device in place in place map should be updated:
            expect(_.find(placeToUpdate.devices, { url: deviceToUpdateUrl }).displayName).toEqual(newName);
            expect(_.find(placeToUpdate.devices, { url: deviceToUpdateUrl }).sipUrl).toEqual(newSipUrl);

            //Device in device map should be updated:
            expect(deviceToUpdate.displayName).toEqual(newName);
            expect(deviceToUpdate.sipUrl).toEqual(newSipUrl);

            //Returned object should be updated:
            expect(updatedPlace.displayName).toEqual(newName);
            expect(updatedPlace.sipUrl).toEqual(newSipUrl);

            promiseExecuted = 'YES';
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
      expect(changeNotification).toBeTruthy();
    });

    it('delete should remove place from place list', function () {
      var placeToRemoveUrl = pWithoutDeviceUrl;
      $httpBackend.expectDELETE(placeToRemoveUrl).respond(200);
      var promiseExecuted, changeNotification;

      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        var placeToRemove = places[placeToRemoveUrl];

        CsdmDataModelService.subscribeToChanges(testScope, function () {
          changeNotification = 'YES';
        });

        CsdmDataModelService.deleteItem(placeToRemove).then(function () {
          expect(places[placeToRemove.url]).toBeUndefined();
          expect(Object.keys(places).length).toBe(initialPlaceCount - 1);
          promiseExecuted = true;
        });
      });


      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
      expect(changeNotification).toBeTruthy();
    });

    it('fail to delete should not remove place from place list', function () {
      var expectCall;
      var placeToRemoveUrl = pWithoutDeviceUrl;
      $httpBackend.expectDELETE(placeToRemoveUrl).respond(403);
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        var placeToRemove = places[placeToRemoveUrl];

        CsdmDataModelService.deleteItem(placeToRemove).catch(function () {
          expect(Object.keys(places).length).toBe(initialPlaceCount);
          expect(places[placeToRemove.url]).toBe(placeToRemove);
          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
    });

    it('delete place with devices should remove place from place list and devices from device list', function () {
      var expectCall;
      var placeToRemoveUrl = pWithDeviceUrl;
      $httpBackend.expectDELETE(placeToRemoveUrl).respond(200);
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);

        var placeToRemove = places[placeToRemoveUrl];
        var device0Url = _.values(placeToRemove.devices)[0].url;

        expect(initialDeviceMap[device0Url]).toBe(_.values(placeToRemove.devices)[0]);

        CsdmDataModelService.deleteItem(placeToRemove).then(function () {
          expect(places[placeToRemove.url]).toBeUndefined();
          expect(Object.keys(places).length).toBe(initialPlaceCount - 1);

          expect(initialDeviceMap[device0Url]).toBeUndefined();

          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
    });

    it('should notify all devices in a place when notifyDevicesInPlace', function () {
      $httpBackend.expectPOST('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f/notify').respond(201, '');
      $httpBackend.expectPOST('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f/notify').respond(201, '');
      $httpBackend.expectPOST('https://csdm-intb.ciscospark.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/6ae09bec-c0f0-58af-b490-60ed6a695a89/notify').respond(201, '');

      CsdmDataModelService.notifyDevicesInPlace('a19b308a-PlaceWithDevice-71898e423bec', { foo: 'bar' });

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should not notify any devices in a place when place does not exist', function () {
      CsdmDataModelService.notifyDevicesInPlace('a19b308a-PlaceDoesNotExist-71898e423bec', { foo: 'bar' });
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });
  });

  describe('re-fetch places', function () {
    var scope;

    beforeEach(function () {
      scope = $rootScope.$new();

      $rootScope.$apply();

      CsdmDataModelService.getPlacesMap(true);

      $rootScope.$digest();
      $timeout.flush(1000);
      $httpBackend.flush();
      $rootScope.$apply();
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();

      scope.$destroy();
    });

    it('has done the initial poll', function () {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('asking before grace time should not trigger fetching', function () {
      $timeout.flush(3000);

      CsdmDataModelService.getPlacesMap(true);

      $rootScope.$digest();

      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('asking after grace time should trigger fetching', function () {
      $timeout.flush(300000);

      CsdmDataModelService.getPlacesMap(true);

      $rootScope.$digest();

      $httpBackend.flush(2);

      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });
  });
});
