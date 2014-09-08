'use strict';

angular.module('Core')
  .service('Authinfo', ['$rootScope', '$location', 'Utils',
    function Authinfo($rootScope, $location, Utils) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var authData = {
        'username': null,
        'orgname': null,
        'orgid': null,
        'addUserEnabled': null,
        'entitlements': null,
        'services': null,
        'roles': null,
        'tabs': null
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
          $rootScope.services = data.services;
          $rootScope.$broadcast('AuthinfoUpdated');
        },

        clear: function() {
          authData.username = null;
          authData.orgname = null;
          authData.orgid = null;
          authData.addUserEnabled = null;
          authData.entitlements = null;
          authData.services = null;
          authData.tabs = null;
          authData.roles = null;
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

        setTabs: function(allowedTabs) {
          authData.tabs = allowedTabs;
          $rootScope.$broadcast('AllowedTabsUpdated');
        },

        isAllowedTab: function() {
          var curPath = $location.path();
          var flag = false;
          for (var idx in authData.tabs) {
            var tab = authData.tabs[idx];
            if (Utils.startsWith(curPath, tab.path)) {
              flag = true;
              break;
            }
          }
          return flag;
        },

        isEmpty: function() {
          for (var datakey in authData) {
            if (authData[datakey] !== null) {
              return false;
            }
          }
          return true;
        },

        isSquaredTeamMember: function() {
          var roles = this.getRoles();
          return roles.indexOf('WX2_User') > -1;
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
