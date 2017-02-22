(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucSingleNumberReach', ucSingleNumberReach);

  function ucSingleNumberReach() {
    var directive = {
      controller: 'SingleNumberReachInfoCtrl',
      controllerAs: 'snr',
      transclude: true,
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/snr/snr.tpl.html',
    };

    return directive;
  }

})();
