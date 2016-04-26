(function () {
  'use strict';

  angular.module('Core')
    .directive('crUserServicesCard', crUserServicesCard);

  function crUserServicesCard() {
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      templateUrl: 'modules/core/users/userPreview/userServicesCard.tpl.html',
      link: function () {}
    };
  }
})();
