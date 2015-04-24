'use strict';
angular
  .module('Squared')
  .controller('CloudExtensionsCtrl', ['$log', '$rootScope', 'UserListService', '$scope', '$stateParams', '$translate', 'Authinfo',
    function ($log, $rootScope, UserListService, $scope, $stateParams, $translate, Authinfo) {
      $scope.isFusionCal = Authinfo.isFusionCal();
      $scope.currentUser = $stateParams.currentUser;
      $scope.entitlements = $stateParams.entitlements;

      var hasEntitlement = function (entitlement) {
        return $scope.currentUser.entitlements.indexOf(entitlement) > -1 ? true : false;
      };

      function init() {
        $scope.extensions = [];

        $scope.fusionCal = {
          name: $translate.instant('cloudExtensions.calendar'),
          route: 'user-overview.calendar',
          state: $translate.instant('cloudExtensions.off')
        };

        if ($scope.isFusionCal) {
          $scope.extensions.push($scope.fusionCal);
          if (hasEntitlement('squared-fusion-cal')) {
            $scope.fusionCal.state = $translate.instant('cloudExtensions.on');
          }
        }
      }

      init();

      $rootScope.$on('cal-entitlement-updated', function () {
        UserListService.getUser($scope.currentUser.userName, function (data) {
          if (data.success) {
            $scope.currentUser = data.Resources[0];
            $stateParams.currentUser = data.Resources[0];
            if (hasEntitlement('squared-fusion-cal')) {
              $scope.fusionCal.state = $translate.instant('cloudExtensions.on');
            } else {
              $scope.fusionCal.state = $translate.instant('cloudExtensions.off');
            }
          }
        });
      });

    }
  ])
  .directive('sqCloudExtensions', [
    function () {
      return {
        restrict: 'E',
        scope: false,
        controller: 'CloudExtensionsCtrl',
        templateUrl: 'modules/squared/cloudExtensions/cloudExtensions.tpl.html'
      };
    }
  ]);
