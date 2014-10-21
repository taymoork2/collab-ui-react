'use strict';

angular.module('Core')
  .service('Authinfo', ['$rootScope', '$location', 'Utils', 'Config', '$filter',
    function Authinfo($rootScope, $location, Utils, Config, $filter) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var authData = {
        'username': null,
        'orgname': null,
        'orgid': null,
        'addUserEnabled': null,
        'entitlements': null,
        'services': null,
        'roles': null,
        'tabs': [],
        'isInitialized': false
      };

      var getTabTitle = function(title) {
        return $filter('translate')(title);
      };

      var isAllowedState = function(state) {
        if (state) {
          if (Config.allowedStates && Config.allowedStates.indexOf(state) !== -1) {
            return true;
          }
          var roles = authData.roles;
          if (roles) {
            for (var i in roles) {
              var role = roles[i];
              if (role && Config.roleStates[role] && Config.roleStates[role].indexOf(state) !== -1) {
                return true;
              }
            }
          }
          var services = authData.services;
          if (services) {
            for (var j in services) {
              var service = services[j];
              if (service && Config.serviceStates[service.ciService] && Config.serviceStates[service.ciService].indexOf(state) !== -1) {
                return true;
              }
            }
          }
        }
        return false;
      };

      //update the tabs when Authinfo data has been populated.
      var initializeTabs = function() {
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
          }
          else if (tabs[i] && !isAllowedState(tabs[i].state)) {
            tabs.splice(i--, 1);
          }
        }
        // TODO this shouldn't be needed - refactor how active state is set
        $rootScope.tabs = tabs;

        //Localize tabs
        for(var index in tabs) {
          tabs[index].title = getTabTitle(tabs[index].title);
          if(tabs[index].subPages) {
            for(var k in tabs[index].subPages) {
              tabs[index].subPages[k].title = $filter('translate')(tabs[index].subPages[k].title);
              tabs[index].subPages[k].desc = $filter('translate')(tabs[index].subPages[k].desc);
            }
          }
        }

        return tabs;
      };

      return {
        initialize: function(data) {
          authData.username = data.name;
          authData.orgname = data.orgName;
          authData.orgid = data.orgId;
          authData.addUserEnabled = data.addUserEnabled;
          authData.entitlements = data.entitlements;
          authData.services = data.services;
          authData.roles = data.roles;
          authData.tabs = initializeTabs();
          // TODO remove this from rootScope
          $rootScope.services = data.services;
          authData.isInitialized = true;
          $rootScope.$broadcast('AuthinfoUpdated');
        },

        clear: function() {
          authData.username = null;
          authData.orgname = null;
          authData.orgid = null;
          authData.addUserEnabled = null;
          authData.entitlements = null;
          authData.services = null;
          authData.tabs = [];
          authData.roles = null;
          authData.isInitialized = false;
        },

        getOrgName: function() {
          return authData.orgname;
        },

        getOrgId: function() {
          return authData.orgid;
        },

        getUserName: function() {
          return authData.username;
        },

        getUserEntitlements: function() {
          return authData.entitlements;
        },

        isAddUserEnabled: function() {
          return authData.addUserEnabled;
        },

        getServices: function() {
          return authData.services;
        },

        getRoles: function() {
          return authData.roles;
        },

        getTabs: function() {
          return authData.tabs;
        },

        isAllowedState: function(state) {
          return isAllowedState(state);
        },

        isInitialized: function() {
          return authData.isInitialized;
        },

        isAdmin: function() {
          var roles = this.getRoles();
          return roles.indexOf('Full_Admin') > -1 || roles.indexOf('PARTNER_ADMIN') > -1;
        },

        isPartner: function() {
          var roles = this.getRoles();
          return roles.indexOf('PARTNER_USER') > -1 || roles.indexOf('PARTNER_ADMIN') > -1;
        },

        isSquaredTeamMember: function() {
          var roles = this.getRoles();
          return roles.indexOf('WX2_User') > -1;
        },

        isSquaredInviter: function() {
          var roles = this.getRoles();
          if(roles !== null && roles.length > 0) {
            return roles.indexOf('WX2_SquaredInviter') > -1;
          } else {
            return null;
          }
        },

        isServiceAllowed: function(service) {
          if (service==='squaredTeamMember' && !this.isSquaredTeamMember()){
            return false;
          }
          else
          {
            return true;
          }
        }
      };
    }
  ]);
