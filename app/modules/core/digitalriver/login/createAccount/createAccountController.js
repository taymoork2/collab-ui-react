'use strict';

angular.module('Core')
  .controller('createAccountController', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', '$log', 'Userservice', '$cookies',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, $log, Userservice, $cookies) {

      $scope.email1 = $location.search().email;

      $scope.handleCreateAccount = function () {
        Userservice.addDrUser(
          $scope.email1, $scope.password1,
          function (data, status) {
            if (status != 200 || !data.success) {
              $log.error("addDrUser failed. Status: " + status);
              // alert("addDrUser failed. Status: " + status);
            } else {
              // alert($scope.email1 + " created w/ token: " + data.message);
              $cookies.atlasDrCookie = data.message;
              $window.location.href = "https://www.digitalriver.com/";
            }
          });
      };

    }
  ]);
