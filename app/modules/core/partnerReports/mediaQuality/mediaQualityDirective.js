(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucMediaQuality', ucMediaQuality);

  function ucMediaQuality() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/partnerReports/mediaQuality/mediaQuality.tpl.html'
    };

    return directive;
  }

})();
