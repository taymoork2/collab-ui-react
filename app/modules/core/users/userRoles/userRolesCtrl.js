require('./_user-roles.scss');

(function () {
  'use strict';

  angular.module('Squared')
    .controller('UserRolesCtrl', UserRolesCtrl);

  /* @ngInject */
  function UserRolesCtrl($q, $scope, $translate, $stateParams, SessionStorage, Userservice, Log, Authinfo, Config, $rootScope, Notification, Orgservice, FeatureToggleService, EdiscoveryService) {
    $scope.currentUser = $stateParams.currentUser;
    $scope.sipAddr = '';
    $scope.dirsyncEnabled = false;
    $scope.isPartner = SessionStorage.get('partnerOrgId');
    $scope.helpDeskFeatureAllowed = Authinfo.isCisco() || _.includes(['fe5acf7a-6246-484f-8f43-3e8c910fc50d'], Authinfo.getOrgId());
    $scope.showHelpDeskRole = $scope.isPartner || $scope.helpDeskFeatureAllowed;
    FeatureToggleService.supports(FeatureToggleService.features.atlasHelpDeskOrderSearch).then(function (result) {
      $scope.showOrderAdminRole = result;
    });
    FeatureToggleService.supports(FeatureToggleService.features.atlasPartnerManagement).then(function (result) {
      $scope.showPartnerManagementRole = result;
    });
    $scope.showOrderAdminRole = false;
    $scope.showComplianceRole = false;
    $scope.updateRoles = updateRoles;
    $scope.clearCheckboxes = clearCheckboxes;
    $scope.supportCheckboxes = supportCheckboxes;
    $scope.partialCheckboxes = partialCheckboxes;
    $scope.orderadminOnCheckedHandler = orderadminOnCheckedHandler;
    $scope.helpdeskOnCheckedHandler = helpdeskOnCheckedHandler;
    $scope.partnerManagementOnCheckedHandler = partnerManagementOnCheckedHandler;
    $scope.resetFormData = resetFormData;
    $scope.enableReadonlyAdminOption = false;
    $scope.rolesObj = {
      adminRadioValue: 0,
    };
    $scope.noAdmin = {
      label: $translate.instant('rolesPanel.noAdmin'),
      value: 0,
      name: 'adminRoles',
      id: 'noAdmin',
    };
    $scope.fullAdmin = {
      label: $translate.instant('rolesPanel.fullAdmin'),
      value: 1,
      name: 'adminRoles',
      id: 'fullAdmin',
    };
    $scope.readonlyAdmin = {
      label: $translate.instant('rolesPanel.readonlyAdmin'),
      value: 3,
      name: 'adminRoles',
      id: 'readonlyAdmin',
    };
    $scope.partialAdmin = {
      label: $translate.instant('rolesPanel.partialAdmin'),
      value: 2,
      name: 'partialAdmin',
      id: 'partialAdmin',
    };
    $scope.messages = {
      displayName: {
        notblank: $translate.instant('profilePage.displayNameEmptyError'),
      },
      partialAdmin: {
        noSelection: $translate.instant('rolesPanel.partialAdminError'),
      },
    };

    $scope.checkAdminDisplayName = checkAdminDisplayName;

    $scope.updatingUser = false;

    FeatureToggleService.supports(FeatureToggleService.features.atlasReadOnlyAdmin).then(function () {
      $scope.enableReadonlyAdminOption = true;
    });

    FeatureToggleService.supports(FeatureToggleService.features.atlasComplianceRole).then(function (enabled) {
      $scope.showComplianceRole = !!enabled;
    });

    initView();

    ///////////////////////////

    function initView() {
      Orgservice.getOrgCacheOption(function (data, status) {
        if (data.success) {
          $scope.dirsyncEnabled = data.dirsyncEnabled;
          $scope.delegatedAdministration = data.delegatedAdministration;
          if (!$scope.showHelpDeskRole) {
            $scope.showHelpDeskRole = $scope.delegatedAdministration || $scope.helpDeskFeatureAllowed;
          }
          if (!$scope.isPartner) {
            $scope.isPartner = data.isPartner || data.delegatedAdministration;
          }
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      }, null, {
        cache: true,
      });

      if ($scope.currentUser) {
        $scope.isEditingSelf = ($scope.currentUser.id === Authinfo.getUserId());
      }

      // reset the form to match the currentUser
      resetFormData();
    }

    function setFormUserData() {
      // data used in the form for editing
      $scope.formUserData = {
        name: _.clone(_.get($scope, 'currentUser.name')),
        displayName: _.clone(_.get($scope, 'currentUser.displayName')),
      };
    }

    function setUserSipAddress() {
      if (_.isArray(_.get($scope, 'currentUser.sipAddresses'))) {
        var sipAddrData = _.find($scope.currentUser.sipAddresses, {
          primary: true,
          type: 'cloud-calling',
        });

        if (_.isEmpty(sipAddrData)) {
          sipAddrData = _.find($scope.currentUser.sipAddresses, {
            type: 'cloud-calling',
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
      $scope.rolesObj.orderAdminValue = hasRole(Config.backend_roles.orderadmin);
      $scope.rolesObj.partnerManagementValue = hasRole(Config.backend_roles.partner_management);
      $scope.rolesObj.complianceValue = $scope.currentUser && _.includes($scope.currentUser.entitlements, 'compliance');

      $scope.initialRoles = rolesFromScope();
    }

    function checkMainRoles() {
      if (_.get($scope, 'currentUser.roles')) {
        if (hasRole(Config.backend_roles.full_admin)) {
          return 1;
        } else if (hasRole(Config.backend_roles.readonly_admin)) {
          return 3;
        } else if (hasRole(Config.backend_roles.sales) || hasRole(Config.backend_roles.billing) || hasRole(Config.backend_roles.support) || hasRole(Config.backend_roles.application)) {
          return 2;
        }
      }
      return 0;
    }

    function hasRole(role) {
      return _.get($scope, 'currentUser.roles') && _.includes(_.get($scope, 'currentUser.roles'), role);
    }

    function checkPartialRoles(roleEnabled) {
      if (roleEnabled) {
        return Config.roleState.active;
      } else {
        return Config.roleState.inactive;
      }
    }

    function resetFormData() {
      setUserSipAddress();
      setFormValuesToMatchRoles();
      setFormUserData();
      if (_.has($scope, 'rolesEdit.form')) {
        _.attempt($scope.rolesEdit.form.$setPristine);
        _.attempt($scope.rolesEdit.form.$setUntouched);
        _.attempt($scope.rolesEdit.form.displayName.$setValidity('notblank', true));
        _.attempt($scope.rolesEdit.form.partialAdmin.$setValidity('noSelection', true));
      }
    }

    function updateRoles() {
      if ($scope.showComplianceRole && $scope.rolesObj.complianceValue !== isEntitledToCompliance()) {
        EdiscoveryService.setEntitledForCompliance(Authinfo.getOrgId(), $scope.currentUser.id, $scope.rolesObj.complianceValue)
          .then(function () {
            saveForm();
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'profilePage.complianceError');
          });
      } else {
        saveForm();
      }
    }

    function rolesFromScope() {
      var roles = [];
      switch ($scope.rolesObj.adminRadioValue) {
        case 0: // No admin
          for (var roleName in Config.roles) {
            if (Config.roles[roleName] !== Config.roles.helpdesk &&
              Config.roles[roleName] !== Config.roles.orderadmin &&
              Config.roles[roleName] !== Config.roles.spark_synckms &&
              Config.roles[roleName] !== Config.roles.compliance_user) {
              roles.push({
                'roleName': Config.roles[roleName],
                'roleState': Config.roleState.inactive,
              });
            }
          }
          break;
        case 1: // Full admin
          roles.push({
            'roleName': Config.roles.full_admin,
            'roleState': Config.roleState.active,
          });
          roles.push({
            'roleName': Config.roles.readonly_admin,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.sales,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.billing,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.support,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.reports,
            'roleState': Config.roleState.inactive,
          });
          break;
        case 2: // Some admin roles
          roles.push({
            'roleName': Config.roles.full_admin,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.readonly_admin,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.sales,
            'roleState': checkPartialRoles($scope.rolesObj.salesAdminValue),
          });
          roles.push({
            'roleName': Config.roles.billing,
            'roleState': checkPartialRoles($scope.rolesObj.billingAdminValue),
          });
          roles.push({
            'roleName': Config.roles.support,
            'roleState': checkPartialRoles($scope.rolesObj.supportAdminValue),
          });
          roles.push({
            'roleName': Config.roles.reports,
            'roleState': checkPartialRoles($scope.rolesObj.supportAdminValue),
          });
          break;
        case 3: // Readonly admin
          roles.push({
            'roleName': Config.roles.full_admin,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.readonly_admin,
            'roleState': Config.roleState.active,
          });
          roles.push({
            'roleName': Config.roles.sales,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.billing,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.support,
            'roleState': Config.roleState.inactive,
          });
          roles.push({
            'roleName': Config.roles.reports,
            'roleState': Config.roleState.inactive,
          });
          break;
      }

      // Help Desk
      roles.push({
        'roleName': Config.roles.helpdesk,
        'roleState': ($scope.rolesObj.helpdeskValue ? Config.roleState.active : Config.roleState.inactive),
      });

      // Order Admin role for applicable users
      if ($scope.showOrderAdminRole) {
        roles.push({
          'roleName': Config.roles.orderadmin,
          'roleState': ($scope.rolesObj.orderAdminValue ? Config.roleState.active : Config.roleState.inactive),
        });
      }

      // Partner Management
      roles.push({
        'roleName': Config.roles.partner_management,
        'roleState': ($scope.rolesObj.partnerManagementValue ? Config.roleState.active : Config.roleState.inactive),
      });

      roles.push({
        'roleName': Config.roles.spark_synckms,
        'roleState': (hasRole(Config.backend_roles.spark_synckms) ? Config.roleState.active : Config.roleState.inactive),
      });

      return roles;
    }

    function saveForm() {
      $scope.updatingUser = true;

      $q.resolve()
        .then(patchUserRoles)
        .then(patchUserData)
        .then(function () {
          Notification.success('profilePage.success');
          $rootScope.$broadcast('USER_LIST_UPDATED');
          resetFormData();
        })
        .catch(function errorHandler(response) {
          Notification.errorResponse(response, 'profilePage.rolesError');
        })
        .finally(function () {
          $scope.updatingUser = false;
        });
    }

    function patchUserRoles() {
      var roles = rolesFromScope();
      if (!_.isEqual(roles, $scope.initialRoles)) {
        return Userservice.patchUserRoles($scope.currentUser.userName, $scope.currentUser.displayName, roles)
          .then(function (response) {
            $scope.currentUser.roles = response.data.userResponse[0].roles;
          });
      }
    }

    function patchUserData() {
      // Add or delete properties depending on whether or not their value is empty/blank.
      // With property value set to '', the back-end will respond with a 400 error.
      // Guidance from CI team is to not specify any property containing an empty string
      // value. Instead, add the property to meta.attribute to have its value be deleted.
      var userData = {
        'schemas': Config.scimSchemas,
        'name': {},
        'meta': {
          'attributes': [],
        },
      };

      if ($scope.formUserData.name) {
        if ($scope.formUserData.name.givenName) {
          userData.name['givenName'] = $scope.formUserData.name.givenName;
        } else {
          userData.meta.attributes.push('name.givenName');
        }
        if ($scope.formUserData.name.familyName) {
          userData.name['familyName'] = $scope.formUserData.name.familyName;
        } else {
          userData.meta.attributes.push('name.familyName');
        }
      }

      if ($scope.formUserData.displayName) {
        userData.displayName = $scope.formUserData.displayName;
      } else {
        userData.meta.attributes.push('displayName');
      }

      // check if user profile data changed.
      var useDataChanged = (
        !_.isEqual($scope.formUserData.name, $scope.currentUser.name) ||
        !_.isEqual($scope.formUserData.displayName, $scope.currentUser.displayName)
      );

      if (!$scope.dirsyncEnabled && useDataChanged) {
        return Userservice.updateUserProfile($scope.currentUser.id, userData)
          .then(function (response) {
            $scope.currentUser = response.data;
          });
      }
    }

    function clearCheckboxes() {
      $scope.rolesObj.userAdminValue = false;
      $scope.rolesObj.billingAdminValue = false;
      $scope.rolesObj.supportAdminValue = false;
      $scope.rolesObj.salesAdminValue = false;
      $scope.isChecked = false;
      checkAdminDisplayName();
    }

    function supportCheckboxes() {
      if ($scope.isEditingSelf) {
        return;
      }
      $scope.rolesObj.supportAdminValue = true;
      $scope.rolesObj.adminRadioValue = 2;
      $scope.rolesEdit.form.$dirty = true;
      checkAdminDisplayName();
    }

    function partialCheckboxes() {
      if ($scope.isEditingSelf) {
        return;
      }
      $scope.rolesObj.adminRadioValue = 2;
      $scope.rolesEdit.form.$dirty = true;
      checkAdminDisplayName();
    }

    function isEntitledToCompliance() {
      return $scope.currentUser && _.includes($scope.currentUser.entitlements, 'compliance');
    }

    function checkAdminDisplayName() {
      // If the user is an admin user,
      // the first name, last name and display name cannot be all blank.
      if ($scope.rolesObj.adminRadioValue !== 0) {
        var firstName = _.get($scope.formUserData, 'name.givenName', null);
        var lastName = _.get($scope.formUserData, 'name.familyName', null);
        var displayName = _.get($scope.formUserData, 'displayName', null);
        var notAllBlank = !_.isEmpty(firstName) || !_.isEmpty(lastName) || !_.isEmpty(displayName);
        $scope.rolesEdit.form.displayName.$setValidity('notblank', notAllBlank);
      } else {
        $scope.rolesEdit.form.displayName.$setValidity('notblank', true);
      }
      $scope.rolesEdit.form.partialAdmin.$setValidity('noSelection', getPartialAdminValidity());
    }

    function orderadminOnCheckedHandler() {
      if ($scope.rolesObj.orderAdminValue) {
        $scope.rolesObj.helpdeskValue = true;
        $scope.rolesEdit.form.$dirty = true;
      }
    }

    function helpdeskOnCheckedHandler() {
      if ($scope.rolesObj.helpdeskValue === false) {
        $scope.rolesObj.orderAdminValue = false;
        $scope.rolesEdit.form.$dirty = true;
      }
    }

    function partnerManagementOnCheckedHandler() {
      $scope.rolesEdit.form.$dirty = true;
    }

    function getPartialAdminValidity() {
      if ($scope.rolesObj.adminRadioValue === $scope.partialAdmin.value) {
        return $scope.rolesObj.salesAdminValue || $scope.rolesObj.userAdminValue || $scope.rolesObj.billingAdminValue || $scope.rolesObj.supportAdminValue;
      } else {
        return true;
      }
    }
  }
})();
