(function () {
  'use strict';

  angular
    .module('Core')
    .controller('userRedirectCtrl', userRedirectCtrl);

  /*ng-Inject*/
  function userRedirectCtrl($scope, $window) {

    // Remove when Microsoft fixes flexbox problem when min-height is defined (in messagebox-small).
    function isIe() {
      return false || ($window.navigator.userAgent.indexOf('MSIE') > 0 || $window.navigator.userAgent.indexOf('Trident') > 0);
    }

    $scope.checkForIeWorkaround = function () {
      if (isIe()) {
        return "vertical-ie-workaround";
      } else {
        return "";
      }
    };
  }
})();
