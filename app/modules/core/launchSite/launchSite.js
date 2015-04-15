'use strict';

angular.module('Core')
  .controller('LaunchSiteCtrl', ['$scope', '$sce',
    function ($scope, $sce) {

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
