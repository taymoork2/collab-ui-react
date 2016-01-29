(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucMediaQualityCustomer', ucMediaQualityCustomer);

  function ucMediaQualityCustomer() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/mediaQuality/mediaQuality.tpl.html'
    };

    return directive;
  }

})();
