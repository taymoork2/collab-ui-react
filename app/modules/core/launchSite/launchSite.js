'use strict';

angular.module('Core')
  .controller('LaunchSiteCtrl', ['$scope', '$sce',
    function ($scope, $sce) {

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

      $scope.getId = function (url) {
        return url.match(/[0-9]+/)[0];
      };

      $scope.submitForm = function () {
        var id = '#hiddenButton-' + $scope.getId($scope.webexAdvancedUrl);
        angular.element(id).click();
      };

    }
  ])
  .directive('launchSite', function () {
    return {
      restrict: 'EA',
      scope: {
        advancedSettings: '@',
        adminEmailParam: '@',
        userEmailParam: '@',
        webexAdvancedUrl: '@'
      },
      templateUrl: 'modules/core/launchSite/launchSite.tpl.html'
    };
  });
