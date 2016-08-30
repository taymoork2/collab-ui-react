(function () {
  'use strict';

  /* @ngInject  */
  function CsdmHuronPlaceService($window, $http, Authinfo, CsdmConverter, FeatureToggleService, $q, HuronConfig) {

    var cmiPlacesUrl = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/places';
    var placesCache = {};
    var loadedData = false;

    function init() {
      fetchCmiPlaces();
    }

    function fetchCmiPlaces() {
      return placesFeatureIsEnabled()
        .then(function (res) {
          if (res) {
            return $http.get(cmiPlacesUrl)
              .then(function (res) {
                _.forEach(res.data.places, function (item) {
                  item.phones = !item.phones ? [] : item.phones;
                  item.type = 'huron';
                  item.entitlements = ['ciscouc'];
                  item = CsdmConverter.convertPlace(item);
                  placesCache[item.url] = item;
                });
                loadedData = true;
              });
          } else {
            loadedData = true;
            throw new Error('feature not enabled');
          }
        });
    }

    init();

    function getPlacesList() {
      return placesCache;
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

    function createCmiPlace(name, directoryNumber) {
      return $http.post(cmiPlacesUrl, {
        displayName: name,
        directoryNumber: directoryNumber
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
          var place = CsdmConverter.convertPlace(res.data);
          placesCache[place.url] = place;
          return place;
        });
      });
    }

    function dataLoaded() {
      return loadedData;
    }

    return {
      placesFeatureIsEnabled: placesFeatureIsEnabled,
      deletePlace: deletePlace,
      createCmiPlace: createCmiPlace,
      getPlacesList: getPlacesList,
      dataLoaded: dataLoaded,
      updatePlaceName: updatePlaceName
    };
  }

  angular
    .module('Squared')
    .service('CsdmHuronPlaceService', CsdmHuronPlaceService);

})();
