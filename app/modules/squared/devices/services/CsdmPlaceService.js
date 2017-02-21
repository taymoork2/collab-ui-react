(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPlaceService($http, Authinfo, CsdmConfigService, CsdmConverter) {

    var csdmPlacesUrl = CsdmConfigService.getUrl() + '/organization/' + Authinfo.getOrgId() + '/places/';

    function getPlacesUrl() {
      return csdmPlacesUrl;
    }

    function getPlacesList() {
      return $http.get(csdmPlacesUrl + "?shallow=true&type=all")
        .then(function (res) {
          return CsdmConverter.convertPlaces(res.data);
        });
    }

    function updateItemName(place, name) {
      return $http.patch(place.url, {
        name: name,
      }).then(function (res) {
        res.data.type = place.type;
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

    function createCsdmPlace(name, entitlements, directoryNumber, externalNumber) {
      return createPlace(name, entitlements || ['webex-squared'], directoryNumber, externalNumber, 'lyra_space');
    }

    function createCmiPlace(name, entitlements, directoryNumber, externalNumber) {
      return createPlace(name, entitlements || ['ciscouc'], directoryNumber, externalNumber, 'room');
    }

    function createPlace(name, entitlements, directoryNumber, externalNumber, machineType) {
      return $http.post(csdmPlacesUrl, {
        name: name,
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
        entitlements: entitlements,
        machineType: machineType,
      }).then(function (res) {
        var convertedPlace = CsdmConverter.convertPlace(res.data);
        // TODO: Don't need to set these here when CSDM returns the lines on place creation
        convertedPlace.directoryNumber = convertedPlace.directoryNumber || directoryNumber;
        convertedPlace.externalNumber = convertedPlace.externalNumber || externalNumber;
        return convertedPlace;
      });
    }

    function updatePlace(placeUrl, entitlements, directoryNumber, externalNumber) {
      return $http.patch(placeUrl, {
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
        entitlements: entitlements,
      }).then(function (res) {
        return CsdmConverter.convertPlace(res.data);
      });
    }

    return {
      deletePlace: deletePlace,
      deleteItem: deletePlace,
      fetchItem: fetchItem,
      createCsdmPlace: createCsdmPlace,
      createCmiPlace: createCmiPlace,
      getPlacesList: getPlacesList,
      updateItemName: updateItemName,
      getPlacesUrl: getPlacesUrl,
      updatePlace: updatePlace,
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
