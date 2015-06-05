(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucActiveUserPopulation', ucActiveUserPopulation);

  function ucActiveUserPopulation() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/partnerReports/activeUserPopulation/activeUserPopulation.tpl.html'
    };

    return directive;
  }

})();
