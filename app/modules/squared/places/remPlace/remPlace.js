(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('RemPlaceController',

      /* @ngInject */
      function ($modalInstance, CsdmDataModelService, XhrNotificationService, place, $rootScope, $timeout) {
        var rdc = this;
        rdc.place = place;

        rdc.refreshPlaceList = function () {
          $rootScope.$broadcast('PLACE_LIST_UPDATED');
        };

        rdc.deletePlace = function () {
          return CsdmDataModelService.deleteItem(rdc.place)
            .then(function () {
              $modalInstance.close();
              $timeout(rdc.refreshPlaceList, 500);
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
