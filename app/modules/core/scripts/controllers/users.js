'use strict';

angular.module('Core')
  .controller('UsersCtrl', ['$scope', '$state', '$location', '$window', 'Userservice', 'UserListService', 'Log', 'Authinfo', 'Storage', '$rootScope',
    function ($scope, $state, $location, $window, Userservice, UserListService, Log, Authinfo, Storage, $rootScope) {

      $scope.isSquaredInviter = function () {
        return Authinfo.isSquaredInviter();
      };

      $scope.openAddUserPanel = function () {
        $state.go('users.list.add');
      };

      //radio group
      $scope.entitlements = {};
      var setEntitlementList = function () {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i].serviceId;

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
          if (svc.serviceId === service) {
            return svc.displayName;
          }
        }
      };

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();

    }
  ]);
