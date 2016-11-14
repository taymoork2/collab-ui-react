(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPlaceService($window, $http, Authinfo, CsdmConfigService, CsdmConverter, FeatureToggleService, $q) {

    var csdmPlacesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/places/';

    function getPlacesUrl() {
      return csdmPlacesUrl;
    }

    function getPlacesList() {
      return placesFeatureIsEnabled()
        .then(function (res) {
          if (res) {
            return $http.get(csdmPlacesUrl + "?shallow=true&type=all")
              .then(function (res) {
                return CsdmConverter.convertPlaces(res.data);
              });
          } else {
            return $q.reject('feature not enabled');
          }
        });
    }

    function placesFeatureIsEnabled() {
      if ($window.location.search.indexOf("enablePlaces=true") > -1) {
        return $q.when(true);
      } else {
        return FeatureToggleService.supports(FeatureToggleService.features.csdmPlaces);
      }
    }

    function updateItemName(place, name) {
      return $http.patch(place.url, {
        name: name
      }).then(function (res) {
        return CsdmConverter.convertPlace(res.data);
      });
    }

    function fetchItem(placeUrl) {
      return $http.get(placeUrl).then(function (res) {
        return CsdmConverter.convertPlace(res.data);
      });
    }

    function deletePlace(place) {
      return $http.delete(place.url);
    }

    function createCsdmPlace(name, deviceType) {
      return $http.post(csdmPlacesUrl, {
        name: name,
        placeType: deviceType
      }).then(function (res) {
        return CsdmConverter.convertPlace(res.data);
      });
    }

    function updatePlace(placeUrl, entitlements, directoryNumber, externalNumber) {
      return $http.patch(placeUrl, {
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
        entitlements: entitlements
      }).then(function (res) {
        return CsdmConverter.convertPlace(res.data);
      });
    }

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      deletePlace: deletePlace,
      deleteItem: deletePlace,
      fetchItem: fetchItem,
      createCsdmPlace: createCsdmPlace,
      getPlacesList: getPlacesList,
      updateItemName: updateItemName,
      getPlacesUrl: getPlacesUrl,
      updatePlace: updatePlace
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
