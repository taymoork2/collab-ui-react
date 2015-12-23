(function () {
  'use strict';

  angular.module('Huron')
    .directive('hrServiceAddress', hrServiceAddress);

  /* @ngInject */
  function hrServiceAddress() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/huron/serviceAddress/serviceAddress.tpl.html',
      controller: ServiceAddressCtrl,
      scope: {
        address: '=',
        readOnly: '='
      }
    };

    return directive;
  }

  /* @ngInject */
  function ServiceAddressCtrl($scope, TerminusStateService) {
    TerminusStateService.query().$promise.then(function (states) {
      $scope.stateOptions = _.map(states, function (state) {
        return state.abbreviation;
      });
    });
  }
})();
