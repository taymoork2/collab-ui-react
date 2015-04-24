'use strict';

angular.module('Core')
  .service('Authinfo', ['$rootScope', '$location', 'Utils', 'Config', '$translate',
    function Authinfo($rootScope, $location, Utils, Config, $translate) {
      function ServiceFeature(label, value, name, license) {
        this.label = label;
        this.value = value;
        this.name = name;
        this.license = license;
        this.isCustomerPartner = false;
      }

      // AngularJS will instantiate a singleton by calling "new" on this function
      var authData = {
        'username': null,
        'orgname': null,
        'orgid': null,
        'addUserEnabled': null,
        'entitleUserEnabled': null,
        'managedOrgs': [],
        'entitlements': null,
        'services': null,
        'roles': [],
        'tabs': [],
        'isInitialized': false,
        'setupDone': false,
        'messageServices': null,
        'conferenceServices': null,
        'communicationServices': null,
        'hasAccount': false,
        'email': null
      };

      var getTabTitle = function (title) {
        return $translate.instant(title);
      };
      var isAllowedState = function (state) {
        if (state) {
          // if nested state only check parent state
          var parentState = state.split('.');
          if (Config.allowedStates && Config.allowedStates.indexOf(parentState[0]) !== -1) {
            return true;
          }
          var roles = authData.roles;
          if (roles) {
            for (var i in roles) {
              var role = roles[i];
              if (role && Config.roleStates[role] && Config.roleStates[role].indexOf(parentState[0]) !== -1) {
                return true;
              }
            }
          }
          var services = authData.services;
          if (services) {
            for (var j in services) {
              var service = services[j];
              if (service && Config.serviceStates[service.ciService] && Config.serviceStates[service.ciService].indexOf(parentState[0]) !== -1) {
                return true;
              }
            }
          }
        }
        return false;
      };
      //update the tabs when Authinfo data has been populated.
      var initializeTabs = function () {
        var tabs = angular.copy(Config.tabs);
        // Remove states out of tab structure that are not allowed or had all their subPages removed
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i] && tabs[i].subPages) {
            for (var j = 0; j < tabs[i].subPages.length; j++) {
              if (tabs[i].subPages[j] && !isAllowedState(tabs[i].subPages[j].state)) {
                tabs[i].subPages.splice(j--, 1);
              }
            }
            if (tabs[i].subPages.length === 0) {
              tabs.splice(i--, 1);
            }
          } else if (tabs[i] && !isAllowedState(tabs[i].state)) {
            tabs.splice(i--, 1);
          }
        }
        //Localize tabs
        for (var index in tabs) {
          tabs[index].title = getTabTitle(tabs[index].title);
          if (tabs[index].subPages) {
            for (var k in tabs[index].subPages) {
              tabs[index].subPages[k].title = $translate.instant(tabs[index].subPages[k].title);
              tabs[index].subPages[k].desc = $translate.instant(tabs[index].subPages[k].desc);
            }
          }
        }
        return tabs;
      };

      var isEntitled = function (entitlement) {
        var services = authData.services;
        if (services) {
          for (var i = 0; i < services.length; i++) {
            var service = services[i];
            if (service && service.ciService === entitlement) {
              return true;
            }
          }
        }
        return false;
      };
      return {
        initialize: function (data) {
          authData.username = data.name;
          authData.orgname = data.orgName;
          authData.orgid = data.orgId;
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
        },
        initializeTabs: function () {
          authData.tabs = initializeTabs();
        },
        clear: function () {
          authData.username = null;
          authData.orgname = null;
          authData.orgid = null;
          authData.addUserEnabled = null;
          authData.entitleUserEnabled = null;
          authData.entitlements = null;
          authData.services = null;
          authData.tabs = [];
          authData.roles = [];
          authData.isInitialized = false;
          authData.setupDone = null;
          authData.email = null;
        },
        setEmail: function (data) {
          authData.email = data;
        },
        getEmail: function () {
          return authData.email;
        },
        getPrimaryEmail: function () {
          for (var emails in authData.email) {
            if (authData.email[emails].primary === true) {
              return authData.email[emails].value;
            }
            return null;
          }
        },
        updateAccountInfo: function (data) {
          if (data) {
            var msgLicenses = [];
            var confLicenses = [];
            var commLicenses = [];
            var accounts = data.accounts;

            if (accounts.length > 0) {
              authData.hasAccount = true;
            }
            for (var x = 0; x < accounts.length; x++) {
              var account = accounts[x];
              for (var l = 0; l < account.licenses.length; l++) {
                var license = account.licenses[l];
                var service = null;

                switch (license.licenseType) {
                case 'CONFERENCING':
                  if (this.isCustomerAdmin() && license.siteUrl) {
                    authData.roles.push('Site_Admin');
                  }

                  service = new ServiceFeature($translate.instant(Config.confMap[license.offerName], {
                    capacity: license.capacity
                  }), x + 1, 'confRadio', license);
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
            $rootScope.$broadcast('AccountinfoUpdated');
          } //end if
        },
        getOrgName: function () {
          return authData.orgname;
        },
        getOrgId: function () {
          return authData.orgid;
        },
        getUserName: function () {
          return authData.username;
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
        getMessageServices: function () {
          return authData.messageServices;
        },
        getConferenceServices: function () {
          return authData.conferenceServices;
        },
        getCommunicationServices: function () {
          return authData.communicationServices;
        },
        getRoles: function () {
          return authData.roles;
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
        isAdmin: function () {
          var roles = this.getRoles();
          return roles.indexOf('Full_Admin') > -1 || roles.indexOf('PARTNER_ADMIN') > -1;
        },
        isCustomerAdmin: function () {
          var roles = this.getRoles();
          return roles.indexOf('Full_Admin') > -1;
        },
        isPartner: function () {
          var roles = this.getRoles();
          if (roles) {
            return roles.indexOf('PARTNER_USER') > -1 || roles.indexOf('PARTNER_ADMIN') > -1;
          } else {
            return false;
          }
        },
        isPartnerAdmin: function () {
          var roles = this.getRoles();
          if (roles) {
            return roles.indexOf('PARTNER_ADMIN') > -1;
          } else {
            return false;
          }
        },
        isPartnerUser: function () {
          var roles = this.getRoles();
          if (roles) {
            return roles.indexOf('PARTNER_USER') > -1;
          } else {
            return false;
          }
        },
        isSquaredTeamMember: function () {
          var roles = this.getRoles();
          return roles.indexOf('WX2_User') > -1;
        },
        isSquaredInviter: function () {
          var roles = this.getRoles();
          if (roles !== null && roles.length > 0) {
            return roles.indexOf('WX2_SquaredInviter') > -1;
          } else {
            return null;
          }
        },
        isServiceAllowed: function (service) {
          if (service === 'squaredTeamMember' && !this.isSquaredTeamMember()) {
            return false;
          } else {
            return true;
          }
        },
        isSquaredUC: function () {
          return isEntitled(Config.entitlements.huron);
        },
        isFusion: function () {
          return isEntitled(Config.entitlements.fusion_uc) || isEntitled(Config.entitlements.fusion_cal);
        },
        isFusionUC: function () {
          return isEntitled(Config.entitlements.fusion_uc);
        },
        isFusionCal: function () {
          return isEntitled(Config.entitlements.fusion_cal);
        },
        hasAccount: function () {
          return authData.hasAccount;
        },
        isCisco: function () {
          return this.getOrgId() === Config.ciscoOrgId;
        }
      };
    }
  ]);
