(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPlaceService($window, $http, Authinfo, CsdmConfigService, CsdmConverter, FeatureToggleService, $q) {

    var csdmPlacesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/places';
    var placesCache = {};
    var placesDeferred = $q.defer();

    function init() {
      fetchCsdmPlaces();
    }

    function fetchCsdmPlaces() {
      return placesFeatureIsEnabled()
        .then(function (res) {
          if (res) {
            return $http.get(csdmPlacesUrl)
              .then(function (res) {
                placesCache = CsdmConverter.convertPlaces(res.data);
              });
          } else {
            throw new Error('feature not enabled');
          }
        })
        .finally(function () {
          placesDeferred.resolve(placesCache);
        });
    }

    init();

    function getPlacesList() {
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
        name: name
      }).then(function (res) {
        var place = CsdmConverter.convertPlace(res.data);
        placesCache[place.url] = place;
        return place;
      });
    }

    function deletePlace(place) {
      return $http.delete(place.url).then(function () {
        delete placesCache[place.url];
      });
    }

    function createCsdmPlace(name, deviceType) {
      return $http.post(csdmPlacesUrl, {
        name: name,
        placeType: deviceType
      }).then(function (res) {
        var place = CsdmConverter.convertPlace(res.data);
        placesCache[place.url] = place;
        return place;
      });
    }

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      deletePlace: deletePlace,
      createCsdmPlace: createCsdmPlace,
      getPlacesList: getPlacesList,
      updatePlaceName: updatePlaceName
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
