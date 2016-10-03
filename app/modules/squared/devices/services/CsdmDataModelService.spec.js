'use strict';

describe('Service: CsdmDataModelService', function () {
  beforeEach(angular.mock.module('Squared'));

  var CsdmDataModelService;
  var $httpBackend;
  var $rootScope;
  var $timeout;

  var placesUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/';
  var pWithoutDeviceUuid = '938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var pWithoutDeviceUrl = placesUrl + '938d9c32-placeWithoutDevice-88d7c1a7f63e';
  var pWithDeviceUrl = placesUrl + 'a19b308a-PlaceWithDevice-71898e423bec';
  var device1Url = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/c528e32d-ed35-4e00-a20d-d4d3519efb4f';
  var devicesUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/devices';

  var codeUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/codes/ad233bb2-code1-for-place-with-one-code-9333278b3a0c';
  var pWithOnlyCodeUrl = placesUrl + 'a19b308a-PlaceWithOnlyCode-71898e423bec';

  var huronDevicesUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/huronDevices';
  var huronPlacesUrl = 'https://cmi.huron-int.com/api/v2/customers/testOrg/places/';
  var pWithHuronDevice2Url = huronPlacesUrl + '68351854-Place2WithHuronDevice-c9c844421ec2';
  var huronDevice2Url = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-ace151f631fa';
  var huronPersonalDeviceUrl = 'https://cmi.huron-int.com/api/v1/voice/customers/3a6ff373-unittest-a27460e0ac5c/sipendpoints/2c586b22-hurondev_inplace2-PERSON-ace151f631fa';
  var nonExistentPlaceBasedOnPersonalUserUrl = huronPlacesUrl + '68351854-PERSON-c9c844421ec2';
  var huronPlaceWithoutDeviceUrl = huronPlacesUrl + '938d9c32-huronPlaceWithoutDevice-88d7c1a7f63ev';

  var initialDeviceMap;
  var initialDevice1Reference;
  var initialDeviceCount;
  var initialPlaceMap;
  var initialPlaceCount;

  var initialHuronPlaces = getJSONFixture('squared/json/huronPlaces.json');
  var initialHuronDevices = getJSONFixture('squared/json/huronDevices.json');
  var initialHttpDevices = getJSONFixture('squared/json/devices.json');
  var codes = getJSONFixture('squared/json/activationCodes.json');
  var accounts = getJSONFixture('squared/json/accounts.json');

  beforeEach(inject(function (FeatureToggleService, $q, Authinfo) {
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(Authinfo, 'getOrgId').and.returnValue('testOrg');
  }));

  beforeEach(inject(function (_CsdmDataModelService_, _$httpBackend_, _$rootScope_, _$timeout_) {
    CsdmDataModelService = _CsdmDataModelService_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;

    $httpBackend.whenGET(devicesUrl + '?checkDisplayName=false&checkOnline=false').respond(initialHttpDevices);
    $httpBackend.whenGET(devicesUrl).respond(initialHttpDevices);
    $httpBackend.whenGET(huronDevicesUrl).respond(initialHuronDevices);
    $httpBackend.whenGET(huronPlacesUrl + '?wide=true').respond(initialHuronPlaces);
    $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/codes').respond(codes);
    $httpBackend.whenGET('https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/').respond(accounts);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/testOrg/v1/Users/me').respond({});

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  function executeGetCallsAndInitPromises() {
    var initialDeviceMapPromise = CsdmDataModelService.getDevicesMap();

    CsdmDataModelService.getPlacesMap().then(function (placesMap) {
      initialPlaceMap = placesMap;
      initialDeviceMapPromise.then(function (deviceMap) {
        initialDeviceMap = deviceMap;
        initialDevice1Reference = initialDeviceMap[device1Url];
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

    it('should have converted devices', function () {
      executeGetCallsAndInitPromises();
      CsdmDataModelService.getDevicesMap().then(function (devices) {
        expect(devices[device1Url].tags).toEqual(['one', 'two', 'three']);
      });
    });

    describe('reloadDevice', function () {
      it(' should reload a device and update the device in both devices and places', function () {
        executeGetCallsAndInitPromises();
        var deviceToReloadUrl = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
        var newDispName = "Cloud Side Updated Display Name";
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
              promiseExecuted = "YES";
            });

          });
        });

        $httpBackend.flush();
        expect(promiseExecuted).toBeTruthy();
      });
    });

    it('add code is reflected in device list and places map', function () {
      executeGetCallsAndInitPromises();
      var codeToAddUrl = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/codes/12121-code-to-add-21212";
      var placeUuid = "place-id";
      var placeToBeAddedUrl = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/" + placeUuid;
      $httpBackend.expectPOST("https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/")
        .respond({ cisUuid: placeUuid, url: placeToBeAddedUrl });
      $httpBackend.expectPOST("https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/codes")
        .respond({ url: codeToAddUrl, id: placeUuid }); //api uses id
      var promiseExecuted;

      CsdmDataModelService.getDevicesMap().then(function (devicesMap) {
        CsdmDataModelService.getPlacesMap().then(function (places) {
          CsdmDataModelService.createCsdmPlace("newPlace", "cloudberry").then(function (place) {
            CsdmDataModelService.createCodeForExisting(place.cisUuid).then(function (createdCode) {
              expect(devicesMap[codeToAddUrl]).toBe(createdCode);
              expect(Object.keys(places[place.url].codes).length).toBe(1);
              promiseExecuted = "YES";
            });
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('add code to an existing place is reflected in device list and place map with place containing new code', function () {
      executeGetCallsAndInitPromises();
      var codeToAddUrl = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/codes/12121-code-to-add-21212";

      $httpBackend.expectPOST("https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/codes")
        .respond({ url: codeToAddUrl, id: pWithoutDeviceUuid });  //api uses id
      var promiseExecuted;

      CsdmDataModelService.getDevicesMap().then(function (deviceMap) {
        CsdmDataModelService.getPlacesMap().then(function (places) {

          expect(Object.keys(places[pWithoutDeviceUrl].devices).length).toBe(0);
          expect(Object.keys(places[pWithoutDeviceUrl].codes).length).toBe(0);

          CsdmDataModelService.createCodeForExisting(pWithoutDeviceUuid).then(function (createdCode) {

            expect(deviceMap[codeToAddUrl]).toBe(createdCode);
            expect(Object.keys(places[pWithoutDeviceUrl].devices).length).toBe(0);
            expect(Object.keys(places[pWithoutDeviceUrl].codes).length).toBe(1);
            promiseExecuted = "YES";
          });

        });
      });
      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('add code to non existing place is reflected in code list and place map', function () {

    });

    it('failing to delete device is not reflected in device list and place list returned by earlier getDevicesMap', function () {
      executeGetCallsAndInitPromises();
      var deviceToDeleteUrl = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";

      $httpBackend.expectDELETE(deviceToDeleteUrl).respond(403);

      var promiseExecuted;

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        CsdmDataModelService.getPlacesMap().then(function (places) {

          expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);

          var deviceToDelete = devices[deviceToDeleteUrl];

          CsdmDataModelService.deleteItem(deviceToDelete).catch(function () {

            expect(devices[deviceToDeleteUrl]).toBe(deviceToDelete);
            expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);
            promiseExecuted = "YES";
          });

        });
      });

      $httpBackend.flush();

      expect(promiseExecuted).toBeTruthy();

    });

    function testDeleteDeviceIsReflectedInDevAndPlaceList(deviceUrlToDelete, placeUrl) {
      executeGetCallsAndInitPromises();

      var promiseExecuted;
      $httpBackend.expectDELETE(deviceUrlToDelete).respond(204);

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        CsdmDataModelService.getPlacesMap().then(function (places) {

          var deviceToDelete = devices[deviceUrlToDelete];

          var place = places[placeUrl];
          var devicesInPlace;

          if (deviceToDelete.isCode) {
            devicesInPlace = _.values(place.codes);
          } else {
            devicesInPlace = _.values(place.devices);
          }

          var initalDeviceCountForPlace = devicesInPlace.length;

          expect(devicesInPlace).toContain(deviceToDelete);

          CsdmDataModelService.deleteItem(deviceToDelete).then(function () {

            expect(devices[deviceUrlToDelete]).toBeUndefined();
            expect(places[placeUrl]).toBeUndefined();

            if (deviceToDelete.isCode) {
              devicesInPlace = _.values(place.codes);
            } else {
              devicesInPlace = _.values(place.devices);
            }

            expect(devicesInPlace).toHaveLength(initalDeviceCountForPlace - 1);

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    }

    it('delete cloudberry device is reflected in device list (all devices under same place) and place list', function () {
      var deviceUrlToDelete = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';
      testDeleteDeviceIsReflectedInDevAndPlaceList(deviceUrlToDelete, pWithDeviceUrl);
    });

    it('delete code is reflected in device list (all devices under same place) and place list', function () {
      testDeleteDeviceIsReflectedInDevAndPlaceList(codeUrl, pWithOnlyCodeUrl);
    });

    it('delete huron device is reflected in device list (all devices under same place) and place list', function () {
      testDeleteDeviceIsReflectedInDevAndPlaceList(huronDevice2Url, pWithHuronDevice2Url);
    });

    it('change device name is reflected in device list and place list', function () {
      executeGetCallsAndInitPromises();
      var deviceUrlToUpdate = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
      var originalName = "test device 2";
      var newDeviceName = "This Is The New name !!";
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(204);

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        CsdmDataModelService.getPlacesMap().then(function (places) {

          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].displayName).toBe(originalName);

          CsdmDataModelService.updateItemName(devices[deviceUrlToUpdate], newDeviceName).then(function (updatedDevice) {

            expect(updatedDevice.displayName).toEqual(newDeviceName);
            expect(devices[deviceUrlToUpdate].displayName).toEqual(newDeviceName);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].displayName).toEqual(newDeviceName);
            expect(places[pWithDeviceUrl].displayName).toEqual(newDeviceName);

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('failing to change device name is not reflected in device list and place list', function () {
      executeGetCallsAndInitPromises();
      var deviceUrlToUpdate = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f';

      var originalName = "test device 2";
      var newDeviceName = "This Could have been The New name !!";
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(403);

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        CsdmDataModelService.getPlacesMap().then(function (places) {

          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].displayName).toBe(originalName);

          CsdmDataModelService.updateItemName(devices[deviceUrlToUpdate], newDeviceName).catch(function () {

            expect(devices[deviceUrlToUpdate].displayName).toEqual(originalName);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].displayName).toEqual(originalName);
            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    function testAddTagIsReflectedInDevAndPlaceList(deviceUrlToUpdate, placeUrl) {
      var promiseExecuted;

      if (deviceUrlToUpdate.indexOf('huron') > -1) {
        $httpBackend.expectPUT(deviceUrlToUpdate).respond(204);
      } else {
        $httpBackend.expectPATCH(deviceUrlToUpdate).respond(204);
      }

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var newTag = "This Is A New Tag added by test";
        var newTags = deviceToUpdate.tags.concat(newTag);

        CsdmDataModelService.getPlacesMap().then(function (places) {

          var arrayWithDevice;
          if (deviceToUpdate.isCode) {
            arrayWithDevice = places[placeUrl].codes;
          } else {
            arrayWithDevice = places[placeUrl].devices;
          }

          expect(arrayWithDevice[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          CsdmDataModelService.updateTags(deviceToUpdate, newTags).then(function (updatedDevice) {

            expect(updatedDevice.tags).toHaveLength(originalTagsCount + 1);
            expect(updatedDevice.tags).toContain(newTag);
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(devices[deviceUrlToUpdate].tags).toContain(newTag);
            expect(arrayWithDevice[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(arrayWithDevice[deviceUrlToUpdate].tags).toContain(newTag);

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    }

    it('add a cloudberry device tag is reflected in device list and place list', function () {
      var deviceUrlToUpdate = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
      testAddTagIsReflectedInDevAndPlaceList(deviceUrlToUpdate, pWithDeviceUrl);
    });

    // it('add a code tag is reflected in device list and place list', function () {
    //   testAddTagIsReflectedInDevAndPlaceList(codeUrl, pWithOnlyCodeUrl);
    // });

    it('add a huron device tag is reflected in device list and place list', function () {
      testAddTagIsReflectedInDevAndPlaceList(huronDevice2Url, pWithHuronDevice2Url);
    });

    it('add a device tag and sending in a cloned object is reflected in device list and place list', function () {
      var deviceUrlToUpdate = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(204);

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var newTag = "This Is A New Tag added by test";
        var newTags = deviceToUpdate.tags.concat(newTag);

        CsdmDataModelService.getPlacesMap().then(function (places) {

          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          var deviceToUpdateClone = JSON.parse(JSON.stringify(deviceToUpdate));

          CsdmDataModelService.updateTags(deviceToUpdateClone, newTags).then(function (updatedDevice) {

            expect(deviceToUpdateClone.tags).toHaveLength(originalTagsCount + 1);
            expect(deviceToUpdateClone.tags).toContain(newTag);
            expect(updatedDevice.tags).toHaveLength(originalTagsCount + 1);
            expect(updatedDevice.tags).toContain(newTag);
            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(devices[deviceUrlToUpdate].tags).toContain(newTag);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount + 1);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toContain(newTag);

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('failing to add a device tag is not reflected in device list and place list', function () {
      var deviceUrlToUpdate = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
      var promiseExecuted;

      $httpBackend.expectPATCH(deviceUrlToUpdate).respond(403);

      CsdmDataModelService.getDevicesMap().then(function (devices) {

        var deviceToUpdate = devices[deviceUrlToUpdate];
        var originalTagsCount = deviceToUpdate.tags.length;
        var newTag = "This Is A New Tag added by test";
        var newTags = deviceToUpdate.tags.concat(newTag);

        CsdmDataModelService.getPlacesMap().then(function (places) {

          expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);

          CsdmDataModelService.updateTags(deviceToUpdate, newTags).catch(function () {

            expect(devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);
            expect(devices[deviceUrlToUpdate].tags).not.toContain(newTag);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).toHaveLength(originalTagsCount);
            expect(places[pWithDeviceUrl].devices[deviceUrlToUpdate].tags).not.toContain(newTag);

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('remove a device tag is reflected in device list and place list', function () {
      var deviceUrlToUpdate = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
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

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });


    it('failing to remove a device tag is not reflected in device list and place list', function () {
      var deviceUrlToUpdate = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/b528e32d-ed35-4e00-a20d-d4d3519efb4f";
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

            promiseExecuted = "YES";
          });
        });
      });

      $httpBackend.flush();
      expect(promiseExecuted).toBeTruthy();
    });

    it('codes should be presented as non-activated devices', function () {
      //TODO: Not implemented.
    });
  });

  describe('places', function () {
    beforeEach(function () {
      executeGetCallsAndInitPromises();
    });

    it('should return a list of places including those containing devices and codes', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        expect(_.values(places).length).toBe(initialPlaceCount);
        expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);
        expect(Object.keys(places[pWithDeviceUrl].codes).length).toBe(2);
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });

    it('should return a list of places where places generated from a device should contain all place fields', function () {
      var expectExecuted;
      CsdmDataModelService.getPlacesMap().then(function (places) {

        expect(Object.keys(places[pWithDeviceUrl].devices).length).toBe(3);
        expect(Object.keys(places[pWithDeviceUrl].codes).length).toBe(2);

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
        expect(Object.keys(places[pWithoutDeviceUrl].codes).length).toBe(0);

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
        expect(Object.keys(places[huronPlaceWithoutDeviceUrl].codes).length).toBe(0);

        expect(places[huronPlaceWithoutDeviceUrl].displayName).toBe('HuronPlaceWithoutDevices');
        expect(places[huronPlaceWithoutDeviceUrl].type).toBe('huron');
        expect(places[huronPlaceWithoutDeviceUrl].readableType).toBe('addDeviceWizard.chooseDeviceType.deskPhone');
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

    it('should return a list of places where places generated from a code should contain all place fields', function () {
      var expectExecuted;
      var placeWithOneCodeUrl = 'https://csdm-integration.wbx2.com/csdm/api/v1/organization/testOrg/places/a19b308a-PlaceWithOnlyCode-71898e423bec';
      CsdmDataModelService.getPlacesMap().then(function (places) {

        expect(Object.keys(places[placeWithOneCodeUrl].devices).length).toBe(0);
        expect(Object.keys(places[placeWithOneCodeUrl].codes).length).toBe(1);

        expect(places[placeWithOneCodeUrl].displayName).toBe('8A64E0C8576F667801576F66CF320002');
        expect(places[placeWithOneCodeUrl].type).toBe('cloudberry');
        expect(places[placeWithOneCodeUrl].readableType).toBe('addDeviceWizard.chooseDeviceType.roomSystem');
        expect(places[placeWithOneCodeUrl].sipUrl).toBeUndefined();
        expect(places[placeWithOneCodeUrl].cisUuid).toBe('a19b308a-PlaceWithOnlyCode-71898e423bec');
        expectExecuted = true;
      });
      $rootScope.$digest();
      expect(expectExecuted).toBe(true);
    });


    it('should return a list of places including those not containing devices or codes', function () {

      var expectCall;
      CsdmDataModelService.getPlacesMap().then(function (places) {

        expect(Object.keys(places).length).toBe(initialPlaceCount);
        expect(_.values(places).length).toBe(initialPlaceCount);

        expect(Object.keys(places[pWithoutDeviceUrl].devices).length).toBe(0);
        expect(Object.keys(places[pWithoutDeviceUrl].codes).length).toBe(0);

        expectCall = true;
      });
      $rootScope.$digest();
      expect(expectCall).toBe(true);
    });

    it('delete should remove place from place list', function () {

      var expectCall;
      var placeToRemoveUrl = pWithoutDeviceUrl;
      $httpBackend.expectDELETE(placeToRemoveUrl).respond(200);
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);
        var placeToRemove = places[placeToRemoveUrl];

        CsdmDataModelService.deleteItem(placeToRemove).then(function () {
          expect(places[placeToRemove.url]).toBeUndefined();
          expect(Object.keys(places).length).toBe(initialPlaceCount - 1);
          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
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

    it('delete place with codes should remove place from place list and codes from codes list', function () {

      var expectCall;
      var placeToRemoveUrl = pWithDeviceUrl;
      $httpBackend.expectDELETE(placeToRemoveUrl).respond(200);
      CsdmDataModelService.getPlacesMap().then(function (places) {
        expect(Object.keys(places).length).toBe(initialPlaceCount);

        var placeToRemove = places[placeToRemoveUrl];
        var code0Url = _.values(placeToRemove.codes)[0].url;
        var code1Url = _.values(placeToRemove.codes)[1].url;

        expect(initialDeviceMap[code0Url]).toBe(_.values(placeToRemove.codes)[0]);
        expect(initialDeviceMap[code1Url]).toBe(_.values(placeToRemove.codes)[1]);

        CsdmDataModelService.deleteItem(placeToRemove).then(function () {
          expect(places[placeToRemove.url]).toBeUndefined();
          expect(Object.keys(places).length).toBe(initialPlaceCount - 1);

          expect(initialDeviceMap[code0Url]).toBeUndefined();
          expect(initialDeviceMap[code1Url]).toBeUndefined();

          expectCall = true;
        });
      });
      $httpBackend.flush();
      expect(expectCall).toBe(true);
    });
  });

  describe('polling', function () {
    var scope;

    beforeEach(function () {
      scope = $rootScope.$new();

      $httpBackend.expectGET(devicesUrl + '?checkDisplayName=false&checkOnline=false');
      $httpBackend.expectGET(devicesUrl);
      $rootScope.$apply();

      CsdmDataModelService.devicePollerOn('data', angular.noop, {
        scope: scope
      });

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

    it('polls for devices every 30 second', function () {

      $httpBackend.expectGET(devicesUrl).respond(initialHttpDevices);
      $timeout.flush(31000);

      $httpBackend.flush();

    });

    it('polls only the full url, not the fast url', function () {
      $httpBackend.expectGET(devicesUrl).respond(initialHttpDevices);
      $timeout.flush(31000);
      $httpBackend.flush(1); //there should only be one to flush
      $rootScope.$digest();
    });

    it('stops polling when the scope is destroyed', function () {

      scope.$destroy();

      $timeout.flush(31000);

      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();

    });

    describe('datamodel', function () {
      beforeEach(function () {
        executeGetCallsAndInitPromises();
      });


      it('will keep references and include a new added device', function () {

        var addedDevUrl = "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/aaaaaa-ed35-4e00-a20d-d4d3519efb4f";

        var devicesWithOneAdded = JSON.parse(JSON.stringify(initialHttpDevices));

        devicesWithOneAdded[addedDevUrl] = {
          "displayName": "addedDevice",
          "cisUuid": "a19b308a-AddedDevice-71898e423bec",
          "accountType": "MACHINE",
          "url": "https://csdm-integration.wbx2.com/csdm/api/v1/organization/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5/devices/aaaaaa-ed35-4e00-a20d-d4d3519efb4f",
          "createTime": "2016-09-15T01:12:01.105Z",
          "description": "[\"one\", \"two\", \"three\"]",
          "product": "SX10",
          "state": "CLAIMED"
        };

        $httpBackend.expectGET(devicesUrl).respond(devicesWithOneAdded);

        $timeout.flush(31000);

        $httpBackend.flush();

        expect(Object.keys(initialDeviceMap).length).toBe(initialDeviceCount + 1);
        expect(initialDeviceMap[addedDevUrl].cisUuid).toEqual('a19b308a-AddedDevice-71898e423bec');
        expect(initialDeviceMap[device1Url].cisUuid).toEqual(initialDevice1Reference.cisUuid);

        expect(initialDeviceMap[device1Url]).toBe(initialDevice1Reference);

        initialDevice1Reference.ThisIsTheInitialRef = "YAYA";

        expect(initialDeviceMap[device1Url].ThisIsTheInitialRef).toEqual("YAYA");

        CsdmDataModelService.getDevicesMap().then(function (devicesMap) {
          expect(Object.keys(devicesMap).length).toBe(initialDeviceCount + 1);
          expect(devicesMap[addedDevUrl].cisUuid).toEqual('a19b308a-AddedDevice-71898e423bec');
          expect(devicesMap[device1Url]).toBe(initialDevice1Reference);
        });
      });

      it('will keep references and remove a no longer returned device', function () {

        var deletedDeviceUrl = device1Url;

        var devicesWithOneRemoved = JSON.parse(JSON.stringify(initialHttpDevices));
        delete devicesWithOneRemoved[deletedDeviceUrl];

        var randomKeptDeviceUrl = Object.keys(devicesWithOneRemoved)[0];
        var randomKeptDevice = initialDeviceMap[randomKeptDeviceUrl];

        $httpBackend.expectGET(devicesUrl).respond(devicesWithOneRemoved);

        $timeout.flush(31000);

        $httpBackend.flush();

        expect(Object.keys(initialDeviceMap).length).toBe(initialDeviceCount - 1);

        expect(initialDeviceMap[deletedDeviceUrl]).toBeUndefined();

        //Make sure references are kept:
        expect(initialDeviceMap[randomKeptDeviceUrl]).toBe(randomKeptDevice);
      });

      it('will keep references and apply changes to a modified device', function () {

        var moddedDevUrl = device1Url;

        var devicesWithOneModified = JSON.parse(JSON.stringify(initialHttpDevices));

        var newDisplayName = "Modified Display Name";

        var moddedDeviceRef = initialDeviceMap[moddedDevUrl];

        devicesWithOneModified[moddedDevUrl].displayName = newDisplayName;

        $httpBackend.expectGET(devicesUrl).respond(devicesWithOneModified);

        $timeout.flush(31000);

        $httpBackend.flush();

        expect(Object.keys(initialDeviceMap).length).toBe(initialDeviceCount);
        expect(initialDeviceMap[moddedDevUrl].displayName).toEqual(newDisplayName);
        expect(initialDeviceMap[moddedDevUrl]).toBe(moddedDeviceRef);
      });
    });
  });
});
