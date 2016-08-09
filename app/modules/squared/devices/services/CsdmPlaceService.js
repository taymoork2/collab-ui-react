(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPlaceService($window, $http, Authinfo, CsdmConfigService, CsdmConverter, FeatureToggleService, $q, HuronConfig) {

    var csdmPlacesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/places';
    var cmiPlacesUrl = HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/places';
    var placesMap = {};
    var loadedData = false;

    function init() {
      fetchAllPlaces();
    }

    function fetchCsdmPlaces() {
      return $http.get(csdmPlacesUrl)
        .then(function (res) {
          return CsdmConverter.convertPlaces(res.data);
        });
    }

    function fetchCmiPlaces() {
      var placeList = [];
      return $http.get(cmiPlacesUrl)
        .then(function (res) {
          _.forEach(res.data.places, function (item) {
            item.phones = !item.phones ? [] : item.phones;
            item.type = 'huron';
            item.entitlements = ['ciscouc'];
            item = CsdmConverter.convertPlace(item);
            placeList.push(item);
          });
          return placeList;
        });
    }

    function fetchAllPlaces() {
      return placesFeatureIsEnabled()
        .then(function (res) {
          if (res) {
            return $q.all([fetchCmiPlaces(), fetchCsdmPlaces()]);
          } else {
            loadedData = true;
            throw new Error('feature not enabled');
          }
        })
        .then(function (res) {
          loadedData = true;
          placesMap = _.chain({})
            .extend(res[0])
            .extend(res[1])
            .values()
            .value();
        }, function () {
          loadedData = true;
        });
    }

    init();

    function getPlacesList() {
      return placesMap;
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
        placesMap[place.url] = place;
        return place;
      });
    }

    function deletePlace(place) {
      return $http.delete(place.url).then(function () {
        delete placesMap[place.url];
      });
    }

    function createCsdmPlace(name, deviceType) {
      return $http.post(csdmPlacesUrl, {
        name: name,
        placeType: deviceType
      }).then(function (res) {
        var place = CsdmConverter.convertPlace(res.data);
        placesMap[place.url] = place;
        return place;
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
          placesMap[place.url] = place;
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
      createCsdmPlace: createCsdmPlace,
      createCmiPlace: createCmiPlace,
      getPlacesList: getPlacesList,
      dataLoaded: dataLoaded,
      updatePlaceName: updatePlaceName
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
