'use strict';

angular.module('Core')
  .controller('LaunchSiteCtrl', ['$scope', '$sce', '$log',
    function ($scope, $sce, $log) {

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

    }
  ])
  .directive('launchSite', function () {
    return {
      restrict: 'EA',
      scope: {
        advancedSettings: '=',
        adminEmailParam: '=',
        userEmailParam: '=',
        webexAdvancedUrl: '='
      },
      templateUrl: 'modules/core/launchSite/launchSite.tpl.html'
    };
  });
