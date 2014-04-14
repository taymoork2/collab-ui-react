'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('Config', function() {
    return {

      adminClientUrl: {
        dev: 'http://127.0.0.1:8000',
        integration: 'https://int-admin.wbx2.com',
        prod: 'https://admin.wbx2.com/'
      },

      adminServiceUrl: {
        integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
        prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
      },

      oauth2LoginUrl: {
        dev: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=token&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&state=random-string&service=webex-squared',
        integration: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=token&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization&redirect_uri=https%3A%2F%2Fint-admin.wbx2.com&state=random-string&service=webex-squared',
        prod: 'https://idbroker.webex.com/idb/oauth2/v1/authorize?response_type=token&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization&redirect_uri=https%3A%2F%2Fadmin.wbx2.com%2F&state=random-string&service=webex-squared'
      },

      logoutUrl: 'https://idbroker.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&service=webex-squared&goto=',

      scimUrl: 'https://identity.webex.com/identity/scim/%s/v1/Users',

      usersperpage: 20,

      isDev: function(){
        return document.URL.indexOf('127.0.0.1') !== -1 || document.URL.indexOf('localhost') !== -1;
      },

      isIntegration: function(){
        return document.URL.indexOf('int-admin.wbx2.com') !== -1;
      },

      isProd: function(){
        return document.URL.indexOf('admin.wbx2.com') !== -1;
      }
    };
  });
