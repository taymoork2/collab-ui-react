'use strict';

/* global Promise */

var _ = require('lodash');
var request = require('request');
var testConfig = require('../e2e-protractor/utils/test.config');

var auth = {
  'sqtest-admin': {
    user: 'sqtest-admin@squared.example.com',
    pass: 'P@ssword123',
    org: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5'
  },
  'pbr-admin': {
    user: 'pbr-org-admin@squared2webex.com',
    pass: 'P@ssword123',
    org: '4214d345-7caf-4e32-b015-34de878d1158'
  },
  'partner-admin': {
    user: 'atlaspartneradmin@atlas.test.com',
    pass: 'P@ssword123',
    org: 'c054027f-c5bd-4598-8cd8-07c08163e8cd'
  },
  'partner-reports': {
    user: 'admin@sparkucreports-testpartner.com',
    pass: 'Cisco123!',
    org: 'd71b4d69-721a-41b1-ae4b-6e0305eab12b'
  },
  'partner-sales-user': {
    user: 'phtest77+salesadmin@gmail.com',
    pass: 'P@ssword123',
    org: '7e268021-dc11-4728-b39d-9ba0e0abb5e0'
  },
  'partner-reports-sales-admin': {
    user: 'kingkuntauser4+1715@gmail.com',
    pass: 'Cisco123!',
    org: 'ce8d17f8-1734-4a54-8510-fae65acc505e'
  },
  'pbr-admin-test': {
    user: 'pbr-org-admin-test@wx2.example.com',
    pass: 'C1sco123!',
    org: '4214d345-7caf-4e32-b015-34de878d1158'
  },
  'test-user': {
    user: 'atlasmapservice+ll1@gmail.com',
    pass: 'P@ssword123',
    org: '75653d2f-1675-415c-aa5d-c027233f68fe'
  },
  'huron-int1': {
    user: 'admin@int1.huron-alpha.com',
    pass: 'Cisco123!',
    org: '7e88d491-d6ca-4786-82ed-cbe9efb02ad2'
  },
  'huron-e2e': {
    user: 'admin@uc.e2e.huron-alpha.com',
    pass: 'C1sco123!',
    org: '30fdb01e-0bb2-4ed4-97f4-84a2289bdc79'
  },
  'huron-e2e-partner': {
    user: 'admin@ucpartner.e2e.huronalpha.com',
    pass: 'C1sco123!',
    org: '666a7b2f-f82e-4582-9672-7f22829e728d'
  },
  'account-admin': {
    user: 'phtest77+acc2@gmail.com',
    pass: 'Cisco123!!',
    org: '58f01b76-2b3f-4c91-ad8a-e2af626fc7a5'
  },
  'non-trial-admin': {
    user: 'pbr-test-admin@squared2webex.com',
    pass: 'P@ssword123',
    org: '4214d345-7caf-4e32-b015-34de878d1158'
  },
  'invite-admin': {
    user: 'pbr-invite-user@squared2webex.com',
    pass: 'P@ssword123',
    org: '4214d345-7caf-4e32-b015-34de878d1158'
  },
  'support-admin': {
    user: 'sqtest-admin-support@squared.example.com',
    pass: 'C1sc0123!',
    org: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5'
  },
  'media-super-admin': {
    user: 'super-admin@mfusion1webex.com',
    pass: 'C1sc0123!',
    org: 'baab1ece-498c-452b-aea8-1a727413c818'
  },
  'customer-support-admin': {
    user: 'admin@csreptestdom.collaborate.com',
    pass: 'P@ssword123',
    org: 'c1e59258-29e1-42d7-bfa7-84ab26632b46'
  },
  'customer-support-user': {
    user: 'regUser1@csreptestdom.collaborate.com',
    pass: 'C1sc0123!',
    org: 'c1e59258-29e1-42d7-bfa7-84ab26632b46'
  },
  'customer-regular-user': {
    user: 'regUser2@csreptestdom.collaborate.com',
    pass: 'P@ssword123',
    org: 'c1e59258-29e1-42d7-bfa7-84ab26632b46'
  },
  'multiple-subscription-user': {
    user: 'int-esub-1@mailinator.com',
    pass: 'P@ssword123',
    org: '9d173ec9-198e-430d-9363-688a333bdee7'
  },
  'selfsign-sso-admin': {
    user: 'phtest77+dontdeleteme@gmail.com',
    pass: 'C1sc0123!',
    org: 'e9e33cac-eb07-4c34-8240-d08a43d0adce'
  },
  'mockcisco-support-user': {
    user: 'phtest77+testbilling@gmail.com',
    pass: 'C1sc0123!',
    org: 'd30a6828-dc35-4753-bab4-f9b468828688'
  },
  'contactcenter-admin': {
    user: 'sunlight-integ-test-admn@outlook.com',
    pass: 'C1sco123=',
    org: '676a82cd-64e9-4ebd-933c-4dce087a02bd'
  },
  'aa-admin': {
    user: 'indigoAA02+1@gmail.com',
    pass: 'Cisc0123!',
    org: '7e0f0f48-0582-444e-ac75-908a36b29539'
  },
  'wbx-t31BTSTestAdmin-Reports-Configure': {
    user: 'provteam+mc200@csgtrials.webex.com',
    pass: 'Cisco!23',
    org: '2039e7a3-6feb-4293-b87d-354ba68b0295'
  },
  'wbx-t30BTSTestAdmin-Reports-Configure': {
    user: 'provteam+mc25@csgtrials.webex.com',
    pass: 'Cisco!23',
    org: '52cd61a3-a950-47c3-8218-55429ff88eb7'
  },
  'wbx-t31BTSTestAdmin-UserSettings': {
    user: 'provteam+t31ee@csgtrials.webex.com',
    pass: 'Cisco!23',
    org: 'b98940d4-2985-46ef-8c1a-ae8c1ef723ad'
  },
  'wbx-t30BTSTestAdmin-UserSettings': {
    user: 'provteam+ee@csgtrials.webex.com',
    pass: 'Cisco!23',
    org: 'fc3868a5-5bfd-47d5-b39f-52af4d6ede42'
  },
  'wbx-t31RegressionTestAdmin': {
    user: 't31r1-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'b322c279-22d8-488f-a670-cdcb6380033e'
  },
  'wbx-t30RegressionTestAdmin': {
    user: 't30sp6-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'a6c8fdc7-1b74-4d0c-9d24-bd8c20048a84'
  },
  'wbx-t30BTSTestAdmin-MultiLicense': {
    user: 'provteam+mc25@csgtrials.webex.com',
    pass: 'Cisco!23',
    org: '52cd61a3-a950-47c3-8218-55429ff88eb7'
  },
  'wbx-t30BTSTestAdmin-SingleLicense': {
    user: 'provteam+mc@csgtrials.webex.com',
    pass: 'Cisco!23',
    org: '0988dcdc-af6e-4624-9387-b4b6fa7df4e3'
  },
  'wbx-singleCenterLicenseTestAdmin': {
    user: 't30sp6-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'a6c8fdc7-1b74-4d0c-9d24-bd8c20048a84'
  },
  'wbx-multipleCenterLicenseTestAdmin': {
    user: 't31r1-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'b322c279-22d8-488f-a670-cdcb6380033e'
  },
  'wbx-siteCsvTestAdmin': {
    user: 'dev-dmz-e2e@mailinator.com',
    pass: 'Cisco!23',
    org: '06db50d9-a129-4a1f-9ee9-bcff65246b15'
  }
};

var clientId = 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec';
var clientSecret = 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857';

var getSSOToken = function (req, jar, creds) {
  return new Promise(function (resolve, reject) {
    var opts = {
      url: 'https://idbroker.webex.com/idb/UI/Login?org=' + creds.org,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        IDToken1: creds.user,
        IDToken2: creds.pass
      }
    };
    req.post(opts, function (err, res, body) {
      if (err) {
        console.error(err, body);
        reject('Failed to fetch SSO token from CI. Status: ' + (res != null ? res.statusCode : void 0));
      }
      var cookie = _.find(res.headers['set-cookie'], function (c) {
        return c.indexOf('cisPRODAMAuthCookie') !== -1;
      });
      if (!cookie) {
        reject('Failed to retrieve a cookie with org credentials. Status: ' + (res != null ? res.statusCode : void 0));
      }
      var token = cookie.match(/cisPRODAMAuthCookie=(.*); Domain/)[1];
      jar.setCookie('cisPRODiPlanetDirectoryPro=' + token + ' ; path=/; domain=.webex.com', 'https://idbroker.webex.com/');
      resolve();
    });
  });
};

var getAuthCode = function (req, creds) {
  return new Promise(function (resolve, reject) {
    var rand_str = '';
    while (rand_str.length < 40) {
      rand_str += Math.random().toString(36).substr(2);
    }
    rand_str.substr(0, 40);
    var opts = {
      url: 'https://idbroker.webex.com/idb/oauth2/v1/authorize',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        response_type: 'code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        client_id: clientId,
        scope: testConfig.oauth2Scope,
        realm: '/' + creds.org,
        state: rand_str
      }
    };
    req.post(opts, function (err, res, body) {
      var ref;
      if (err) {
        console.error(err, body);
        reject('Failed to fetch Auth Code from CI. Status: ' + (res != null ? res.statusCode : void 0));
      }
      var code = (ref = body.match(/<title>(.*)</)) != null ? ref[1] : void 0;
      if (!code) {
        console.error(body);
        reject('Failed to extract Auth Code. Status: ' + (res != null ? res.statusCode : void 0));
      }
      resolve(code);
    });
  });
};

var getAccessToken = function (req, code) {
  return new Promise(function (resolve, reject) {
    var opts = {
      url: 'https://idbroker.webex.com/idb/oauth2/v1/access_token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
      },
      auth: {
        user: clientId,
        pass: clientSecret
      }
    };
    req.post(opts, function (err, res, body) {
      var e;
      if (err) {
        console.error(err, body);
        reject('Failed to fetch Access Token from CI. Status: ' + (res != null ? res.statusCode : void 0));
      }
      var obj = (function () {
        try {
          return JSON.parse(body);
        } catch (_error) {
          e = _error;
          console.error(body);
          reject('Failed to parse Access Token JSON. Status: ' + (res != null ? res.statusCode : void 0));
        }
      })();
      if (!(obj != null ? obj.access_token : void 0)) {
        console.error(body);
        reject('Failed to extract Access Token. Status: ' + (res != null ? res.statusCode : void 0));
      }
      resolve(obj.access_token);
    });
  });
};

module.exports = {
  getBearerToken: function (user, callback) {
    var creds = auth[user];
    if (!creds) {
      var message = 'Credentials for ' + user + ' not found';
      console.error(message);
      return Promise.reject(message);
    }
    var jar = request.jar();
    var req = request.defaults({
      jar: jar
    });

    return getSSOToken(req, jar, creds)
      .then(function () {
        return getAuthCode(req, creds);
      })
      .then(function (authCode) {
        return getAccessToken(req, authCode);
      })
      .then(callback)
      .catch(function (error) {
        console.error('Unable to get bearer token.', error);
        return Promise.reject(error);
      });
  },
  parseJSON: function (data) {
    try {
      return JSON.parse(data);
    } catch (_error) {
      throw new Error('Unable to parse JSON: ' + data);
    }
  },
  auth: auth
};
