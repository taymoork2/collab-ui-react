(function () {
  'use strict';

  /* @ngInject  */
  function CsdmDataModelService($q, CsdmCacheUpdater, CsdmDeviceService, CsdmCodeService, CsdmPlaceService, CsdmPoller, CsdmHubFactory) {

    var placesUrl = CsdmPlaceService.getPlacesUrl();

    var theDeviceMap = {};
    var placesDataModel = {};

    var devicesLoaded = false;

    var devicesFetchedDeferred;
    var devicesFastFetchedDeferred;
    var placesMapReadyDeferred;
    var codesFetchedDeferred;
    var accountsFetchedDeferred;
    var slowResolved;

    function fetchDevices() {
      devicesFetchedDeferred = devicesFetchedDeferred || $q.defer();
      if (slowResolved === false) {
        return devicesFetchedDeferred.promise;
      }
      slowResolved = false;
      if (!devicesFastFetchedDeferred) {
        devicesFastFetchedDeferred = CsdmDeviceService.fetchDevices() //fast
          .then(function (deviceMap) {
            if (!slowResolved) {
              updateDeviceMap(deviceMap);
            }
          })
          .finally(updatePlaceMapFromDeviceMapAndSetLoaded);
      }

      CsdmDeviceService.fetchDevices(true) //slow
        .then(function (deviceMapSlow) {
          slowResolved = true;
          updateDeviceMap(deviceMapSlow);
        })
        .finally(updatePlaceMapFromDeviceMapAndSetLoaded);

      return devicesFetchedDeferred.promise;
    }

    function updateDeviceMap(deviceMap) {

      CsdmCacheUpdater.update(theDeviceMap, deviceMap, function (existing) { return existing.isCode; });

      _.each(_.values(deviceMap), function (d) {
        addOrUpdatePlaceInDataModel(d.cisUuid, d.type, d.displayName);
      });
    }

    function updatePlaceMapFromDeviceMapAndSetLoaded() {
      if (!devicesLoaded) {
        devicesFetchedDeferred.resolve(theDeviceMap);
      }
      devicesLoaded = true;
      updatePlacesCache(theDeviceMap);
    }

    function fetchCodes() {
      codesFetchedDeferred = $q.defer();
      CsdmCodeService.fetchCodes()
        .then(function (codesMap) {
          CsdmCacheUpdater.update(theDeviceMap, codesMap, function (existing) { return !(existing.isCode); });
          _.each(_.values(codesMap), function (d) {
            addOrUpdatePlaceInDataModel(d.cisUuid, d.type, d.displayName);
          });
        })
        .finally(function () {
          codesFetchedDeferred.resolve(theDeviceMap);
          updatePlacesCache(theDeviceMap);
        });

      return codesFetchedDeferred.promise;
    }

    function fetchAccounts() {
      accountsFetchedDeferred = $q.defer();
      CsdmPlaceService.getPlacesList()
        .then(function (accounts) {
          _.each(_.values(accounts), function (d) {
            addOrUpdatePlaceInDataModel(d.cisUuid, d.type, d.displayName);
          });
        })
        .finally(function () {
          accountsFetchedDeferred.resolve(placesDataModel);
        });

      return accountsFetchedDeferred.promise;
    }

    function getDevicesMap() {
      if (!devicesFetchedDeferred) {
        fetchDevices();
      }

      getCodesMap();

      return devicesFetchedDeferred.promise;
    }

    function getCodesMap() {
      if (!codesFetchedDeferred) {
        fetchCodes();
      }
      return codesFetchedDeferred.promise;
    }

    function getAccountsMap() {
      if (!accountsFetchedDeferred) {
        fetchAccounts();
      }
      return accountsFetchedDeferred.promise;
    }

    function deleteItem(item) {
      var service = getServiceForDevice(item);
      if (!service) {
        return $q.reject();
      }

      return service.deleteItem(item)
        .then(function () {
          if (item.isPlace) {
            delete placesDataModel[item.url];
            _.each(item.devices, function (dev) {
              delete theDeviceMap[dev.url];
            });
          } else {
            var device = theDeviceMap[item.url];
            delete theDeviceMap[item.url];
            if (placesDataModel[placesUrl + device.cisUuid]) { // we currently delete the place when delete device
              delete placesDataModel[placesUrl + device.cisUuid];
            }
          }
        });
    }

    function createCsdmPlace(name, type) {

      return CsdmPlaceService.createCsdmPlace(name, type)
        .then(function (place) {

          placesDataModel[place.url] = place;
          addOrUpdatePlaceInDataModel(place.cisUuid, "cloudberry", place.displayName);
          return place;
        });
    }

    function createCodeForExisting(cisUuid) {
      return CsdmCodeService.createCodeForExisting(cisUuid)
        .then(function (newCode) {
          theDeviceMap[newCode.url] = newCode;
          updatePlacesCache(theDeviceMap);
          return newCode;
        });
    }

    function updateItemName(objectToUpdate, newName) {
      var service = getServiceForDevice(objectToUpdate);
      if (!service) {
        return $q.reject();
      }

      return service.updateItemName(objectToUpdate, newName)
        .then(function () {
          var placeUrl = placesUrl + objectToUpdate.cisUuid;
          placesDataModel[placeUrl].displayName = newName;
          var device = theDeviceMap[objectToUpdate.url];
          device.displayName = newName;
          return device;
        });
    }

    function getServiceForDevice(unknownDevice) {
      if (unknownDevice.isCloudberryDevice) {
        return CsdmDeviceService;
      } else if (unknownDevice.isCode) {
        return CsdmCodeService;
      } else if (unknownDevice.isPlace) {
        return CsdmPlaceService;
      }
      /*else if (unknownDevice.isHuronDevice) {
       return huronDeviceService;
       }*/
    }

    function updateTags(objectToUpdate, newTags) {

      var service = getServiceForDevice(objectToUpdate);
      if (!service) {
        return $q.reject();
      }
      return service.updateTags(objectToUpdate.url, newTags)
        .then(function () {
          objectToUpdate.tags = newTags;

          var existingDevice = theDeviceMap[objectToUpdate.url];
          if (existingDevice && existingDevice !== objectToUpdate) {
            existingDevice.tags = newTags;
          }

          return objectToUpdate;
        });
    }

    function reloadDevice(device) {
      var service = getServiceForDevice(device);
      if (!service) {
        return $q.reject();
      }

      return service.fetchDevice(device.url).then(function (reloadedDevice) {

        CsdmCacheUpdater.updateOne(theDeviceMap, device.url, reloadedDevice);
        return theDeviceMap[device.url];
      });
    }

    function hasDevices() {
      return theDeviceMap && Object.keys(theDeviceMap).length > 0;
    }

    function hasLoadedAnyData() {
      return devicesLoaded;
    }

    function addOrUpdatePlaceInDataModel(cisUuid, fromDeviceType, displayName) {

      var newPlaceUrl = placesUrl + cisUuid;
      var existingPlace = placesDataModel[newPlaceUrl];

      if (!existingPlace) {
        existingPlace = { url: newPlaceUrl, isPlace: true, devices: [], codes: [] };
        placesDataModel[newPlaceUrl] = existingPlace;
      }

      existingPlace.type = fromDeviceType || existingPlace.type;
      existingPlace.cisUuid = cisUuid;
      existingPlace.displayName = displayName;
    }

    function updatePlacesCache(deviceMap) {

      _.mapValues(placesDataModel, function (p) {

        p.devices = _.filter(deviceMap, function (d) {
          return (!(d.isCode)) && d.cisUuid == p.cisUuid;
        });

        p.codes = _.filter(deviceMap, function (d) {
          return d.isCode && d.cisUuid == p.cisUuid;
        });
        return p;
      });
    }

    function generatePlacesFromDevicesAndCodes() {
      if (!placesMapReadyDeferred) {
        placesMapReadyDeferred = $q.defer();
      }

      var getDevicesPromise = getDevicesMap();
      var getCodePromise = getCodesMap();

      getAccountsMap();

      getDevicesPromise.then(function () {
        getCodePromise.then(function () {

          placesMapReadyDeferred.resolve(placesDataModel);
        });
      });
    }

    function getPlacesMap() {
      if (!placesMapReadyDeferred) {
        generatePlacesFromDevicesAndCodes();
      }
      return placesMapReadyDeferred.promise;
    }

    function devicePollerOn(event, listener, opts) {
      var hub = CsdmHubFactory.create();
      CsdmPoller.create(fetchDevices, hub);
      hub.on(event, listener, opts);
    }

    return {
      devicePollerOn: devicePollerOn,
      getPlacesMap: getPlacesMap,
      getDevicesMap: getDevicesMap,
      deleteItem: deleteItem,
      updateItemName: updateItemName,
      updateTags: updateTags,
      reloadDevice: reloadDevice,
      hasDevices: hasDevices,
      hasLoadedAnyData: hasLoadedAnyData,
      createCodeForExisting: createCodeForExisting,
      createCsdmPlace: createCsdmPlace
    };
  }

  angular
    .module('Squared')
    .service('CsdmDataModelService', CsdmDataModelService);
}());
