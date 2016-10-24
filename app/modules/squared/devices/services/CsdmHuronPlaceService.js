(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronPlaceService($window, $http, Authinfo, CsdmConverter, FeatureToggleService, $q, HuronConfig) {

    var cmiOtpUri = HuronConfig.getCmiUrl() + '/identity/machines/otp';
    var cmiPlacesUrl = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/places/';

    var placesDeferred;

    function fetchCmiPlaces() {
      var placesCache = {};
      return placesFeatureIsEnabled()
        .then(function (res) {
          if (res) {
            return $http.get(cmiPlacesUrl)
              .then(function (res) {
                _.forEach(res.data.places, function (item) {
                  item.phones = !item.phones ? [] : CsdmConverter.convertHuronDevices(item.phones);
                  item.type = 'huron';
                  item.entitlements = ['ciscouc'];
                  item = CsdmConverter.convertPlace(item);
                  placesCache[item.url] = item;

                  item.displayName = item.displayName;
                });
              });
          } else {
            placesDeferred.reject('feature not enabled');
          }
        })
        .finally(function () {
          placesDeferred.resolve(placesCache);
        });
    }

    function getPlacesUrl() {
      return cmiPlacesUrl;
    }

    function getPlacesList() {

      if (!placesDeferred) {
        placesDeferred = $q.defer();
        fetchCmiPlaces();
      }

      return placesDeferred.promise;
    }

    function placesFeatureIsEnabled() {
      if ($window.location.search.indexOf("enablePlaces=true") > -1) {
        return $q.when(true);
      } else {
        return FeatureToggleService.supports(FeatureToggleService.features.csdmPlaces);
      }
    }

    function updatePlaceName(placeUrl, name) {
      return $http.put(placeUrl, {
        displayName: name
      });
    }

    function deletePlace(place) {
      return $http.delete(place.url);
    }

    function createOtp(machineUuid) {
      return $http.post(cmiOtpUri, {
        machineUuid: machineUuid
      }).then(function (res) {
        var activationCode = {
          activationCode: res.data.password,
          expiryTime: res.data.expiresOn,
          cisUuid: machineUuid
        };
        return activationCode;
      });
    }

    function createCmiPlace(name, directoryNumber, externalNumber) {
      return $http.post(cmiPlacesUrl, {
        displayName: name,
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
      }, {
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      }).then(function (res) {
        var location = res.headers('Location');
        return $http.get(location).then(function (res) {
          res.data.phones = !res.data.phones ? [] : res.data.phones;
          res.data.type = 'huron';
          res.data.entitlements = ['ciscouc'];
          return CsdmConverter.convertPlace(res.data);
        });
      });
    }

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      deleteItem: deletePlace,
      deletePlace: deletePlace,
      createCmiPlace: createCmiPlace,
      getPlacesList: getPlacesList,
      updatePlaceName: updatePlaceName,
      createOtp: createOtp,
      getPlacesUrl: getPlacesUrl
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronPlaceService', CsdmHuronPlaceService);

})();
