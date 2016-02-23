(function () {
  'use strict';

  angular
    .module('Core')
    .directive('multipleSubscriptions', multipleSubscriptions);

  //TODO: Move showLicenses function into a Service instead of leaving it in the controller
  function multipleSubscriptions() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/users/userServices/multipleSubscriptions.tpl.html',
      controller: 'MultipleSubscriptionsCtrl',
      controllerAs: 'multipleSubscriptions'
    };

    return directive;
  }

})();
