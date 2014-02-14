'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('Config', function() {
    return {
      adminUrl: 'http://localhost:8080/atlas-server/atlas/api/v1/',
      defaultOrgId: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5',
      conversationUrl: 'https://conv-a.wbx2.com/conversation/api/v1',
      locusUrl: 'https://locus-a.wbx2.com/locus/api/v1',
      logoutUrl: 'https://idbrokerbeta.webex.com/idb/UI/Logout',
      refreshTokenInterval: 30 * 1000, //in seconds. Be sure (refreshTokenInterval < expires_in)
      privateMessagePrefix: '___ignore___',

      supportEmailAddress: 'wx2support@external.cisco.com',
      supportEmailSubject: 'WX² Web Feedback',

      notificationTimeout: 3000,

      isDev: function() {
        var dev = localStorage.getItem('dev');
        if (dev !== null && dev.toLowerCase() === 'true') {
          return true;
        } else {
          return false;
        }
      },

      chatView: function() {
        return '/convo/';
      },
    };
  });
