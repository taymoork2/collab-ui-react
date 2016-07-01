(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPlaceService($window, $http, Authinfo, CsdmConfigService, CsdmConverter, FeatureToggleService, $q) {

    var placesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/places';

    var placesList = [];
    var loadedData = false;

    function init(){
      fetchPlaces();
    }

    function fetchPlaces() {
      placesFeatureIsEnabled().then(function (res) {
        if (res) {
          return $http.get(placesUrl).then(function (res) {
            loadedData = true;
            placesList = CsdmConverter.convertPlaces(res.data);
          }, function () {
            loadedData = true;
          });
        } else {
          loadedData = true;
        }
      });

    }

    init();

    function placesFeatureIsEnabled() {
      if ($window.location.search.indexOf("enablePlaces=true") > -1) {
        return $q.when(true);
      } else {
        return FeatureToggleService.supports(FeatureToggleService.features.csdmPlaces);
      }
    }

    function getPlacesList() {
      return placesList;
    }

    function updatePlaceName(placeUrl, name) {
      return $http.put(placeUrl, {
        name: name
      }).then(function (res) {
        var place = CsdmConverter.convertPlace(res.data);
        placesList[place.url] = place;
        return place;
      });
    }

    function deletePlace(place) {
      return $http.delete(place.url).then(function (res) {
        delete placesList[place.url];
      });
    }

    function createPlace(name, deviceType) {
      return $http.post(placesUrl, {
        name: name,
        placeType: deviceType
      }).then(function (res) {
        var place = CsdmConverter.convertPlace(res.data);
        placesList[place.url] = place;
        return place;
      });
    }

    function dataLoaded() {
      return loadedData;
    }

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      deletePlace: deletePlace,
      createPlace: createPlace,
      getPlacesList: getPlacesList,
      updatePlaceName: updatePlaceName,
      dataLoaded: dataLoaded
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
