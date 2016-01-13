'use strict';

angular.module('Core')
  .controller('enterEmailAddrController', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', '$log', 'Userservice',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, $log, Userservice) {

      $scope.handleEnterEmailAddr = function () {
        if (!$scope.email || 0 === $scope.email.trim()) {
          $scope.error = "The email address cannot be blank";
          return;
        }
        Userservice.getUserFromEmail(
          $scope.email,
          function (data, status) {
            if (status != 200 || !data.success) {
              $log.error("getUserFromEmail failed. Status: " + status);
            } else {
              $window.location.href = (data.message == "true" ? "/#/drLoginForward" : "/#/createAccount") + "?email=" + $scope.email;
            }
          });
      };

    }
  ]);
