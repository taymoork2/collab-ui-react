'use strict';

angular.module('Core')
  .controller('enterEmailAddrController', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', '$log', 'Userservice',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, $log, Userservice) {

      $scope.handleEnterEmailAddr = function () {
        Userservice.getUserFromEmail(
          $scope.email,
          function (data, status) {
          	if (status != 200 || !data.success) {
        		$log.error("getUserFromEmail failed. Status: " + status);
        		// alert("error: " + data + " " + status);
            } else {
            	$log.info($scope.email + (data.message == "true" ? " exists" : " does not exist"));
            	// alert($scope.email + (data.message == "true" ? " exists" : " does not exist"));
            }
          });
      };

    }
  ]);
