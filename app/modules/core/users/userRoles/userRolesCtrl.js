require('./_user-roles.scss');

(function () {
  'use strict';

  module.exports = UserRolesCtrl;

  /* @ngInject */
  function UserRolesCtrl($q, $rootScope, $scope, $state, $stateParams, $translate, Analytics, Auth, Authinfo, Config, EdiscoveryService, FeatureToggleService, Log, Notification, Orgservice, ProPackService, SessionStorage, Userservice) {
    var COMPLIANCE = 'compliance';
    var SPARK_COMPLIANCE = 'spark-compliance';
    $scope.currentUser = $stateParams.currentUser;
    $scope.sipAddr = '';
    $scope.dirsyncEnabled = false;
    $scope.isPartner = SessionStorage.get('partnerOrgId');
    $scope.helpDeskFeatureAllowed = Authinfo.isCisco() || _.includes(['fe5acf7a-6246-484f-8f43-3e8c910fc50d'], Authinfo.getOrgId());
    $scope.showHelpDeskRole = $scope.isPartner || $scope.helpDeskFeatureAllowed;

    $q.all({
      atlasHelpDeskOrderSearch: FeatureToggleService.supports(FeatureToggleService.features.atlasHelpDeskOrderSearch),
      atlasPartnerManagement: FeatureToggleService.supports(FeatureToggleService.features.atlasPartnerManagement),
      atlasF2993NewDeviceRole: FeatureToggleService.supports(FeatureToggleService.features.atlasF2993NewDeviceRole),
      atlasF2993NewUserRole: FeatureToggleService.supports(FeatureToggleService.features.atlasF2993NewUserRole),
    }).then(function (toggles) {
      $scope.showOrderAdminRole = toggles.atlasHelpDeskOrderSearch;
      $scope.showPartnerManagementRole = toggles.atlasPartnerManagement;
      $scope.showDeviceRole = toggles.atlasF2993NewDeviceRole;
      $scope.showUserRole = toggles.atlasF2993NewUserRole;
    });

    var ROLE_TRANSLATIONS = {
      analytics: $translate.instant('rolesPanel.analytics'),
      assignRoles: $translate.instant('rolesPanel.assignRoles'),
      customerManagement: $translate.instant('rolesPanel.customerManagement'),
      companyPolicyTemplates: $translate.instant('rolesPanel.companyPolicyTemplates'),
      licensesAndUpgrades: $translate.instant('rolesPanel.licensesAndUpgrades'),
      organizationManagement: $translate.instant('rolesPanel.organizationManagement'),
      overviewReports: $translate.instant('rolesPanel.overviewReports'),
      supportMetrics: $translate.instant('rolesPanel.supportMetrics'),
      trialsManagement: $translate.instant('rolesPanel.trialsManagement'),
      userManagement: $translate.instant('rolesPanel.userManagement'),
      deviceManagement: $translate.instant('rolesPanel.deviceManagement'),
    };

    $scope.roleTooltips = {
      billingAdminAria: ROLE_TRANSLATIONS.licensesAndUpgrades,
      billingAdmin: '<ul class="roles-tooltip"><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.userManagement +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.companyPolicyTemplates +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.analytics +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.supportMetrics +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.licensesAndUpgrades +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.assignRoles + '</li></ul>',
      compliance: $translate.instant('ciRoles.complianceTooltip'),

      fullAdminAria: ROLE_TRANSLATIONS.userManagement + ' ' + ROLE_TRANSLATIONS.companyPolicyTemplates + ' ' + ROLE_TRANSLATIONS.analytics +
        ' ' + ROLE_TRANSLATIONS.supportMetrics + ' ' + ROLE_TRANSLATIONS.licensesAndUpgrades + ' ' + ROLE_TRANSLATIONS.assignRoles,
      fullAdmin: '<ul class="roles-tooltip"><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.userManagement +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.companyPolicyTemplates +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.analytics +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.supportMetrics +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.licensesAndUpgrades +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.assignRoles + '</li></ul>',

      helpdesk: $translate.instant('ciRoles.atlas-portal.partner.helpdeskTooltip'),
      orderAdmin: $translate.instant('ciRoles.atlas-portal.partner.orderadminTooltip'),
      partnerMgmt: $translate.instant('ciRoles.atlas-portal.cisco.partnermgmtTooltip'),
      proPack: $translate.instant('common.proPackTooltip'),
      readonlyAdmin: $translate.instant('rolesPanel.readonlyAdminTooltip'),

      salesAdminAria: ROLE_TRANSLATIONS.customerManagement + ' ' + ROLE_TRANSLATIONS.overviewReports + ' ' + ROLE_TRANSLATIONS.trialsManagement,
      salesAdmin: '<ul class="roles-tooltip"><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.customerManagement +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.overviewReports +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.organizationManagement +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.trialsManagement + '</li></ul>',

      supportAdminAria: ROLE_TRANSLATIONS.analytics + ' ' + ROLE_TRANSLATIONS.supportMetrics,
      supportAdmin: '<ul class="roles-tooltip"><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.userManagement +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.companyPolicyTemplates +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.analytics +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.supportMetrics +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.licensesAndUpgrades +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.assignRoles + '</li></ul>',

      // TODO: When altasF2993NewUserAndDeviceRoles is activated for all, Device Management should be added to tooltips above;
      // icon-remove for all but Full-Admin
      userAdminAria: ROLE_TRANSLATIONS.userManagement + ' ' + ROLE_TRANSLATIONS.assignRoles,
      userAdmin: '<ul class="roles-tooltip"><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.userManagement +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.deviceManagement +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.companyPolicyTemplates +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.analytics +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.supportMetrics +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.licensesAndUpgrades +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.assignRoles + '</li></ul>',

      deviceAdminAria: ROLE_TRANSLATIONS.deviceManagement,
      deviceAdmin: '<ul class="roles-tooltip"><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.userManagement +
        '</li><li><i class="icon icon-check"></i>' + ROLE_TRANSLATIONS.deviceManagement +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.companyPolicyTemplates +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.analytics +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.supportMetrics +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.licensesAndUpgrades +
        '</li><li><i class="icon icon-remove"></i>' + ROLE_TRANSLATIONS.assignRoles + '</li></ul>',
    };

    $scope.isUserAdminUser = Authinfo.isUserAdminUser();
    $scope.showOrderAdminRole = false;
    $scope.showComplianceRole = false;
    $scope.updateRoles = updateRoles;
    $scope.resetAccess = resetAccess;
    $scope.clearCheckboxes = clearCheckboxes;
    $scope.supportCheckboxes = supportCheckboxes;
    $scope.partialCheckboxes = partialCheckboxes;
    $scope.orderadminOnCheckedHandler = orderadminOnCheckedHandler;
    $scope.helpdeskOnCheckedHandler = helpdeskOnCheckedHandler;
    $scope.partnerManagementOnCheckedHandler = partnerManagementOnCheckedHandler;
    $scope.resetFormData = resetFormData;
    $scope.isEnterpriseCustomer = Authinfo.isEnterpriseCustomer();
    $scope.enableReadonlyAdminOption = false;
    $scope.showUserDetailSection = true;
    $scope.showSecuritySection = false;
    $scope.showRolesSection = true;
    $scope.isProPack = false;
    $scope.rolesObj = {
      adminRadioValue: 0,
    };
    $scope.noAdmin = {
      label: $translate.instant('rolesPanel.noAdmin'),
      value: 0,
      id: 'noAdmin',
    };
    $scope.fullAdmin = {
      label: $translate.instant('rolesPanel.fullAdmin'),
      value: 1,
      id: 'fullAdmin',
    };
    $scope.readonlyAdmin = {
      label: $translate.instant('rolesPanel.readonlyAdmin'),
      value: 3,
      id: 'readonlyAdmin',
    };
    $scope.partialAdmin = {
      label: $translate.instant('rolesPanel.partialAdmin'),
      value: 2,
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

    if ($state.current.name === 'user-overview.user-profile') {
      $scope.showUserDetailSection = true;
      $scope.showSecuritySection = false;
      $scope.showRolesSection = false;
    } else if ($state.current.name === 'user-overview.roles-and-security') {
      $scope.showUserDetailSection = false;
      $scope.showSecuritySection = true;
      $scope.showRolesSection = true;
    }

    FeatureToggleService.supports(FeatureToggleService.features.atlasReadOnlyAdmin).then(function () {
      $scope.enableReadonlyAdminOption = true;
    });

    FeatureToggleService.supports(FeatureToggleService.features.atlasComplianceRole).then(function (enabled) {
      $scope.showComplianceRole = !!enabled;
    });
    ProPackService.hasProPackEnabled()
      .then(function (proPackFeatureEnabled) {
        if (!proPackFeatureEnabled) {
          $scope.isProPack = true;//enable reset access button
          return $q.reject();
        }
      })
      .then(function () {
        return ProPackService.hasProPackPurchased();
      })
      .then(function (proPackagePurchased) {
        $scope.isProPack = proPackagePurchased;
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
        $scope.isNotEditable = $scope.isUserAdminUser && hasRole(Config.backend_roles.full_admin);
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
      $scope.rolesObj.userAdminValue = hasRole(Config.backend_roles.user_admin);
      $scope.rolesObj.deviceAdminValue = hasRole(Config.backend_roles.device_admin);
      $scope.rolesObj.complianceValue = isEntitledToCompliance();

      $scope.initialRoles = rolesFromScope();
    }

    function checkMainRoles() {
      if (_.get($scope, 'currentUser.roles')) {
        if (hasRole(Config.backend_roles.full_admin)) {
          return 1;
        } else if (hasRole(Config.backend_roles.readonly_admin)) {
          return 3;
        } else if (hasAnyRole([Config.backend_roles.sales, Config.backend_roles.billing, Config.backend_roles.support, Config.backend_roles.application, Config.backend_roles.user_admin, Config.backend_roles.device_admin])) {
          return 2;
        }
      }
      return 0;
    }

    function hasRole(role) {
      return _.get($scope, 'currentUser.roles') && _.includes(_.get($scope, 'currentUser.roles'), role);
    }

    function hasAnyRole(roleArray) {
      if (_.isString(roleArray)) {
        roleArray = [roleArray];
      }

      if (_.isArray(roleArray)) {
        var currentUserRoles = _.get($scope, 'currentUser.roles');
        return !!_.size(_.intersection(currentUserRoles, roleArray));
      }
      return false;
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
        $scope.rolesEdit.form.$setPristine();
        $scope.rolesEdit.form.$setUntouched();
        if ($scope.showUserDetailSection) {
          $scope.rolesEdit.form.displayName.$setValidity('notblank', true);
        }
        if ($scope.showRolesSection) {
          $scope.rolesEdit.form.adminRoles.$setValidity('noSelection', true);
        }
      }
    }

    function updateRoles() {
      if ($scope.showComplianceRole && $scope.rolesObj.complianceValue !== isEntitledToCompliance()) {
        $scope.updatingUser = true;
        EdiscoveryService.setEntitledForCompliance(Authinfo.getOrgId(), $scope.currentUser.id, $scope.rolesObj.complianceValue)
          .then(function () {
            setComplianceEntitlement($scope.rolesObj.complianceValue);
            saveForm();
          })
          .catch(function (response) {
            Notification.errorResponse(response, 'profilePage.complianceError');
            $scope.updatingUser = false;
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
                roleName: Config.roles[roleName],
                roleState: Config.roleState.inactive,
              });
            }
          }
          break;
        case 1: // Full admin
          roles.push({
            roleName: Config.roles.full_admin,
            roleState: Config.roleState.active,
          });
          roles.push({
            roleName: Config.roles.readonly_admin,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.sales,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.billing,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.support,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.reports,
            roleState: Config.roleState.inactive,
          });
          if ($scope.showUserRole) {
            roles.push({
              roleName: Config.roles.user_admin,
              roleState: Config.roleState.inactive,
            });
          }
          if ($scope.showDeviceRole) {
            roles.push({
              roleName: Config.roles.device_admin,
              roleState: Config.roleState.inactive,
            });
          }
          break;
        case 2: // Some admin roles
          roles.push({
            roleName: Config.roles.full_admin,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.readonly_admin,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.sales,
            roleState: checkPartialRoles($scope.rolesObj.salesAdminValue),
          });
          roles.push({
            roleName: Config.roles.billing,
            roleState: checkPartialRoles($scope.rolesObj.billingAdminValue),
          });
          roles.push({
            roleName: Config.roles.support,
            roleState: checkPartialRoles($scope.rolesObj.supportAdminValue),
          });
          roles.push({
            roleName: Config.roles.reports,
            roleState: checkPartialRoles($scope.rolesObj.supportAdminValue),
          });
          if ($scope.showUserRole) {
            roles.push({
              roleName: Config.roles.user_admin,
              roleState: checkPartialRoles($scope.rolesObj.userAdminValue),
            });
          }
          if ($scope.showDeviceRole) {
            roles.push({
              roleName: Config.roles.device_admin,
              roleState: checkPartialRoles($scope.rolesObj.deviceAdminValue),
            });
          }
          break;
        case 3: // Readonly admin
          roles.push({
            roleName: Config.roles.full_admin,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.readonly_admin,
            roleState: Config.roleState.active,
          });
          roles.push({
            roleName: Config.roles.sales,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.billing,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.support,
            roleState: Config.roleState.inactive,
          });
          roles.push({
            roleName: Config.roles.reports,
            roleState: Config.roleState.inactive,
          });
          if ($scope.showUserRole) {
            roles.push({
              roleName: Config.roles.user_admin,
              roleState: Config.roleState.inactive,
            });
          }
          if ($scope.showDeviceRole) {
            roles.push({
              roleName: Config.roles.device_admin,
              roleState: Config.roleState.inactive,
            });
          }
          break;
      }

      // Help Desk
      roles.push({
        roleName: Config.roles.helpdesk,
        roleState: ($scope.rolesObj.helpdeskValue ? Config.roleState.active : Config.roleState.inactive),
      });

      // Order Admin role for applicable users
      if ($scope.showOrderAdminRole) {
        roles.push({
          roleName: Config.roles.orderadmin,
          roleState: ($scope.rolesObj.orderAdminValue ? Config.roleState.active : Config.roleState.inactive),
        });
      }

      // Partner Management
      roles.push({
        roleName: Config.roles.partner_management,
        roleState: ($scope.rolesObj.partnerManagementValue ? Config.roleState.active : Config.roleState.inactive),
      });

      roles.push({
        roleName: Config.roles.spark_synckms,
        roleState: (hasRole(Config.backend_roles.spark_synckms) ? Config.roleState.active : Config.roleState.inactive),
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
      if ($scope.showRolesSection) {
        var roles = rolesFromScope();
        if (!_.isEqual(roles, $scope.initialRoles)) {
          return Userservice.patchUserRoles($scope.currentUser.userName, $scope.currentUser.displayName, roles)
            .then(function (response) {
              var userResponse = _.get(response, 'data.userResponse[0]');
              if (userResponse.httpStatus !== 200 || userResponse.status !== 200) {
                Notification.errorResponse(response, 'profilePage.patchError');
              } else {
                $scope.currentUser.roles = userResponse.roles;
              }
            });
        }
      }
    }

    function patchUserData() {
      // Add or delete properties depending on whether or not their value is empty/blank.
      // With property value set to '', the back-end will respond with a 400 error.
      // Guidance from CI team is to not specify any property containing an empty string
      // value. Instead, add the property to meta.attribute to have its value be deleted.
      var userData = {
        schemas: Config.scimSchemas,
        name: {},
        meta: {
          attributes: [],
        },
      };
      if (!$scope.showUserDetailSection) {
        return;
      }
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
            $stateParams.currentUser = response.data;
          });
      }
    }

    function clearCheckboxes() {
      $scope.rolesObj.userAdminValue = false;
      $scope.rolesObj.deviceAdminValue = false;
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
      return $scope.currentUser && (_.includes($scope.currentUser.entitlements, COMPLIANCE) || _.includes($scope.currentUser.entitlements, SPARK_COMPLIANCE));
    }

    function setComplianceEntitlement(compliant) {
      if (compliant) {
        $scope.currentUser.entitlements.push(COMPLIANCE);
      } else {
        _.pull($scope.currentUser.entitlements, COMPLIANCE);
      }
    }

    function checkAdminDisplayName() {
      // If the user is an admin user,
      // the first name, last name and display name cannot be all blank.
      if (!$scope.showUserDetailSection) {
        return;
      }
      if ($scope.rolesObj.adminRadioValue !== 0) {
        var firstName = _.get($scope.formUserData, 'name.givenName', null);
        var lastName = _.get($scope.formUserData, 'name.familyName', null);
        var displayName = _.get($scope.formUserData, 'displayName', null);
        var notAllBlank = !_.isEmpty(firstName) || !_.isEmpty(lastName) || !_.isEmpty(displayName);
        $scope.rolesEdit.form.displayName.$setValidity('notblank', notAllBlank);
      } else {
        $scope.rolesEdit.form.displayName.$setValidity('notblank', true);
      }
      if ($scope.showRolesSection) {
        $scope.rolesEdit.form.adminRoles.$setValidity('noSelection', getPartialAdminValidity());
      }
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
        return $scope.rolesObj.salesAdminValue || $scope.rolesObj.userAdminValue || $scope.rolesObj.deviceAdminValue || $scope.rolesObj.billingAdminValue || $scope.rolesObj.supportAdminValue;
      } else {
        return true;
      }
    }

    function resetAccess() {
      if (!$scope.isProPack) {
        return;
      }
      $scope.resettingAccess = true;
      var userName = _.get($scope, 'currentUser.userName');
      var orgId = _.get($scope, 'currentUser.meta.organizationID');
      Analytics.trackPremiumEvent(Analytics.sections.PREMIUM.eventNames.RESET_ACCESS);
      Auth.revokeUserAuthTokens(userName, orgId)
        .then(function () {
          Notification.success('usersPreview.resetAccessSuccess', { name: userName });
        })
        .catch(function errorHandler(response) {
          Notification.errorResponse(response, 'usersPreview.resetAccessFailure', { name: userName });
        })
        .finally(function () {
          $scope.resettingAccess = false;
        });
    }
  }
})();
