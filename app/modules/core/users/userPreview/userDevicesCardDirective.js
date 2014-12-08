(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crUserDevicesCard', crUserDevicesCard);

  function crUserDevicesCard() {
    var directive = {
      restrict: 'EA',
      transclude: true,
      templateUrl: 'modules/core/users/userPreview/userDevicesCard.tpl.html'
    };

    return directive;
  }

})();
