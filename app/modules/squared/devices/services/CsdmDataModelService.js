(function () {
  'use strict';

  /* @ngInject  */
  function CsdmDataModelService($q, CsdmCacheUpdater, CsdmDeviceService, CsdmCodeService, CsdmPlaceService, CsdmHuronOrgDeviceService, CsdmHuronPlaceService, CsdmPoller, CsdmConverter, CsdmHubFactory, Authinfo) {

    var placesUrl = CsdmPlaceService.getPlacesUrl();
    var huronPlacesUrl = CsdmHuronPlaceService.getPlacesUrl();

    var csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());

    var theDeviceMap = {};
    var placesDataModel = {};

    var cloudBerryDevicesLoaded = false;
    var codesLoaded = false;
    var huronDevicesLoaded = false;
    var cloudBerryPlacesLoaded = false;
    var huronPlacesLoaded = false;

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

        //First time: kick off get huron devices:

        csdmHuronOrgDeviceService.fetchDevices()
          .then(function (huronDeviceMap) {
            updateDeviceMap(huronDeviceMap, function (existing) {
              return !existing.isHuronDevice;
            });
          })
          .finally(setHuronDevicesLoaded);

        devicesFastFetchedDeferred = CsdmDeviceService.fetchDevices() //fast
          .then(function (deviceMap) {
            if (!slowResolved) {
              updateDeviceMap(deviceMap, function (existing) {
                return !existing.isCloudberryDevice;
              });
            }
          })
          .finally(setCloudBerryDevicesLoaded);
      }

      CsdmDeviceService.fetchDevices(true) //slow
        .then(function (deviceMapSlow) {
          slowResolved = true;
          updateDeviceMap(deviceMapSlow, function (existing) {
            return !existing.isCloudberryDevice;
          });
        })
        .finally(setCloudBerryDevicesLoaded);

      return devicesFetchedDeferred.promise;
    }

    function updateDeviceMap(deviceMap, keepFunction) {

      CsdmCacheUpdater.update(theDeviceMap, deviceMap, keepFunction, updateCodesToUsed);
      _.each(_.values(deviceMap), function (d) {
        if (d.accountType != 'PERSON') {
          addOrUpdatePlaceInDataModel(d);
        }
      });

      updatePlacesCache();
    }

    function updateCodesToUsed(addedDevice) {
      if (addedDevice.type == 'cloudberry' && !addedDevice.isCode) {
        _.each(_.values(theDeviceMap), function (d) {
          if (d.isCode && d.cisUuid == addedDevice.cisUuid) {
            d.isUsed = true;
          }
        });
      }
    }

    function setCloudBerryDevicesLoaded() {
      if (!cloudBerryDevicesLoaded) {
        cloudBerryDevicesLoaded = true;

        if (huronDevicesLoaded) {
          devicesFetchedDeferred.resolve(theDeviceMap);
        }
      }
    }

    function setHuronDevicesLoaded() {
      if (!huronDevicesLoaded) {
        huronDevicesLoaded = true;

        if (cloudBerryDevicesLoaded) {
          devicesFetchedDeferred.resolve(theDeviceMap);
        }
      }
    }

    function setCloudBerryPlacesLoaded() {
      cloudBerryPlacesLoaded = true;
      if (huronPlacesLoaded) {
        accountsFetchedDeferred.resolve(placesDataModel);
        updatePlacesCache();
      }
    }

    function setHuronPlacesLoaded() {
      huronPlacesLoaded = true;
      if (cloudBerryPlacesLoaded) {
        accountsFetchedDeferred.resolve(placesDataModel);
        updatePlacesCache();
      }
    }

    function fetchCodes() {
      codesFetchedDeferred = $q.defer();
      CsdmCodeService.fetchCodes()
        .then(function (codesMap) {

          updateDeviceMap(codesMap, function (existing) {
            return !(existing.isCode);
          });

        })
        .finally(function () {
          codesLoaded = true;
          codesFetchedDeferred.resolve(theDeviceMap);
        });

      return codesFetchedDeferred.promise;
    }

    function fetchAccounts() {
      accountsFetchedDeferred = $q.defer();
      CsdmPlaceService.getPlacesList()
        .then(function (accounts) {
          _.each(_.values(accounts), function (a) {
            addOrUpdatePlaceInDataModel(a);
          });
        })
        .finally(function () {
          setCloudBerryPlacesLoaded();
        });

      CsdmHuronPlaceService.getPlacesList()
        .then(function (huronPlaces) {
          _.each(_.values(huronPlaces), function (a) {
            addOrUpdatePlaceInDataModel(a);
          });
        })
        .finally(function () {
          setHuronPlacesLoaded();
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
            _.each(item.codes, function (code) {
              delete theDeviceMap[code.url];
            });
          } else {

            delete theDeviceMap[item.url];

            var placeUrl = getPlaceUrl(item);
            if (!item.isHuronDevice && placesDataModel[placeUrl]) { // we currently delete the place when delete cloudberry device

              delete placesDataModel[placeUrl].devices[item.url];  //delete all devices and codes in the place
              delete placesDataModel[placeUrl].codes[item.url];
              delete placesDataModel[placeUrl];

            }
          }
        });
    }

    function getPlaceUrl(item) {
      if (item.type == 'huron') {
        return huronPlacesUrl + item.cisUuid;
      } else {
        return placesUrl + item.cisUuid;
      }
    }

    function createCsdmPlace(name, type) {

      return CsdmPlaceService.createCsdmPlace(name, type)
        .then(function (place) {
          placesDataModel[place.url] = place;
          addOrUpdatePlaceInDataModel(place);
          return place;
        });
    }

    function createCmiPlace(name, directoryNumber) {

      return CsdmHuronPlaceService.createCmiPlace(name, directoryNumber)
        .then(function (place) {
          placesDataModel[place.url] = place;
          addOrUpdatePlaceInDataModel(place);
          return place;
        });
    }

    function createCodeForExisting(cisUuid) {
      return CsdmCodeService.createCodeForExisting(cisUuid)
        .then(function (newCode) {
          theDeviceMap[newCode.url] = newCode;
          updatePlacesCache();
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
          var placeUrl = getPlaceUrl(objectToUpdate);
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
      } else if (unknownDevice.isHuronDevice) {
        return csdmHuronOrgDeviceService;
      }
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

    function hasLoadedAllDeviceSources() {
      return cloudBerryDevicesLoaded && codesLoaded && huronDevicesLoaded;
    }

    function addOrUpdatePlaceInDataModel(item) {

      var newPlaceUrl = getPlaceUrl(item);
      var existingPlace = placesDataModel[newPlaceUrl];
      if (!existingPlace) {
        existingPlace = CsdmConverter.convertPlace({ url: newPlaceUrl, isPlace: true, devices: {}, codes: {} });
        placesDataModel[newPlaceUrl] = existingPlace;
      }
      CsdmConverter.updatePlaceFromItem(existingPlace, item);
    }

    function updatePlacesCache() {
      if (huronDevicesLoaded && cloudBerryDevicesLoaded && cloudBerryPlacesLoaded && huronPlacesLoaded) {
        _.mapValues(placesDataModel, function (p) {
          p.devices = _.pickBy(theDeviceMap, function (d) {
            return (!(d.isCode)) && d.cisUuid == p.cisUuid;
          });
          p.codes = _.pickBy(theDeviceMap, function (d) {
            return d.isCode && d.cisUuid == p.cisUuid;
          });
          return p;
        });
      }
    }

    function generatePlacesFromDevicesAndCodes() {
      if (!placesMapReadyDeferred) {
        placesMapReadyDeferred = $q.defer();
      }

      var getDevicesPromise = getDevicesMap();
      var getCodePromise = getCodesMap();

      getAccountsMap().then(function () {
        getDevicesPromise.then(function () {
          getCodePromise.then(function () {
            updatePlacesCache();
            placesMapReadyDeferred.resolve(placesDataModel);
          });
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
      hasLoadedAllDeviceSources: hasLoadedAllDeviceSources,
      createCodeForExisting: createCodeForExisting,
      createCsdmPlace: createCsdmPlace,
      createCmiPlace: createCmiPlace
    };
  }

  angular
    .module('Squared')
    .service('CsdmDataModelService', CsdmDataModelService);
}());
