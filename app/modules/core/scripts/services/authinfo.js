(function () {
  'use strict';

  module.exports = angular.module('core.authinfo', [
    require('angular-translate'),
    require('modules/core/config/config').default,
    require('modules/core/config/tabConfig'),
  ])
    .service('Authinfo', Authinfo)
    .name;

  /* @ngInject */
  function Authinfo($rootScope, $translate, Config) {
    var authData = getNewAuthData();
    var hasCDCOffer = false;
    var hasCVCOffer = false;

    function ServiceFeature(label, value, name, license) {
      this.label = label;
      this.value = value;
      this.name = name;
      this.license = license;
      this.isCustomerPartner = false;
    }

    function getNewAuthData() {
      return {
        addUserEnabled: null,
        careServices: [],
        cmrServices: null,
        commerceRelation: null,
        communicationServices: null,
        conferenceServices: null,
        conferenceServicesWithoutSiteUrl: null,
        customerAccounts: [],
        customerType: null,
        customerView: true,
        emails: null,
        entitleUserEnabled: null,
        hasAccount: false,
        isInitialized: false,
        licenses: [],
        managedOrgs: [],
        messageServices: null,
        orgId: null,
        orgName: null,
        roles: [],
        services: [],
        setupDone: false,
        subscriptions: [],
        userId: null,
        userName: null,
        userOrgId: null,
        commPartnerOrgId: null,
        roomPartnerOrgId: null,
        carePartnerOrgId: null,
        customerAdminEmail: null,
      };
    }

    function isEntitled(entitlement) {
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
    }

    function isLicensed(license) {
      var licenseData = _.find(authData.licenses, function (searchLicense) {
        return searchLicense.licenseType === license;
      });
      return !_.isUndefined(licenseData);
    }

    return {
      initialize: function (data) {
        authData.isInDelegatedAdministrationOrg = data.isInDelegatedAdministrationOrg;
        authData.userName = data.name;
        authData.userId = data.uuid;
        authData.orgName = data.orgName;
        authData.orgId = data.orgId;
        authData.userOrgId = data.userOrgId;
        authData.addUserEnabled = data.addUserEnabled;
        authData.entitleUserEnabled = data.entitleUserEnabled;
        authData.managedOrgs = data.managedOrgs || [];
        authData.services = data.services || [];
        authData.roles = data.roles || [];
        //if Full_Admin or WX2_User and has managedOrgs, add partnerustomers tab as allowed tab
        if (authData.managedOrgs && authData.managedOrgs.length > 0) {
          for (var i = 0; i < authData.roles.length; i++) {
            if (authData.roles[i] === Config.roles.full_admin || authData.roles[i] === 'User') {
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
      },
      clear: function () {
        authData = getNewAuthData();
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
        if (!data) {
          return;
        }

        var msgLicenses = [];
        var confLicenses = [];
        var commLicenses = [];
        var cmrLicenses = [];
        var careLicenses = [];
        var confLicensesWithoutSiteUrl = [];
        var confLicensesLinkedSiteUrl = [];
        var accounts = data.customers || [];
        authData.hasAccount = accounts.length > 0;
        authData.customerAccounts = accounts;

        authData.customerType = _.get(accounts, '[0].customerType', '');
        authData.customerId = _.get(accounts, '[0].customerId');
        authData.commerceRelation = _.get(accounts, '[0].commerceRelation', '');
        authData.subscriptions = _.without(_.flattenDeep(_.map(accounts, 'subscriptions')), undefined);
        authData.customerAdminEmail = _.get(accounts, '[0].customerAdminEmail');

        _.forEach(accounts, function (account, accountIndex) {
          var licenses = [];
          // If org has subscriptions get the license information from subscriptions, else from licences
          if (_.has(account, 'subscriptions')) {
            licenses = _.flatMap(account.subscriptions, 'licenses');
          } else if (_.has(account, 'licenses')) {
            licenses = _.get(account, 'licenses', []);
          }

          _.forEach(licenses, function (license) {
            var service = null;

            // Store license before filtering
            authData.licenses.push(license);

            // Do not store invalid licenses in service buckets
            if (license.status === Config.licenseStatus.CANCELLED || license.status === Config.licenseStatus.SUSPENDED) {
              return;
            }

            switch (license.licenseType) {
              case Config.licenseTypes.CONFERENCING:
                if ((this.isCustomerAdmin() || this.isReadOnlyAdmin()) &&
                  (license.siteUrl || license.linkedSiteUrl) &&
                  !_.includes(authData.roles, 'Site_Admin')) {
                  authData.roles.push('Site_Admin');
                }
                service = new ServiceFeature($translate.instant(Config.confMap[license.offerName], {
                  capacity: license.capacity,
                }), accountIndex + 1, 'confRadio', license);
                if (license.siteUrl) {
                  confLicensesWithoutSiteUrl.push(service);
                }
                if (license.linkedSiteUrl) {
                  confLicensesLinkedSiteUrl.push(service);
                }
                confLicenses.push(service);
                break;
              case Config.licenseTypes.MESSAGING:
                service = new ServiceFeature($translate.instant('onboardModal.paidMsg'), accountIndex + 1, 'msgRadio', license);
                msgLicenses.push(service);
                break;
              case Config.licenseTypes.COMMUNICATION:
                service = new ServiceFeature($translate.instant('onboardModal.paidComm'), accountIndex + 1, 'commRadio', license);
                commLicenses.push(service);
                // store the partner for Communication license
                authData.commPartnerOrgId = license.partnerOrgId;
                break;
              case Config.licenseTypes.SHARED_DEVICES:
                // store the partner for shared devices(room systems) license
                authData.roomPartnerOrgId = license.partnerOrgId;
                break;
              case Config.licenseTypes.CARE:
                if (license.offerName === Config.offerCodes.CDC) {
                  service = new ServiceFeature($translate.instant('onboardModal.paidCDC'), accountIndex + 1, 'careRadio', license);
                  hasCDCOffer = true;
                } else if (license.offerName === Config.offerCodes.CVC) {
                  service = new ServiceFeature($translate.instant('onboardModal.paidCVC'), accountIndex + 1, 'careRadio', license);
                  hasCVCOffer = true;
                }
                careLicenses.push(service);

                // store the partner for Care license
                authData.carePartnerOrgId = license.partnerOrgId;
                break;
              case Config.licenseTypes.CMR:
                service = new ServiceFeature($translate.instant('onboardModal.cmr'), accountIndex + 1, 'cmrRadio', license);
                cmrLicenses.push(service);
                break;
            }
          }.bind(this));
        }.bind(this));
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
        if (confLicensesLinkedSiteUrl.length !== 0) {
          authData.conferenceServicesWithLinkedSiteUrl = confLicensesLinkedSiteUrl;
        }
        $rootScope.$broadcast('AccountinfoUpdated');
      },
      getOrgName: function () {
        return authData.orgName;
      },
      getOrgId: function () {
        // The orgId of the managed org (can be a different org than the logged in user when delegated admin)
        return authData.orgId;
      },
      getCommPartnerOrgId: function () {
        // The orgId of the partner who enabled COMMUNICATION license
        return authData.commPartnerOrgId;
      },
      getRoomPartnerOrgId: function () {
        // The orgId of the partner who enabled SHARED_DEVICES license
        return authData.roomPartnerOrgId;
      },
      getCarePartnerOrgId: function () {
        // The orgId of the partner who enabled CARE license
        return authData.carePartnerOrgId;
      },
      // When partner logs in, it will be the partner admin email
      // but partner admin chooses to login to customer portal it will be customer admin email
      getCustomerAdminEmail: function () {
        return authData.customerAdminEmail;
      },
      getUserOrgId: function () {
        // The orgId of the org the user is homed (can be a different org than the org being managed in getOrgId)
        return authData.userOrgId;
      },
      getCustomerId: function () {
        return authData.customerId;
      },
      getCustomerAccounts: function () {
        return authData.customerAccounts;
      },
      isEnterpriseCustomer: function () {
        var isEnterpriseCustomerType = _.some(authData.customerAccounts, { customerType: Config.customerTypes.enterprise });
        var isPendingCustomerType = _.some(authData.customerAccounts, { customerType: Config.customerTypes.pending });
        var isPartnerCommerceRelation = _.some(authData.customerAccounts, { commerceRelation: Config.commerceRelation.partner });
        return isEnterpriseCustomerType || isPendingCustomerType || isPartnerCommerceRelation;
      },
      // FIXME: ATLAS-1402
      // IMPORTANT: 'username' can possibly reflect a user's display name, use 'getPrimaryEmail()'
      //   if needing the email value that the user logged in with
      getUserName: function () {
        return authData.userName;
      },
      setUserId: function (id) {
        authData.userId = id;
      },
      getUserId: function () {
        return authData.userId;
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
      getSubscriptions: function () {
        return authData.subscriptions;
      },
      getMessageServices: function (params) {
        if (_.get(params, 'assignableOnly')) {
          var result = _.filter(authData.messageServices, function (serviceFeature) {
            var license = _.get(serviceFeature, 'license');
            return !this.isExternallyManagedLicense(license);
          }.bind(this));
          return _.size(result) ? result : null;
        }
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
      getConferenceServicesWithLinkedSiteUrl: function () {
        return authData.conferenceServicesWithLinkedSiteUrl;
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

        // allow the support state in the special case where the user is exclusively Help Desk AND a Compliance User
        if (parentState === 'support' && this.isHelpDeskAndComplianceUserOnly()) {
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

        // if the state is in the allowed list of one or the user's service, and the user is not
        // a User_Admin or Device_Admin, all good
        if (!this.isUserAdminUser() && !this.isDeviceAdminUser()) {
          var stateAllowedByAService = _.some(services, function (service) {
            return _.chain(Config.serviceStates)
              .get(service.ciName)
              .includes(parentState)
              .value();
          });
          return !!stateAllowedByAService;
        }
        return false;
      },
      isInitialized: function () {
        return authData.isInitialized;
      },
      isAppAdmin: function () {
        return this.hasRole('Application');
      },
      isAdmin: function () {
        return this.hasRole(Config.roles.full_admin) || this.hasRole('PARTNER_ADMIN');
      },
      isReadOnlyAdmin: function () {
        return this.hasRole('Readonly_Admin') && !this.isAdmin();
      },
      isCustomerAdmin: function () {
        return this.hasRole(Config.roles.full_admin);
      },
      isOnline: function () {
        return !this.isPartner() && !this.isPartnerSalesAdmin() && _.eq(authData.customerType, 'Online');
      },
      isPending: function () {
        return _.eq(authData.customerType, 'Pending');
      },
      isCustomerView: function () {
        return authData.customerView;
      },
      setCustomerView: function (bool) {
        authData.customerView = bool;
      },
      isCSB: function () {
        return (_.eq(authData.customerType, 'CSB'));
      },
      isCustomerLaunchedFromPartner: function () {
        return authData.orgId !== authData.userOrgId;
      },
      isDirectCustomer: function () {
        return (_.eq(authData.commerceRelation, 'Direct'));
      },
      isPartnerManagedCustomer: function () {
        return (_.eq(authData.customerType, 'Partner'));
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
      isUserAdminUser: function () {
        return this.hasRole('User_Admin') && !this.isAdmin();
      },
      isDeviceAdminUser: function () {
        return this.hasRole('Device_Admin') && !this.isAdmin();
      },
      isTechSupport: function () {
        return this.hasRole('Tech_Support');
      },
      isHelpDeskUser: function () {
        return this.hasRole(Config.roles.helpdesk);
      },
      isHelpDeskUserOnly: function () {
        var roles = this.getRoles();
        if (roles && this.isHelpDeskUser()) {
          return _.every(roles, function (role) {
            return role == Config.roles.helpdesk || role == 'PARTNER_USER' || role == 'User';
          });
        }
        return false;
      },
      isOrderAdminUser: function () {
        return this.hasRole(Config.roles.orderadmin);
      },
      isComplianceUserOnly: function () {
        var roles = this.getRoles();
        if (roles && this.isComplianceUser()) {
          return _.every(roles, function (role) {
            return role == Config.roles.compliance_user || role == 'PARTNER_USER' || role == 'User';
          });
        }
        return false;
      },
      isHelpDeskAndComplianceUserOnly: function () {
        var roles = this.getRoles();
        if (roles && this.isHelpDeskUser() && this.isComplianceUser()) {
          return _.every(roles, function (role) {
            return role == Config.roles.helpdesk || role == Config.roles.compliance_user || role == 'PARTNER_USER' || role == 'User';
          });
        }
        return false;
      },
      isServiceAllowed: function (service) {
        return !(service === 'squaredTeamMember' && !this.isSquaredTeamMember());
      },
      hasCallLicense: function () {
        return isLicensed(Config.licenseTypes.COMMUNICATION);
      },
      hasCareLicense: function () {
        return isLicensed(Config.licenseTypes.CARE);
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
      isFusionGoogleCal: function () {
        return isEntitled(Config.entitlements.fusion_gcal);
      },
      isFusionEC: function () {
        return isEntitled(Config.entitlements.fusion_ec);
      },
      isFusionIMP: function () {
        return isEntitled(Config.entitlements.imp);
      },
      isFusionMedia: function () {
        return isEntitled(Config.entitlements.mediafusion);
      },
      isFusionHDS: function () {
        return isEntitled(Config.entitlements.hds);
      },
      isDeviceMgmt: function () {
        return isEntitled(Config.entitlements.room_system);
      },
      isWebexSquared: function () {
        return isEntitled(Config.entitlements.squared);
      },
      isWebexMessenger: function () {
        return isEntitled(Config.entitlements.messenger);
      },
      isContactCenterContext: function () {
        return isEntitled(Config.entitlements.context);
      },
      isMessageEntitled: function () {
        return isEntitled(Config.entitlements.message);
      },
      isCare: function () {
        return isEntitled(Config.entitlements.care);
      },
      // TODO: refactor isCareVoice(), isCareAndCDC() and isCareVoiceAndCVC() when ccc-digital is getting implemented
      isCareVoice: function () {
        return isEntitled(Config.entitlements.care_inbound_voice);
      },
      isCareAndCDC: function () {
        return isEntitled(Config.entitlements.care) && hasCDCOffer;
      },
      isCareVoiceAndCVC: function () {
        return isEntitled(Config.entitlements.care_inbound_voice) && hasCVCOffer;
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
        return this.hasRole(Config.roles.full_admin);
      },
      isInDelegatedAdministrationOrg: function () {
        return authData.isInDelegatedAdministrationOrg;
      },
      isPremium: function () {
        return _.some(authData.licenses, function (license) {
          return license.offerName === Config.offerCodes.MGMTPRO;
        });
      },
      isOnlineCustomer: function () {
        return _.some(this.getCustomerAccounts(), { customerType: 'Online' });
      },
      isOnlineOnlyCustomer: function () {
        return _.every(this.getCustomerAccounts(), { customerType: 'Online' });
      },
      isOnlinePaid: function () {
        return _.some(this.getSubscriptions(), { orderingTool: 'DIGITAL_RIVER' });
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
      },
      getCallPartnerOrgId: function () {
        // On Login to partner portal, orgid has the partner info
        // On Login to customer portal, need to get the call partner info from services licenses data
        if (this.isPartner()) {
          return this.getOrgId();
        }
        return this.getCommPartnerOrgId() || this.getRoomPartnerOrgId() || this.getCarePartnerOrgId() || this.getOrgId();
      },
      addEntitlement: function (entitlementObj) {
        var entitlement = _.get(entitlementObj, 'ciName');
        if (!isEntitled(entitlement)) {
          this.getServices().push(entitlementObj);
        }
      },
      removeEntitlement: function (entitlement) {
        if (!isEntitled(entitlement)) {
          return;
        }
        _.remove(this.getServices(), { ciName: entitlement });
      },
      isExternallyManagedLicense: function (license) {
        // as of 2017-05-17, only licenses matching { offerName: 'MSGR' } are known to be managed externally
        var offerName = _.get(license, 'offerName');
        return offerName === Config.offerCodes.MSGR;
      },
    };
  }
})();
