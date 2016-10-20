(function () {
  'use strict';

  angular.module('Core')
    .controller('LaunchSiteCtrl', LaunchSiteCtrl)
    .directive('launchSite', launchSite);

  /* @ngInject */
  function LaunchSiteCtrl($scope, $sce, $timeout) {

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.getId = function (url) {
      var match = url.match(/^https?:\/\/([^:\/?#]*)/);
      return match[1].replace(/\./g, '-');
    };

    $scope.submitForm = function () {
      $timeout(function () {
        var id = '#hiddenButton-' + $scope.getId($scope.webexAdvancedUrl);
        angular.element(id).trigger('click');
      }, 0);
    };

  }

  function launchSite() {
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
  }
})();
