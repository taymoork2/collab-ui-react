'use strict';

angular.module('Core')
  .controller('LaunchSiteCtrl', ['$scope', '$sce', '$timeout',
    function ($scope, $sce, $timeout) {

      $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
      };

      $scope.getId = function (url) {
        var match = url.match(/^https?\:\/\/(([^:\/?#]*)(?:\:([0-9]+))?)/);
        console.log(match);
        return match[1].replace(/\./g, '-');
      };

      $scope.submitForm = function () {
        $timeout(function() {
          var id = '#hiddenButton-' + $scope.getId($scope.webexAdvancedUrl);
          angular.element(id).trigger('click');
        }, 0);
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
