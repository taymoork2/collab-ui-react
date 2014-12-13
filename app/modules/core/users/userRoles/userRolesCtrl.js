'use strict';

angular.module('Squared')
  .controller('UserRolesCtrl', ['$scope', '$timeout', '$location', '$window', 'Userservice', 'UserListService', 'Log', 'Config', 'Pagination', '$rootScope', 'Notification', '$filter', 'Utils', 'Authinfo',
    function ($scope, $timeout, $location, $window, Userservice, UserListService, Log, Config, Pagination, $rootScope, Notification, $filter, Utils, Authinfo) {
      $scope.adminRadioValue = null;
      $scope.userAdminValue = null;
      $scope.billingAdminValue = null;
      $scope.supportAdminValue = null;

      if ($scope.roles) {
        console.log($scope.roles.indexOf(Config.roles.full_admin));
        if ($scope.roles.indexOf(Config.roles.full_admin) > -1) {
          $scope.adminRadioValue = 1;
        }
      }

      console.log($scope.roles);

      $scope.fullAdmin = {
        label: 'Full administrator privileges',
        value: 1,
        name: 'adminRoles',
        id: 'fullAdmin'
      };

      $scope.partialAdmin = {
        label: 'Some administrator privileges',
        value: 2,
        name: 'adminRoles',
        id: 'partialAdmin'
      };

      $scope.clearCheckboxes = function () {
        if ($scope.adminRadioValue === 1) {
          $scope.userAdminValue = false;
          $scope.billingAdminValue = false;
          $scope.supportAdminValue = false;
        }
      };

      $scope.radioHandler = function () {
        if ($scope.adminRadioValue === 1) {
          $scope.adminRadioValue = 2;
        }
      };
    }
  ])
  .directive('userRoles', function () {
    return {
      restrict: 'A',
      controller: 'UserRolesCtrl',
      scope: {
        currentUser: '=',
        entitlements: '=',
        queryuserslist: '=',
        roles: '='
      },
      templateUrl: 'modules/core/users/userRoles/userRoles.tpl.html'
    };
  });
