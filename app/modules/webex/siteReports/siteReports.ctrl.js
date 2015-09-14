(function () {
  'use strict';

  angular.module('WebExReports').controller('ReportsCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$translate',
    '$filter',
    '$state',
    '$stateParams',
    '$sce',
    'reportService',
    'Notification',
    'Authinfo',
    'Config',
    function (
      $scope,
      $rootScope,
      $log,
      $translate,
      $filter,
      $state,
      $stateParams,
      $sce,
      reportService,
      Notification,
      Authinfo,
      Config
    ) {

      var x = 5;
      var y = 0;
      var z = x + y;

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      }; // trustSrc()

    }

  ]);
})();
