'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('Config', function() {
    return {
      adminClientUrl: 'https://admin.wbx2.com/',
      adminServiceUrl: 'https://atlas-integration.wbx2.com/admin/api/v1/',
      //adminServiceUrl: 'http://localhost:8080/atlas-server/admin/api/v1/',
      defaultOrgId: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5',
      oauth2LoginUrlDev: 'https://idbrokerbeta.webex.com/idb/oauth2/v1/authorize?response_type=token&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000&state=random-string&email=',
      oauth2LoginUrlProd: 'https://idbrokerbeta.webex.com/idb/oauth2/v1/authorize?response_type=code&client_id=C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec&scope=webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig&redirect_uri=https%3A%2F%2Fadmin.wbx2.com%2F&state=random-string&email=',
      //logoutUrl: 'https://idbrokerbeta.webex.com/idb/UI/Logout?goto=',
      logoutUrl: 'https://idbrokerbeta.webex.com/idb/saml2/jsp/doSSO.jsp?type=logout&goto=',
      conversationUrl: 'https://conv-a.wbx2.com/conversation/api/v1',
      locusUrl: 'https://locus-a.wbx2.com/locus/api/v1',
      refreshTokenInterval: 30 * 1000, //in seconds. Be sure (refreshTokenInterval < expires_in)

      supportEmailAddress: 'wx2support@external.cisco.com',
      supportEmailSubject: 'WX² Web Feedback',

    };
  });
