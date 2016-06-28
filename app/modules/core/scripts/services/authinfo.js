(function () {
  'use strict';

  angular.module('Core')
    .service('Authinfo', Authinfo);

  /* @ngInject */
  function Authinfo($rootScope, $translate, Config, Localytics) {
    function ServiceFeature(label, value, name, license) {
      this.label = label;
      this.value = value;
      this.name = name;
      this.license = license;
      this.isCustomerPartner = false;
    }

    // AngularJS will instantiate a singleton by calling "new" on this function
    var authData = {
      username: null,
      userId: null,
      orgName: null,
      orgId: null,
      addUserEnabled: null,
      entitleUserEnabled: null,
      managedOrgs: [],
      entitlements: null,
      services: null,
      roles: [],
      isInitialized: false,
      setupDone: false,
      licenses: [],
      messageServices: null,
      conferenceServices: null,
      communicationServices: null,
      careServices: null,
      conferenceServicesWithoutSiteUrl: null,
      cmrServices: null,
      hasAccount: false,
      emails: null,
      customerType: null,
      commerceRelation: null
    };

    var getTabTitle = function (title) {
      return $translate.instant(title);
    };

    var isAllowedState = function (state) {
      if (!state) {
        return false;
      }

      var roles = authData.roles;
      var services = authData.services || [];
      var view = (_.includes(roles, 'PARTNER_ADMIN') || _.includes(roles, 'PARTNER_USER')) ? 'partner' : 'customer';

      // check if the state is part of the restricted list for this view
      if (_.includes(Config.restrictedStates[view], state)) {
        return false;
      }

      var parentState = state.split('.')[0];
      // if the state is in the allowed list, all good
      if (_.includes(Config.publicStates, parentState)) {
        return true;
      }

      // if state for Cisco only AND user in one of Cisco's organisation
      if (_.includes(Config.ciscoOnly, parentState) && (authData.orgId === Config.ciscoOrgId || authData.orgId === Config.ciscoMockOrgId)) {
        return true;
      }

      // if the state is in the allowed list of one or the user's role, all good
      var stateAllowedByARole = _.some(roles, function (role) {
        return _.chain(Config.roleStates)
          .get(role)
          .includes(parentState)
          .value();
      });
      if (stateAllowedByARole) {
        return true;
      }

      // if the state is in the allowed list of one or the user's service, all good
      var stateAllowedByAService = _.some(services, function (service) {
        return _.chain(Config.serviceStates)
          .get(service.ciName)
          .includes(parentState)
          .value();
      });
      return !!stateAllowedByAService;

    };

    var isEntitled = function (entitlement) {
      var services = authData.services;
      if (services) {
        for (var i = 0; i < services.length; i++) {
          var service = services[i];
          if (service && service.ciName === entitlement) {
            return true;
          }
        }
      }
      return false;
    };

    return {
      initialize: function (data) {
        authData.isInDelegatedAdministrationOrg = data.isInDelegatedAdministrationOrg;
        authData.username = data.name;
        authData.orgName = data.orgName;
        authData.orgId = data.orgId;
        authData.addUserEnabled = data.addUserEnabled;
        authData.entitleUserEnabled = data.entitleUserEnabled;
        authData.managedOrgs = data.managedOrgs;
        authData.entitlements = data.entitlements;
        authData.services = data.services;
        authData.roles = data.roles;
        //if Full_Admin or WX2_User and has managedOrgs, add partnerustomers tab as allowed tab
        if (authData.managedOrgs && authData.managedOrgs.length > 0) {
          for (var i = 0; i < authData.roles.length; i++) {
            if (authData.roles[i] === 'Full_Admin' || authData.roles[i] === 'User') {
              this.isCustomerPartner = true;
              authData.roles.push('CUSTOMER_PARTNER');
              break;
            }
          }
        }

        // TODO remove this from rootScope
        $rootScope.services = data.services;
        authData.isInitialized = true;
        authData.setupDone = data.setupDone;
        $rootScope.$broadcast('AuthinfoUpdated');

        Localytics.setOrgId(authData.orgId);
        Localytics.setUserId(authData.userId);
      },
      clear: function () {
        authData.username = null;
        authData.userId = null;
        authData.orgName = null;
        authData.orgId = null;
        authData.addUserEnabled = null;
        authData.entitleUserEnabled = null;
        authData.entitlements = null;
        authData.services = null;
        authData.tabs = [];
        authData.roles = [];
        authData.isInitialized = false;
        authData.setupDone = null;
        authData.emails = null;
      },
      setEmails: function (data) {
        authData.emails = data;
      },
      getEmails: function () {
        return authData.emails;
      },
      getPrimaryEmail: function () {
        for (var emails in authData.emails) {
          if (authData.emails[emails].primary === true) {
            return authData.emails[emails].value;
          }
          return null;
        }
      },
      updateAccountInfo: function (data) {
        if (data) {
          var msgLicenses = [];
          var confLicenses = [];
          var commLicenses = [];
          var cmrLicenses = [];
          var careLicenses = [];
          var confLicensesWithoutSiteUrl = [];
          var customerAccounts = data.customers || [];

          if (customerAccounts.length > 0) {
            authData.hasAccount = true;
          }

          authData.customerType = _.get(customerAccounts, '[0].customerType', '');
          authData.commerceRelation = _.get(customerAccounts, '[0].commerceRelation', '');

          for (var x = 0; x < customerAccounts.length; x++) {

            var customerAccount = customerAccounts[x];
            var customerAccountLicenses = [];

            //If org has subscriptions get the license information from subscriptions, else from licences
            if (_.has(customerAccount, 'licenses')) {
              customerAccountLicenses = _.get(customerAccount, 'licenses');
            } else if (_.has(customerAccount, 'subscriptions[0].licenses')) {
              customerAccountLicenses = _.get(customerAccount, 'subscriptions[0].licenses');
            }

            for (var l = 0; l < customerAccountLicenses.length; l++) {
              var license = customerAccountLicenses[l];
              var service = null;

              // Store license before filtering
              authData.licenses.push(license);

              // Do not store invalid licenses in service buckets
              if (license.status === 'CANCELLED' || license.status === 'SUSPENDED') {
                continue;
              }

              switch (license.licenseType) {
              case 'CONFERENCING':
                if ((this.isCustomerAdmin() || this.isReadOnlyAdmin()) && license.siteUrl && !_.includes(authData.roles, 'Site_Admin')) {
                  authData.roles.push('Site_Admin');
                }
                service = new ServiceFeature($translate.instant(Config.confMap[license.offerName], {
                  capacity: license.capacity
                }), x + 1, 'confRadio', license);
                if (license.siteUrl) {
                  confLicensesWithoutSiteUrl.push(service);
                }
                confLicenses.push(service);
                break;
              case 'MESSAGING':
                service = new ServiceFeature($translate.instant('onboardModal.paidMsg'), x + 1, 'msgRadio', license);
                msgLicenses.push(service);
                break;
              case 'COMMUNICATION':
                service = new ServiceFeature($translate.instant('onboardModal.paidComm'), x + 1, 'commRadio', license);
                commLicenses.push(service);
                break;
              case 'CARE':
                service = new ServiceFeature($translate.instant('onboardModal.paidCare'), x + 1, 'careRadio', license);
                careLicenses.push(service);
                break;
              case 'CMR':
                service = new ServiceFeature($translate.instant('onboardModal.cmr'), x + 1, 'cmrRadio', license);
                cmrLicenses.push(service);
              }
            } //end for
          } //end for
          if (msgLicenses.length !== 0) {
            authData.messageServices = msgLicenses;
          }
          if (confLicenses.length !== 0) {
            authData.conferenceServices = confLicenses;
          }
          if (commLicenses.length !== 0) {
            authData.communicationServices = commLicenses;
          }
          if (careLicenses.length !== 0) {
            authData.careServices = careLicenses;
          }
          if (cmrLicenses.length !== 0) {
            authData.cmrServices = cmrLicenses;
          }
          if (confLicensesWithoutSiteUrl.length !== 0) {
            authData.conferenceServicesWithoutSiteUrl = confLicensesWithoutSiteUrl;
          }
          $rootScope.$broadcast('AccountinfoUpdated');
        } //end if
      },
      getOrgName: function () {
        return authData.orgName;
      },
      getOrgId: function () {
        return authData.orgId;
      },
      getUserName: function () {
        return authData.username;
      },
      setUserId: function (id) {
        authData.userId = id;
      },
      getUserId: function () {
        return authData.userId;
      },
      getUserEntitlements: function () {
        return authData.entitlements;
      },
      isAddUserEnabled: function () {
        return authData.addUserEnabled;
      },
      isEntitleUserEnabled: function () {
        return authData.entitleUserEnabled;
      },
      getServices: function () {
        return authData.services;
      },
      getManagedOrgs: function () {
        return authData.managedOrgs;
      },
      getLicenses: function () {
        return authData.licenses;
      },
      getMessageServices: function () {
        return authData.messageServices;
      },
      getConferenceServices: function () {
        return authData.conferenceServices;
      },
      getCommunicationServices: function () {
        return authData.communicationServices;
      },
      getCareServices: function () {
        return authData.careServices;
      },
      getCmrServices: function () {
        return authData.cmrServices;
      },
      getConferenceServicesWithoutSiteUrl: function () {
        return authData.conferenceServicesWithoutSiteUrl;
      },
      getRoles: function () {
        return authData.roles;
      },
      hasRole: function (role) {
        var roles = this.getRoles();
        return !!(roles && roles.length && (roles.indexOf(role) > -1));
      },
      isSetupDone: function () {
        return authData.setupDone;
      },
      setSetupDone: function (setupDone) {
        authData.setupDone = setupDone;
      },
      getTabs: function () {
        return authData.tabs;
      },
      isAllowedState: function (state) {
        return isAllowedState(state);
      },
      isInitialized: function () {
        return authData.isInitialized;
      },
      isAppAdmin: function () {
        return this.hasRole('Application');
      },
      isAdmin: function () {
        return this.hasRole('Full_Admin') || this.hasRole('PARTNER_ADMIN');
      },
      isReadOnlyAdmin: function () {
        return this.hasRole('Readonly_Admin') && !this.isAdmin();
      },
      isCustomerAdmin: function () {
        return this.hasRole('Full_Admin');
      },
      isCSB: function () {
        return (_.contains(authData.customerType, ['APP_DIRECT', 'CSB']));
      },
      isDirectCustomer: function () {
        return (_.contains(authData.commerceRelation, ['Direct']));
      },
      isPartner: function () {
        return this.hasRole('PARTNER_USER') || this.hasRole('PARTNER_ADMIN');
      },
      isPartnerAdmin: function () {
        return this.hasRole('PARTNER_ADMIN');
      },
      isPartnerReadOnlyAdmin: function () {
        return this.hasRole('PARTNER_READ_ONLY_ADMIN');
      },
      isPartnerSalesAdmin: function () {
        return this.hasRole('PARTNER_SALES_ADMIN');
      },
      isPartnerUser: function () {
        return this.hasRole('PARTNER_USER');
      },
      isSquaredTeamMember: function () {
        return this.hasRole('WX2_User');
      },
      isSquaredInviter: function () {
        return this.hasRole('WX2_SquaredInviter');
      },
      isSupportUser: function () {
        return this.hasRole('Support') && !this.isAdmin();
      },
      isHelpDeskUser: function () {
        return this.hasRole(Config.roles.helpdesk);
      },
      isHelpDeskUserOnly: function () {
        var roles = this.getRoles();
        if (roles && this.isHelpDeskUser()) {
          return _.all(roles, function (role) {
            return role == Config.roles.helpdesk || role == 'PARTNER_USER' || role == 'User';
          });
        }
        return false;
      },
      isComplianceUserOnly: function () {
        var roles = this.getRoles();
        if (roles && this.isComplianceUser()) {
          return _.all(roles, function (role) {
            return role == Config.roles.compliance_user || role == 'PARTNER_USER' || role == 'User';
          });
        }
        return false;
      },
      isServiceAllowed: function (service) {
        return !(service === 'squaredTeamMember' && !this.isSquaredTeamMember());
      },
      isSquaredUC: function () {
        return isEntitled(Config.entitlements.huron);
      },
      isFusion: function () {
        return isEntitled(Config.entitlements.fusion_mgmt);
      },
      isFusionUC: function () {
        return isEntitled(Config.entitlements.fusion_uc);
      },
      isFusionCal: function () {
        return isEntitled(Config.entitlements.fusion_cal);
      },
      isDeviceMgmt: function () {
        return isEntitled(Config.entitlements.room_system);
      },
      isFusionEC: function () {
        return isEntitled(Config.entitlements.fusion_ec);
      },
      hasAccount: function () {
        return authData.hasAccount;
      },
      isCisco: function () {
        return this.getOrgId() === Config.ciscoOrgId;
      },
      isCiscoMock: function () {
        return this.getOrgId() === Config.ciscoMockOrgId;
      },
      isEntitled: function (entitlement) {
        return isEntitled(entitlement);
      },
      isUserAdmin: function () {
        return this.getRoles().indexOf('Full_Admin') > -1;
      },
      isInDelegatedAdministrationOrg: function () {
        return authData.isInDelegatedAdministrationOrg;
      },
      getLicenseIsTrial: function (licenseType, entitlement) {
        var isTrial = _.chain(authData.licenses)
          .reduce(function (isTrial, license) {
            if (entitlement) {
              return license.licenseType === licenseType && _.includes(license.features, entitlement) ? license.isTrial : isTrial;
            }
            return license.licenseType === licenseType ? license.isTrial : isTrial;
          }, undefined)
          .value();

        return isTrial;
      },
      isComplianceUser: function () {
        return this.hasRole(Config.roles.compliance_user);
      }
    };
  }
})();
