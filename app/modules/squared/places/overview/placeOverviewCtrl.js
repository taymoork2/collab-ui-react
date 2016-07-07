(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PlaceOverviewCtrl', PlaceOverviewCtrl);

  /* @ngInject */
  function PlaceOverviewCtrl($state, XhrNotificationService, $stateParams, CsdmPlaceService, RemPlaceModal, CsdmHuronUserDeviceService) {
    var placeOverview = this;

    placeOverview.currentPlace = $stateParams.currentPlace;

    placeOverview.csdmHuronUserDeviceService = CsdmHuronUserDeviceService.create($stateParams.currentPlace.cisUuid);

    placeOverview.save = function (newName) {
      return CsdmPlaceService
        .updatePlaceName(placeOverview.currentPlace.url, newName)
        .catch(XhrNotificationService.notify);
    };

    placeOverview.showDeviceDetails = function (device) {
      $state.go('place-overview.csdmDevice', {
        currentDevice: device,
        huronDeviceService: placeOverview.csdmHuronUserDeviceService
      });
    };

    placeOverview.deletePlace = function () {
      RemPlaceModal
        .open(placeOverview.currentPlace)
        .then($state.sidepanel.close);
    };

  }
})();
