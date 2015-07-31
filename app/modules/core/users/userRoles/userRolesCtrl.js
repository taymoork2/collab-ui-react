'use strict';
angular.module('Squared')
  .controller('UserRolesCtrl', ['$scope', '$timeout', '$location', '$window', 'SessionStorage', 'Userservice', 'UserListService', 'Log', 'Config', 'Pagination', '$rootScope', 'Notification', '$filter', 'Utils', 'Authinfo', '$stateParams', '$sanitize', '$state',
    function ($scope, $timeout, $location, $window, SessionStorage, Userservice, UserListService, Log, Config, Pagination, $rootScope, Notification, $filter, Utils, Authinfo, $stateParams, $sanitize, $state) {
      $scope.currentUser = $stateParams.currentUser;
      if ($scope.currentUser) {
        $scope.roles = $scope.currentUser.roles;
      }

      $scope.rolesObj = {};

      var inArray = function (array, el) {
        for (var i = array.length; i--;) {
          if (array[i] === el) {
            return true;
          }
        }
        return false;
      };

      var isEqualArrays = function (arr1, arr2) {
        if (arr1.length !== arr2.length) {
          return false;
        }
        for (var i = arr1.length; i--;) {
          if (!inArray(arr2, arr1[i])) {
            return false;
          }
        }
        return true;
      };

      var checkMainRoles = function (roles) {
        if ($scope.roles) {
          if (isEqualArrays(roles, _.intersection($scope.roles, roles))) {
            return 1;
          } else {
            return 2;
          }
        } else {
          return 0;
        }
      };

      var checkSubRoles = function (subRole, subRole2) {
        if ($scope.roles) {
          if ($scope.roles.indexOf(subRole) > -1 && $scope.roles.indexOf(subRole2) === -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return null;
        }
      };

      $scope.rolesObj.adminRadioValue = checkMainRoles([Config.backend_roles.full_admin]);
      //$scope.userAdminValue = checkSubRoles(Config.backend_roles.full_admin, Config.backend_roles.all);
      $scope.rolesObj.salesAdminValue = checkSubRoles(Config.backend_roles.sales);
      $scope.rolesObj.billingAdminValue = checkSubRoles(Config.backend_roles.billing);
      $scope.rolesObj.supportAdminValue = checkSubRoles(Config.backend_roles.support);
      $scope.rolesObj.cloudAdminValue = checkSubRoles(Config.backend_roles.application);

      $scope.noAdmin = {
        label: $filter('translate')('rolesPanel.noAdmin'),
        value: 0,
        name: 'adminRoles',
        id: 'noAdmin'
      };

      $scope.fullAdmin = {
        label: $filter('translate')('rolesPanel.fullAdmin'),
        value: 1,
        name: 'adminRoles',
        id: 'fullAdmin'
      };

      $scope.partialAdmin = {
        label: $filter('translate')('rolesPanel.partialAdmin'),
        value: 2,
        name: 'adminRoles',
        id: 'partialAdmin'
      };

      $scope.sipAddr = "";
      if ($scope.currentUser.sipAddresses) {
        for (var x = 0; x < $scope.currentUser.sipAddresses.length; x++) {
          if ($scope.currentUser.sipAddresses[x].type == "cloud-calling") {
            $scope.sipAddr = $scope.currentUser.sipAddresses[x].value;
          }
        }
      }

      var checkPartialRoles = function (roleEnabled) {
        if (roleEnabled) {
          return Config.roleState.active;
        } else {
          return Config.roleState.inactive;
        }
      };

      $scope.isPartner = function () {
        return SessionStorage.get('partnerOrgId');
      };

      function resetForm() {
        $scope.rolesEdit.form.$setPristine();
        $scope.rolesEdit.form.$setUntouched();
      }

      $scope.resetRoles = function () {
        $state.go('user-overview.userProfile');
        $scope.rolesObj.adminRadioValue = checkMainRoles([Config.backend_roles.full_admin]);
        if ($scope.rolesObj.adminRadioValue !== 2) {
          $scope.clearCheckboxes();
        }
        resetForm();
      };

      $scope.updateRoles = function () {

        var choice = $scope.rolesObj.adminRadioValue;
        var roles = [];

        if ($scope.rolesObj.adminRadioValue === 0) {
          for (var roleNames in Config.roles) {
            var inactiveRoleState = {
              'roleName': Config.roles[roleNames],
              'roleState': Config.roleState.inactive
            };
            roles.push(inactiveRoleState);
          }

        } else {
          if ($scope.rolesObj.adminRadioValue === 1) {
            roles.push({
              'roleName': Config.roles.full_admin,
              'roleState': Config.roleState.active
            });

            roles.push({
              'roleName': Config.roles.all,
              'roleState': Config.roleState.inactive
            });
          } else {
            roles.push({
              'roleName': Config.roles.full_admin,
              'roleState': checkPartialRoles($scope.userAdminValue)
            });

            roles.push({
              'roleName': Config.roles.all,
              'roleState': Config.roleState.inactive
            });
          }

          roles.push({
            'roleName': Config.roles.sales,
            'roleState': checkPartialRoles($scope.rolesObj.salesAdminValue)
          });

          roles.push({
            'roleName': Config.roles.billing,
            'roleState': checkPartialRoles($scope.rolesObj.billingAdminValue)
          });

          roles.push({
            'roleName': Config.roles.support,
            'roleState': checkPartialRoles($scope.rolesObj.supportAdminValue)
          });

          roles.push({
            'roleName': Config.roles.reports,
            'roleState': checkPartialRoles($scope.rolesObj.supportAdminValue)
          });

          roles.push({
            'roleName': Config.roles.application,
            'roleState': checkPartialRoles($scope.rolesObj.cloudAdminValue)
          });
        }

        Userservice.patchUserRoles($scope.currentUser.userName, $scope.currentUser.displayName, roles, function (data, status) {
          if (data.success) {
            if ($scope.currentUser) {
              var userData = {
                'schemas': Config.scimSchemas,
                'title': $scope.currentUser.title,
                'name': {
                  'givenName': $scope.currentUser.name ? $sanitize($scope.currentUser.name.givenName) : '',
                  'familyName': $scope.currentUser.name ? $sanitize($scope.currentUser.name.familyName) : ''
                },
                'displayName': $scope.currentUser.displayName,
                'meta': {
                  'attributes': []
                }
              };
              // If name properties don't exist, delete names using meta attributes
              if (!userData.name.givenName) {
                userData.meta.attributes.push('name.givenName');
              }
              if (!userData.name.familyName) {
                userData.meta.attributes.push('name.familyName');
              }

              Log.debug('Updating user: ' + $scope.currentUser.id + ' with data: ');

              Userservice.updateUserProfile($scope.currentUser.id, userData, function (data, status) {
                if (data.success) {
                  var successMessage = [];
                  successMessage.push($filter('translate')('profilePage.success'));
                  Notification.notify(successMessage, 'success');
                  $scope.user = data;
                  $rootScope.$broadcast('USER_LIST_UPDATED');
                  resetForm();
                } else {
                  Log.debug('Update existing user failed. Status: ' + status);
                  var errorMessage = [];
                  errorMessage.push($filter('translate')('profilePage.error'));
                  Notification.notify(errorMessage, 'error');
                }
              });
            } else {
              $rootScope.$broadcast('USER_LIST_UPDATED');
              var successMessage = [];
              successMessage.push($filter('translate')('profilePage.rolesSuccess'));
              Notification.notify(successMessage, 'success');
              resetForm();
            }
          } else {
            Log.debug('Updating user\'s roles failed. Status: ' + status);
            var errorMessage = [];
            errorMessage.push($filter('translate')('profilePage.rolesError'));
            Notification.notify(errorMessage, 'error');
          }

        });

        $scope.rolesObj.adminRadioValue = choice;

      };

      $scope.clearCheckboxes = function () {
        $scope.rolesObj.userAdminValue = false;
        $scope.rolesObj.billingAdminValue = false;
        $scope.rolesObj.supportAdminValue = false;
        $scope.rolesObj.salesAdminValue = false;
        $scope.isChecked = false;
      };

      $scope.supportCheckboxes = function () {
        $scope.rolesObj.supportAdminValue = true;
        $scope.rolesObj.adminRadioValue = 2;
        $scope.rolesEdit.form.$dirty = true;
      };

      $scope.partialCheckboxes = function () {
        $scope.rolesObj.adminRadioValue = 2;
        $scope.rolesEdit.form.$dirty = true;
      };

    }
  ]);
