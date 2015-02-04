'use strict';

/* global moment */

angular.module('Core')
  .controller('UsersCtrl', ['$scope', '$state', '$location', '$window', 'Userservice', 'UserListService', 'Log', 'Authinfo', 'Storage', '$rootScope', '$filter', '$translate', 'LogMetricsService', 'Config',
    function ($scope, $state, $location, $window, Userservice, UserListService, Log, Authinfo, Storage, $rootScope, $filter, $translate, LogMetricsService, Config) {

      $scope.isSquaredInviter = function () {
        return Authinfo.isSquaredInviter();
      };

      $scope.openAddUserPanel = function () {
        $state.go('users.list.add');
      };

      $scope.resetEntitlements = function () {
        for (var svc in $scope.entitlements) {
          $scope.entitlements[svc] = false;
        }
      };

      //radio group
      $scope.entitlements = {};
      var setEntitlementList = function () {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i].sqService;

          $scope.entitlements[svc] = false;
          if (svc === 'webExSquared') {
            $scope.entitlements[svc] = true;
          }
        }
      };

      $scope.$on('AuthinfoUpdated', function () {
        if (undefined !== $rootScope.services && $rootScope.services.length === 0) {
          $rootScope.services = Authinfo.getServices();
        }
        setEntitlementList();
      });

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.sqService === service) {
            return svc.displayName;
          }
        }
      };

      var isEntitled = function (ent) {
        if ($rootScope.services) {
          for (var i = 0; i < $rootScope.services.length; i++) {
            var svc = $rootScope.services[i].ciService;

            if (svc === ent) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();

    }
  ]);
