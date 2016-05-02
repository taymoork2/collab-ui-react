(function () {
  'use strict';
  angular.module('Squared')
    .controller('UserRolesCtrl', UserRolesCtrl);

  /* @ngInject */
  function UserRolesCtrl($scope, $translate, $stateParams, SessionStorage, Userservice, Log, Authinfo, Config, $rootScope, Notification, Orgservice) {
    $scope.currentUser = $stateParams.currentUser;
    $scope.sipAddr = '';
    $scope.dirsyncEnabled = false;
    $scope.isPartner = SessionStorage.get('partnerOrgId');
    $scope.showHelpDeskRole = !Config.isProd() || Authinfo.isCisco() || _.includes(['21cf6a5e-a63d-485f-8d62-b1d9e6f253c4', '0198f08a-3880-4871-b55e-4863ccf723d5', '6c922508-9640-47a1-abd2-66efd1ba6127', '1a2f0924-9986-442f-910a-c10ef8138fd5'], Authinfo.getOrgId());
    $scope.updateRoles = updateRoles;
    $scope.clearCheckboxes = clearCheckboxes;
    $scope.supportCheckboxes = supportCheckboxes;
    $scope.partialCheckboxes = partialCheckboxes;
    $scope.resetRoles = resetRoles;
    $scope.rolesObj = {};
    $scope.noAdmin = {
      label: $translate.instant('rolesPanel.noAdmin'),
      value: 0,
      name: 'adminRoles',
      id: 'noAdmin'
    };
    $scope.fullAdmin = {
      label: $translate.instant('rolesPanel.fullAdmin'),
      value: 1,
      name: 'adminRoles',
      id: 'fullAdmin'
    };
    $scope.partialAdmin = {
      label: $translate.instant('rolesPanel.partialAdmin'),
      value: 2,
      name: 'adminRoles',
      id: 'partialAdmin'
    };

    initView();

    function initView() {
      Orgservice.getOrgCacheOption(function (data, status) {
        if (data.success) {
          $scope.dirsyncEnabled = data.dirsyncEnabled;
          $scope.delegatedAdministration = data.delegatedAdministration;
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      }, null, {
        cache: true
      });

      if ($scope.currentUser) {
        $scope.isEditingSelf = $scope.currentUser.id === Authinfo.getUserId();
        $scope.roles = $scope.currentUser.roles;
      }

      setUserSipAddress();
      setFormValuesToMatchRoles();
    }

    function setUserSipAddress() {
      if (_.isArray(_.get($scope, 'currentUser.sipAddresses'))) {
        var sipAddrData = _.find($scope.currentUser.sipAddresses, {
          primary: true,
          type: 'cloud-calling'
        });

        if (_.isEmpty(sipAddrData)) {
          sipAddrData = _.find($scope.currentUser.sipAddresses, {
            type: 'cloud-calling'
          });
        }

        if (_.get(sipAddrData, 'value')) {
          $scope.sipAddr = sipAddrData.value;
        }
      }
    }

    function setFormValuesToMatchRoles() {
      $scope.rolesObj.adminRadioValue = checkMainRoles();
      $scope.rolesObj.salesAdminValue = hasRole(Config.backend_roles.sales);
      $scope.rolesObj.billingAdminValue = hasRole(Config.backend_roles.billing);
      $scope.rolesObj.supportAdminValue = hasRole(Config.backend_roles.support);
      $scope.rolesObj.helpdeskValue = hasRole(Config.backend_roles.helpdesk);
    }

    function checkMainRoles() {
      if ($scope.roles) {
        if (hasRole(Config.backend_roles.full_admin)) {
          return 1;
        } else if (hasRole(Config.backend_roles.sales) || hasRole(Config.backend_roles.billing) || hasRole(Config.backend_roles.support) || hasRole(Config.backend_roles.application)) {
          return 2;
        }
      }
      return 0;
    }

    function hasRole(role) {
      return $scope.roles && _.includes($scope.roles, role);
    }

    function checkPartialRoles(roleEnabled) {
      if (roleEnabled) {
        return Config.roleState.active;
      } else {
        return Config.roleState.inactive;
      }
    }

    function resetForm() {
      $scope.rolesEdit.form.$setPristine();
      $scope.rolesEdit.form.$setUntouched();
    }

    function resetRoles() {
      setFormValuesToMatchRoles();
      resetForm();
    }

    function updateRoles() {
      var choice = $scope.rolesObj.adminRadioValue;
      var roles = [];

      switch ($scope.rolesObj.adminRadioValue) {
      case 0: // No admin
        for (var roleName in Config.roles) {
          if (Config.roles[roleName] != Config.roles.helpdesk && Config.roles[roleName] !== Config.roles.spark_synckms) {
            roles.push({
              'roleName': Config.roles[roleName],
              'roleState': Config.roleState.inactive
            });
          }

        }
        break;
      case 1: // Full admin
        roles.push({
          'roleName': Config.roles.full_admin,
          'roleState': Config.roleState.active
        });
        roles.push({
          'roleName': Config.roles.sales,
          'roleState': Config.roleState.inactive
        });
        roles.push({
          'roleName': Config.roles.billing,
          'roleState': Config.roleState.inactive
        });
        roles.push({
          'roleName': Config.roles.support,
          'roleState': Config.roleState.inactive
        });
        roles.push({
          'roleName': Config.roles.reports,
          'roleState': Config.roleState.inactive
        });
        break;
      case 2: // Some admin roles
        roles.push({
          'roleName': Config.roles.full_admin,
          'roleState': Config.roleState.inactive
        });
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
        break;
      }

      // Help Desk
      roles.push({
        'roleName': Config.roles.helpdesk,
        'roleState': ($scope.rolesObj.helpdeskValue ? Config.roleState.active : Config.roleState.inactive)
      });

      roles.push({
        'roleName': Config.roles.spark_synckms,
        'roleState': (hasRole(Config.backend_roles.spark_synckms) ? Config.roleState.active : Config.roleState.inactive)
      });

      Userservice.patchUserRoles($scope.currentUser.userName, $scope.currentUser.displayName, roles, function (data, status) {
        if (data.success) {
          var userData = {
            'schemas': Config.scimSchemas,
            'name': {},
            'meta': {
              'attributes': []
            }
          };
          // Add or delete properties depending on whether or not their value is empty/blank.
          // With property value set to "", the back-end will respond with a 400 error.
          // Guidance from CI team is to not specify any property containing an empty string
          // value. Instead, add the property to meta.attribute to have its value be deleted.
          if ($scope.currentUser.name) {
            if ($scope.currentUser.name.givenName) {
              userData.name["givenName"] = $scope.currentUser.name.givenName;
            } else {
              userData.meta.attributes.push('name.givenName');
            }
            if ($scope.currentUser.name.familyName) {
              userData.name["familyName"] = $scope.currentUser.name.familyName;
            } else {
              userData.meta.attributes.push('name.familyName');
            }
          }
          if ($scope.currentUser.displayName) {
            userData.displayName = $scope.currentUser.displayName;
          } else {
            userData.meta.attributes.push('displayName');
          }

          Log.debug('Updating user: ' + $scope.currentUser.id + ' with data: ');

          if (!$scope.dirsyncEnabled) {
            Userservice.updateUserProfile($scope.currentUser.id, userData, function (data, status) {
              if (data.success) {
                var successMessage = [];
                successMessage.push($translate.instant('profilePage.success'));
                Notification.notify(successMessage, 'success');
                $scope.user = data;
                $rootScope.$broadcast('USER_LIST_UPDATED');
                resetForm();
              } else {
                Log.debug('Update existing user failed. Status: ' + status);
                var errorMessage = [];
                errorMessage.push($translate.instant('profilePage.error'));
                Notification.notify(errorMessage, 'error');
              }
            });
          } else {
            var successMessage = [];
            successMessage.push($translate.instant('profilePage.success'));
            Notification.notify(successMessage, 'success');
            $scope.user = data;
            $rootScope.$broadcast('USER_LIST_UPDATED');
            resetForm();
          }
        } else {
          Log.debug('Updating user\'s roles failed. Status: ' + status);
          var errorMessage = [];
          errorMessage.push($translate.instant('profilePage.rolesError'));
          Notification.notify(errorMessage, 'error');
        }

      });
      $scope.rolesObj.adminRadioValue = choice;
    }

    function clearCheckboxes() {
      $scope.rolesObj.userAdminValue = false;
      $scope.rolesObj.billingAdminValue = false;
      $scope.rolesObj.supportAdminValue = false;
      $scope.rolesObj.salesAdminValue = false;
      $scope.isChecked = false;
    }

    function supportCheckboxes() {
      if ($scope.isEditingSelf) {
        return;
      }
      $scope.rolesObj.supportAdminValue = true;
      $scope.rolesObj.adminRadioValue = 2;
      $scope.rolesEdit.form.$dirty = true;
    }

    function partialCheckboxes() {
      if ($scope.isEditingSelf) {
        return;
      }
      $scope.rolesObj.adminRadioValue = 2;
      $scope.rolesEdit.form.$dirty = true;
    }

  }
})();
