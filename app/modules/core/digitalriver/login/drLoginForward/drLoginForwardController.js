'use strict';

angular.module('Core')
  .controller('drLoginForwardController', ['$scope', '$rootScope', '$filter', '$location', '$window', '$http', 'Storage', 'SessionStorage', 'Config', 'Utils', 'Auth', 'Authinfo', 'PageParam', '$state', '$timeout', '$stateParams', 'LogMetricsService', '$log', 'Userservice', '$cookies',
    function ($scope, $rootScope, $filter, $location, $window, $http, Storage, SessionStorage, Config, Utils, Auth, Authinfo, PageParam, $state, $timeout, $stateParams, LogMetricsService, $log, Userservice, $cookies) {

       Userservice.getUser('me',
          function (data, status) {
            if (status != 200 || !data.success) {
              $scope.error = data.message;
            } else {
              $cookies.atlasDrCookie = data.id;
	      $window.location.href = "http://www.digitalriver.com/";
            }
          });
    }
  ]);
