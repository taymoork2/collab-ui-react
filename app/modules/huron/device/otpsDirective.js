(function () {
  'use strict';

  angular
    .module('uc.device')
    .directive('ucOtps', ucOtps);

  function ucOtps() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/huron/device/otps.tpl.html',
      controller: 'OtpsCtrl',
      controllerAs: 'vm'
    };

    return directive;
  }

})();
