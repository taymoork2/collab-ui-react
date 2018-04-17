(function () {
  'use strict';

  angular
    .module('Core')
    .directive('multipleSubscriptions', multipleSubscriptions);

  //TODO: expand the template so only the template calls showLicenses
  function multipleSubscriptions() {
    var directive = {
      restrict: 'E',
      template: require('modules/core/users/userServices/multipleSubscriptions.tpl.html'),
      controller: 'MultipleSubscriptionsCtrl',
      controllerAs: 'multipleSubscriptions',
    };

    return directive;
  }
})();
