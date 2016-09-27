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
            return $http.get(csdmPlacesUrl)
              .then(function (res) {
                return CsdmConverter.convertPlaces(res.data);
              });
          } else {
            placesDeferred.reject('feature not enabled');
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

    function updatePlaceName(placeUrl, name) {
      return $http.put(placeUrl, {
        name: name
      }).then(function (res) {
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

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      deletePlace: deletePlace,
      deleteItem: deletePlace,
      createCsdmPlace: createCsdmPlace,
      getPlacesList: getPlacesList,
      updatePlaceName: updatePlaceName,
      getPlacesUrl: getPlacesUrl
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
