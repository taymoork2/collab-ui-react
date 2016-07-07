(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('RemPlaceController',

      /* @ngInject */
      function ($modalInstance, CsdmPlaceService, XhrNotificationService, place) {
        var rdc = this;

        rdc.deletePlace = function () {
          return CsdmPlaceService.deletePlace(place)
            .then($modalInstance.close, XhrNotificationService.notify);
        };
      }
    )
    .service('RemPlaceModal',
      /* @ngInject */
      function ($modal) {
        function open(place) {
          return $modal.open({
            resolve: {
              place: _.constant(place)
            },
            controllerAs: 'rdc',
            controller: 'RemPlaceController',
            templateUrl: 'modules/squared/places/remPlace/remPlace.html'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
