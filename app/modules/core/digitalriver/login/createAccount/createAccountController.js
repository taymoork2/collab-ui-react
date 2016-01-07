'use strict';

angular.module('Core')
  .controller('createAccountController', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', '$log', 'Userservice', '$cookies',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, $log, Userservice, $cookies) {

      $scope.email1 = $location.search().email;

      $scope.handleCreateAccount = function () {
        if ($scope.email1 != $scope.email2) {
          $scope.error = "Emails do not match";
          return;
        } else if ($scope.password1 != $scope.password2) {
          $scope.error = "Passwords do not match";
          return;
        }
        Userservice.addDrUser(
          {
            'email': $scope.email1,
            'password': $scope.password1
          },
          function (data, status) {
            if (status != 200 || !data.success) {
              $scope.error = data.message;
            } else {
              $cookies.atlasDrCookie = data.data;
              $window.location.href = "https://www.digitalriver.com/";
            }
          });
      };

    }
  ]);
