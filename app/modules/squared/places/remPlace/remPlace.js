(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemPlaceController',

      /* @ngInject */
      function ($modalInstance, CsdmDataModelService, XhrNotificationService, place) {
        var rdc = this;
        rdc.place = place;

        rdc.deletePlace = function () {
          return CsdmDataModelService.deleteItem(rdc.place)
            .then(function () {
              $modalInstance.close();
            }, XhrNotificationService.notify);
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
            templateUrl: 'modules/squared/places/remPlace/remPlace.html',
            type: 'dialog'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
