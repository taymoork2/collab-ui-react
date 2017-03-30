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

    function getSearchPlacesList(searchStr) {
      return $http.get(csdmPlacesUrl + "?type=all&query=" + searchStr)
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

    function createCsdmPlace(name, entitlements, directoryNumber, externalNumber, externalLinkedAccounts, ussProps) {
      return createPlace(name, entitlements || ['webex-squared', 'spark'], directoryNumber, externalNumber, 'lyra_space', externalLinkedAccounts, ussProps);
    }

    function createCmiPlace(name, entitlements, directoryNumber, externalNumber) {
      return createPlace(name, entitlements || ['ciscouc'], directoryNumber, externalNumber, 'room');
    }

    function createPlace(name, entitlements, directoryNumber, externalNumber, machineType, externalLinkedAccounts, ussProps) {
      return $http.post(csdmPlacesUrl, {
        name: name,
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
        entitlements: entitlements,
        machineType: machineType,
        extLinkedAccts: externalLinkedAccounts,
        ussProps: ussProps,
      }).then(function (res) {
        var convertedPlace = CsdmConverter.convertPlace(res.data);
        // TODO: Don't need to set these here when CSDM returns the lines on place creation
        convertedPlace.directoryNumber = convertedPlace.directoryNumber || directoryNumber;
        convertedPlace.externalNumber = convertedPlace.externalNumber || externalNumber;
        return convertedPlace;
      });
    }

    function updatePlace(placeUrl, entitlements, directoryNumber, externalNumber, externalLinkedAccounts) {
      return $http.patch(placeUrl, {
        directoryNumber: directoryNumber,
        externalNumber: externalNumber,
        entitlements: entitlements,
        extLinkedAccts: externalLinkedAccounts,
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
      getSearchPlacesList: getSearchPlacesList,
    };
  }

  angular
    .module('Squared')
    .service('CsdmPlaceService', CsdmPlaceService);

})();
