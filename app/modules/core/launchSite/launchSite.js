'use strict';

angular.module('Core')
  .controller('LaunchSiteCtrl', ['$scope', '$sce',
    function ($scope, $sce) {

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

      $scope.getId = function (url) {
        var domain = new URL($scope.webexAdvancedUrl).hostname;
        return domain.replace(/\./g, '-');
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
