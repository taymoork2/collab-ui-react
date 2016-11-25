(function () {
  'use strict';

  /* @ngInject  */
  function CsdmDataModelService($q, $timeout, $rootScope, CsdmCacheUpdater, CsdmDeviceService, CsdmCodeService, CsdmPlaceService, CsdmHuronOrgDeviceService, CsdmHuronPlaceService, CsdmPoller, CsdmConverter, CsdmHubFactory, Authinfo, FeatureToggleService) {

    var placesUrl = CsdmPlaceService.getPlacesUrl();

    var csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());

    var theDeviceMap = {};
    var placesDataModel = {};

    var cloudBerryDevicesLoaded = false;
    var huronDevicesLoaded = false;
    var placesLoaded = false;
    var pollingGracePeriodActive = true;

    var devicesFetchedDeferred;
    var devicesFastFetchedDeferred;
    var placesMapReadyDeferred;
    var accountsFetchedDeferred;
    var slowResolved;

    function fetchDevices() {
      devicesFetchedDeferred = devicesFetchedDeferred || $q.defer();
      if (slowResolved === false) {
        return devicesFetchedDeferred.promise;
      }
      slowResolved = false;
      if (!devicesFastFetchedDeferred) {

        //First time: kick off get huron devices: //If we disable device polling,
        // we could move csdmHuronOrgDeviceService.fetch out of (!devicesFastFetchedDeferred)
        // so it is refreshed on "single poll"

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

      CsdmCacheUpdater.update(theDeviceMap, deviceMap, keepFunction);
      _.each(_.values(deviceMap), function (d) {
        if (d.accountType != 'PERSON') {
          addOrUpdatePlaceInDataModel(d);
        }
      });

      updatePlacesCache();
    }

    function subscribeToChanges(scope, callback) {
      var unRegister = $rootScope.$on('PLACES_OR_DEVICES_UPDATED', callback);
      scope.$on('$destroy', unRegister);
      return unRegister;
    }

    function notifyDevicesInPlace(cisUuid, event) {
      var place = placesDataModel[placesUrl + cisUuid];
      if (place) {
        _.each(place.devices, function (d) {
          CsdmDeviceService.notifyDevice(d.url, event);
        });
      }
    }

    function notifyListeners() {
      $rootScope.$emit('PLACES_OR_DEVICES_UPDATED');
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

    function setPlacesLoaded() {
      placesLoaded = true;
      accountsFetchedDeferred.resolve(placesDataModel);
      updatePlacesCache();
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
          setPlacesLoaded();
        });
      return accountsFetchedDeferred.promise;
    }

    function getDevicesMap() {
      if (!devicesFetchedDeferred) {
        fetchDevices();
      }

      return devicesFetchedDeferred.promise;
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
            _.unset(placesDataModel, [item.url]);
            _.each(item.devices, function (dev) {
              _.unset(theDeviceMap, [dev.url]);
            });
          } else {
            _.unset(theDeviceMap, [item.url]);
            var placeUrl = getPlaceUrl(item);
            if (placesDataModel[placeUrl]) {
              _.unset(placesDataModel, [placeUrl, 'devices', item.url]); // delete device from the place
              if (item.isCloudberryDevice) {
                return FeatureToggleService.csdmPlacesGetStatus().then(function (result) {
                  if (!result) { // Places is disabled, delete the place
                    return CsdmPlaceService.deleteItem(placesDataModel[placeUrl]).then(function () {
                      _.unset(placesDataModel, [placeUrl]);
                      notifyListeners();
                    });
                  }
                  notifyListeners();
                });
              }
            }
          }
          notifyListeners();
        });
    }

    function getPlaceUrl(device) {
      return placesUrl + device.cisUuid;
    }

    function createCsdmPlace(name, entitlements, directoryNumber, externalNumber) {
      return CsdmPlaceService.createCsdmPlace(name, entitlements, directoryNumber, externalNumber)
        .then(addPlaceToDataModel);
    }

    function createCmiPlace(name, directoryNumber, externalNumber) {
      return CsdmHuronPlaceService.createCmiPlace(name, directoryNumber, externalNumber)
        .then(addPlaceToDataModel);
    }

    function updateCloudberryPlace(objectToUpdate, entitlements, directoryNumber, externalNumber) {
      var placeUrl = getPlaceUrl(objectToUpdate);
      return CsdmPlaceService.updatePlace(placeUrl, entitlements, directoryNumber, externalNumber)
        .then(function (place) {
          addOrUpdatePlaceInDataModel(place);
          notifyListeners();
          return place;
        });
    }

    function createCodeForExisting(cisUuid) {
      return CsdmCodeService.createCodeForExisting(cisUuid);
    }

    function updateItemName(objectToUpdate, newName) {
      var service = getServiceForDevice(objectToUpdate);
      if (!service) {
        return $q.reject();
      }

      return service.updateItemName(objectToUpdate, newName)
        .then(function (updatedObject) {

          if (updatedObject.isPlace) {
            var place = placesDataModel[updatedObject.url];
            updatedObject.devices = place.devices;
            return CsdmCacheUpdater.updateOne(placesDataModel, updatedObject.url, updatedObject, null, true);
          } else {
            addOrUpdatePlaceInDataModel(updatedObject);
            return CsdmCacheUpdater.updateOne(theDeviceMap, updatedObject.url, updatedObject, null, true);
          }
        });
    }

    function getServiceForDevice(unknownDevice) {
      if (unknownDevice.isCloudberryDevice) {
        return CsdmDeviceService;
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

    function reloadItem(item) {
      var service = getServiceForDevice(item);
      if (!service) {
        return $q.reject();
      }

      if (item.isPlace) {
        if (item.type === 'huron') {
          return csdmHuronOrgDeviceService.getDevicesForPlace(item.cisUuid).then(function (devicesForPlace) {

            var reloadedPlace = placesDataModel[item.url];
            for (var devUrl in devicesForPlace) {
              var device = devicesForPlace[devUrl];
              if (device.displayName) {
                item.displayName = device.displayName;
                reloadedPlace.displayName = device.displayName;
              }
              CsdmCacheUpdater.updateOne(theDeviceMap, devUrl, device);
            }

            reloadedPlace.devices = devicesForPlace;
            item.devices = devicesForPlace;

            notifyListeners();
            return reloadedPlace;
          });
        } else {
          return $q.reject();
        }
      } else if (item.type === 'huron') {
        return $q.reject();
      } else {
        return service.fetchItem(item.url).then(function (reloadedDevice) {
          CsdmCacheUpdater.updateOne(theDeviceMap, item.url, reloadedDevice);
          notifyListeners();
          return reloadedDevice;
        });
      }
    }

    function hasDevices() {
      return theDeviceMap && Object.keys(theDeviceMap).length > 0;
    }

    function hasLoadedAllDeviceSources() {
      return cloudBerryDevicesLoaded && huronDevicesLoaded;
    }

    function addPlaceToDataModel(place) {
      placesDataModel[place.url] = place;
      addOrUpdatePlaceInDataModel(place);
      notifyListeners();
      return place;
    }

    function addOrUpdatePlaceInDataModel(item) {

      var newPlaceUrl = getPlaceUrl(item);
      var existingPlace = placesDataModel[newPlaceUrl];

      if (!existingPlace) {
        existingPlace = CsdmConverter.convertPlace({ url: newPlaceUrl, isPlace: true, devices: {} });
        placesDataModel[newPlaceUrl] = existingPlace;
      }
      CsdmConverter.updatePlaceFromItem(existingPlace, item);
    }

    function updatePlacesCache() {
      if (huronDevicesLoaded && cloudBerryDevicesLoaded && placesLoaded) {
        _.mapValues(placesDataModel, function (p) {
          p.devices = _.pickBy(theDeviceMap, function (d) {
            return d.cisUuid == p.cisUuid;
          });
          return p;
        });
        notifyListeners();
      }
    }

    function startPollingGracePeriod() {

      $timeout(function () {
        pollingGracePeriodActive = false;
      }, 30000);
    }

    function retrieveDevicesAndAccountsAndGeneratePlaceMap() {

      var placesMapReadyPromise = $q.defer();
      var getDevicesPromise = getDevicesMap();

      getAccountsMap().then(function () {
        getDevicesPromise.then(function () {
          startPollingGracePeriod();
          updatePlacesCache();
          placesMapReadyPromise.resolve(placesDataModel);
        });
      });

      return placesMapReadyPromise;
    }

    function reFetchDevicesAndAccountsAndGeneratePlaceMap() {

      var placesMapReadyPromise = $q.defer();
      var getDevicesPromise = fetchDevices();

      fetchAccounts().then(function () {
        getDevicesPromise.then(function () {
          startPollingGracePeriod();
          updatePlacesCache();
          placesMapReadyPromise.resolve(placesDataModel);
        });
      });

      return placesMapReadyPromise;
    }

    function getPlacesMap(refreshIfOld) {

      if (!placesMapReadyDeferred) {
        placesMapReadyDeferred = retrieveDevicesAndAccountsAndGeneratePlaceMap();
      } else if (refreshIfOld && !pollingGracePeriodActive) {
        reFetchDevicesAndAccountsAndGeneratePlaceMap();
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
      reloadItem: reloadItem,
      hasDevices: hasDevices,
      hasLoadedAllDeviceSources: hasLoadedAllDeviceSources,
      createCodeForExisting: createCodeForExisting,
      createCsdmPlace: createCsdmPlace,
      createCmiPlace: createCmiPlace,
      updateCloudberryPlace: updateCloudberryPlace,
      subscribeToChanges: subscribeToChanges,
      notifyDevicesInPlace: notifyDevicesInPlace
    };
  }

  angular
    .module('Squared')
    .service('CsdmDataModelService', CsdmDataModelService);
}());
