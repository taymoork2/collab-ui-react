'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Authinfo', ['$rootScope',
    function Authinfo($rootScope) {
      // AngularJS will instantiate a singleton by calling "new" on this function
      var authData = {
        'username': null,
        'orgname': null,
        'orgid': null,
        'addUserEnabled': null,
        'services': null
      };

      return {
        initialize: function(data) {
          authData.username = data.name;
          authData.orgname = data.orgName;
          authData.orgid = data.orgId;
          authData.addUserEnabled = data.addUserEnabled;
          authData.services = data.services;
          if (undefined !== $rootScope.services && $rootScope.services.length === 0)
          {
            $rootScope.services = data.services;
          }
          $rootScope.$broadcast('AuthinfoUpdated');
        },

        clear: function() {
          authData.username = null;
          authData.orgname = null;
          authData.orgid = null;
          authData.addUserEnabled = null;
          authData.services = null;
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

        isAddUserEnabled: function() {
          return authData.addUserEnabled;
        },

        getServices: function() {
          return authData.services;
        },

        isEmpty: function() {
          for (var datakey in authData) {
            if (authData[datakey] !== null) {
              return false;
            }
          }
          return true;
        }

      };
    }
  ]);
