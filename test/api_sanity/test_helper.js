'use strict';

/* global Promise */

var _ = require('lodash');
var request = require('request');
var testConfig = require('../e2e-protractor/utils/test.config');

var auth = {
  'aa-admin': {
    user: 'indigoAA02+1@gmail.com',
    pass: 'Cisc0123!',
    org: '7e0f0f48-0582-444e-ac75-908a36b29539',
  },
  'aa-multisite-admin': {
    user: 'AAIntPartner+Location1@gmail.com',
    pass: 'Cisc0123!',
    org: '82589e95-30c7-43de-94c5-04401747ebdd',
  },
  'account-admin': {
    user: 'phtest77+acc2@gmail.com',
    pass: 'Cisco123!!!',
    org: '58f01b76-2b3f-4c91-ad8a-e2af626fc7a5',
  },
  'contactcenter-admin': {
    user: 'sunlight-atlas-test-admn@outlook.com',
    pass: 'C1sco123!',
    org: '36de4632-ccb9-4edf-8124-b74ce6943285',
  },
  'customer-regular-user': {
    user: 'regUser2@csreptestdom.collaborate.com',
    pass: 'P@ssword123',
    org: 'c1e59258-29e1-42d7-bfa7-84ab26632b46',
  },
  'customer-support-admin': {
    user: 'admin@csreptestdom.collaborate.com',
    pass: 'P@ssword123',
    org: 'c1e59258-29e1-42d7-bfa7-84ab26632b46',
  },
  'customer-support-user': {
    user: 'regUser1@csreptestdom.collaborate.com',
    pass: 'C1sc0123!',
    org: 'c1e59258-29e1-42d7-bfa7-84ab26632b46',
  },
  'auto-assign-licenses': {
    user: 'atlaswebe2e+ft--atlas-f3745-auto-assign-licenses@gmail.com',
    pass: 'Cisco123!',
    org: '8078642f-ab1a-4740-bd0a-61738ea76bf0',
  },
  'gss-testAdmin': {
    user: 'sjsite14-lhsieh@mailinator.com',
    pass: 'Cisco!23',
    org: '06db50d9-a129-4a1f-9ee9-bcff65246b15',
  },
  'huron-e2e': {
    user: 'admin@uc.e2e.huron-alpha.com',
    pass: 'C1sco123!',
    org: '30fdb01e-0bb2-4ed4-97f4-84a2289bdc79',
  },
  'huron-e2e-partner': {
    user: 'admin@ucpartner.e2e.huronalpha.com',
    pass: 'C1sco123!',
    org: '666a7b2f-f82e-4582-9672-7f22829e728d',
  },
  'huron-int1': {
    user: 'admin@int1.huron-alpha.com',
    pass: 'Cisco123!',
    org: '7e88d491-d6ca-4786-82ed-cbe9efb02ad2',
  },
  'huron-ui-test-partner': {
    user: 'huron.ui.test.partner@gmail.com',
    pass: 'Cisco@1234!',
    org: '555daf76-091b-40a0-b3b9-f6ef33084599',
  },
  'huron-ui-test-partner-h-i1238': {
    user: 'huron.ui.test.partner+hi1238@gmail.com',
    pass: 'Cisco@1234!',
    org: '555daf76-091b-40a0-b3b9-f6ef33084599',
  },
  'huron-ui-test-partner-h-i1484': {
    user: 'huron.ui.test.partner+hi1484@gmail.com',
    pass: 'Cisco@1234!',
    org: '555daf76-091b-40a0-b3b9-f6ef33084599',
  },
  'huron-ui-test-partner-h-cos-trial': {
    user: 'huron.ui.test.partner+hcostrial@gmail.com',
    pass: 'Cisco@1234!',
    org: '555daf76-091b-40a0-b3b9-f6ef33084599',
  },
  'huron-ui-test-partner-prod': {
    user: 'huron.ui.test.partner+production@gmail.com',
    pass: 'Cisco@1234!',
    org: '555daf76-091b-40a0-b3b9-f6ef33084599',
  },
  'invite-admin': {
    user: 'pbr-invite-user@squared2webex.com',
    pass: 'P@ssword123',
    org: '4214d345-7caf-4e32-b015-34de878d1158',
  },
  'media-fusion-admin': {
    user: 'mediafusion54@yahoo.com',
    pass: 'Cisco!23',
    org: '2c3c9f9e-73d9-4460-a668-047162ff1bac',
  },
  'media-super-admin': {
    user: 'super-admin@mfusion1webex.com',
    pass: 'C1sc01234!',
    org: 'baab1ece-498c-452b-aea8-1a727413c818',
  },
  'mockcisco-support-user': {
    user: 'phtest77+testbilling@gmail.com',
    pass: 'C1sc0123!',
    org: 'd30a6828-dc35-4753-bab4-f9b468828688',
  },
  'multiple-subscription-user': {
    user: 'int-esub-1@mailinator.com',
    pass: 'P@ssword123',
    org: '9d173ec9-198e-430d-9363-688a333bdee7',
  },
  'non-trial-admin': {
    user: 'pbr-test-admin@squared2webex.com',
    pass: 'P@ssword123',
    org: '4214d345-7caf-4e32-b015-34de878d1158',
  },
  'partner-admin': {
    // TODO: replace with original partner admin after more org cleanup
    user: 'vivitron+atlaspartneradmin@gmail.com',
    pass: 'P@ssword123',
    org: 'c054027f-c5bd-4598-8cd8-07c08163e8cd',
  },
  'partner-reports': {
    user: 'admin@sparkucreports-testpartner.com',
    pass: 'P@ssword123',
    org: 'd71b4d69-721a-41b1-ae4b-6e0305eab12b',
  },
  'partner-reports-sales-admin': {
    user: 'kingkuntauser4+1715@gmail.com',
    pass: 'C1sc0123!',
    org: 'ce8d17f8-1734-4a54-8510-fae65acc505e',
  },
  'partner-sales-user': {
    user: 'phtest77+salesadmin@gmail.com',
    pass: 'P@ssword123',
    org: '7e268021-dc11-4728-b39d-9ba0e0abb5e0',
  },
  'pbr-admin': {
    user: 'pbr-org-admin@squared2webex.com',
    pass: 'Atlas123!',
    org: '4214d345-7caf-4e32-b015-34de878d1158',
  },
  'pbr-admin-test': {
    user: 'pbr-org-admin-test@wx2.example.com',
    pass: 'C1sco123!',
    org: '4214d345-7caf-4e32-b015-34de878d1158',
  },
  'selfsign-sso-admin': {
    user: 'phtest77+dontdeleteme@gmail.com',
    pass: 'C1sc0123!',
    org: 'e9e33cac-eb07-4c34-8240-d08a43d0adce',
  },
  'sqtest-admin': {
    user: 'sqtest-admin@squared.example.com',
    pass: 'C1sco123!!',
    org: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5',
  },
  'sso-e2e-test-org': {
    user: 'fakegmuser+ssotestorg@gmail.com',
    pass: 'C1sc01234!',
    org: '3aa8a8a2-b953-4905-b678-0ae0a3f489f8',
  },
  'sso-e2e-test-org-mailsac': {
    user: 'abc@mailsac.com',
    pass: 'P@ssword123',
    org: '3aa8a8a2-b953-4905-b678-0ae0a3f489f8',
    adId: 'atlasad\\abc',
    adPass: 'P@ssword123',
  },
  'support-admin': {
    user: 'sqtest-admin-support@squared.example.com',
    pass: 'C1sc0123!',
    org: '584cf4cd-eea7-4c8c-83ee-67d88fc6eab5',
  },
  'test-user': {
    user: 'atlasmapservice+ll1@gmail.com',
    pass: 'P@ssword123',
    org: '75653d2f-1675-415c-aa5d-c027233f68fe',
  },
  'virtualassistant-admin': {
    user: 'sparkcarebot+admin@gmail.com',
    pass: 'Cisco@123',
    org: '5abcd266-e194-475e-bc48-010af5da6dde',
  },
  'expertvirtualassistant-admin': {
    user: 'sparkcareatlaseva+admin@gmail.com',
    pass: 'C1sco@123',
    org: '51a8b0f5-ba13-46c2-8ac1-c4b5b8b3f7ef',
  },
  'wbx-multipleCenterLicenseTestAdmin': {
    user: 't31r1-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'b322c279-22d8-488f-a670-cdcb6380033e',
  },
  'wbx-singleCenterLicenseTestAdmin': {
    user: 't30sp6-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'a6c8fdc7-1b74-4d0c-9d24-bd8c20048a84',
  },
  'wbx-siteCsvTestAdmin': {
    user: 'dev-dmz-e2e@mailinator.com',
    pass: 'Cisco!23',
    org: '06db50d9-a129-4a1f-9ee9-bcff65246b15',
  },
  'wbx-t30BTSTestAdmin-MultiLicense': {
    user: 'provteam+mc25@csgtrials.webex.com',
    pass: 'Cisco!234',
    org: '52cd61a3-a950-47c3-8218-55429ff88eb7',
  },
  'wbx-t30BTSTestAdmin-Reports-Configure': {
    user: 'provteam+mc25@csgtrials.webex.com',
    pass: 'Cisco!234',
    org: '52cd61a3-a950-47c3-8218-55429ff88eb7',
  },
  'wbx-t30BTSTestAdmin-SingleLicense': {
    user: 'provteam+mc@csgtrials.webex.com',
    pass: 'Cisco!234',
    org: '0988dcdc-af6e-4624-9387-b4b6fa7df4e3',
  },
  'wbx-t30BTSTestAdmin-UserSettings': {
    user: 'provteam+ee@csgtrials.webex.com',
    pass: 'Cisco!234',
    org: 'fc3868a5-5bfd-47d5-b39f-52af4d6ede42',
  },
  'wbx-t30RegressionTestAdmin': {
    user: 't30sp6-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'a6c8fdc7-1b74-4d0c-9d24-bd8c20048a84',
  },
  'wbx-t31BTSTestAdmin-Reports-Configure': {
    user: 'provteam+mc200@csgtrials.webex.com',
    pass: 'Cisco!234',
    org: '2039e7a3-6feb-4293-b87d-354ba68b0295',
  },
  'wbx-t31BTSTestAdmin-UserSettings': {
    user: 'T31-EE-lhsieh@mailinator.com',
    pass: 'Cisco!23',
    org: 'b98940d4-2985-46ef-8c1a-ae8c1ef723ad',
  },
  'wbx-t31RegressionTestAdmin': {
    user: 't31r1-regression-adm@mailinator.com',
    pass: 'Cisco!23',
    org: 'b322c279-22d8-488f-a670-cdcb6380033e',
  },
  'hybrid-org': {
    user: 'shivani.hybrid0712+a@gmail.com',
    pass: 'Cisco123!',
    org: '5abae65f-3157-4d09-ad29-7187b5cfbba2',
  },
};

var clientId = 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec';
var clientSecret = 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857';

var getSSOToken = function (req, jar, creds) {
  return new Promise(function (resolve, reject) {
    var opts = {
      url: 'https://idbroker.webex.com/idb/UI/Login?org=' + creds.org,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        IDToken1: creds.user,
        IDToken2: creds.pass,
      },
    };
    req.post(opts, function (err, res, body) {
      if (err) {
        console.error(err, body);
        reject(new Error('Failed to fetch SSO token from CI. Status: ' + (res != null ? res.statusCode : undefined)));
      }
      var cookie = _.find(res.headers['set-cookie'], function (c) {
        return c.indexOf('cisPRODAMAuthCookie') !== -1;
      });
      if (!cookie) {
        reject(new Error('Failed to retrieve a cookie with org credentials. Status: ' + (res != null ? res.statusCode : undefined)));
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
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        response_type: 'code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        client_id: clientId,
        scope: testConfig.oauth2Scope,
        realm: '/' + creds.org,
        state: rand_str,
      },
    };
    req.post(opts, function (err, res, body) {
      var ref;
      if (err) {
        console.error(err, body);
        reject(new Error('Failed to fetch Auth Code from CI. Status: ' + (res != null ? res.statusCode : undefined)));
      }
      var code = (ref = body.match(/<title>(.*)</)) != null ? ref[1] : undefined;
      if (!code) {
        console.error(body);
        reject(new Error('Failed to extract Auth Code. Status: ' + (res != null ? res.statusCode : undefined)));
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
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      },
      auth: {
        user: clientId,
        pass: clientSecret,
      },
    };
    req.post(opts, function (err, res, body) {
      if (err) {
        console.error(err, body);
        reject(new Error('Failed to fetch Access Token from CI. Status: ' + (res != null ? res.statusCode : undefined)));
      }
      var obj = (function () {
        try {
          return JSON.parse(body);
        } catch (_error) {
          console.error(_error);
          reject(new Error('Failed to parse Access Token JSON. Status: ' + (res != null ? res.statusCode : undefined)));
        }
      })();
      if (!(obj != null ? obj.access_token : undefined)) {
        console.error(body);
        reject(new Error('Failed to extract Access Token. Status: ' + (res != null ? res.statusCode : undefined)));
      }
      resolve(obj.access_token);
    });
  });
};

var deleteThisOrgToken = function (req, token, user) {
  return new Promise(function (resolve, reject) {
    var orgId = auth[user].org
    var options = {
      url: `https://idbroker.webex.com/idb/oauth2/v1/tokens?orgid=${orgId}&clientid=${clientId}`,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Host': 'idbroker.webex.com',
        'Content-Type': 'application/json;charset=utf-8',
      },
    };
    req.delete(options, function (err, res, body) {
      if (err) {
        console.error(err, body);
        reject(new Error('Failed to delete Access Token from CI. Status: ' + (res ? res.statusCode : undefined)));
      }
      resolve();
    });
  });
};

module.exports = {
  getBearerToken: function (user) {
    var creds = auth[user];
    if (!creds) {
      var message = 'Credentials for ' + user + ' not found';
      console.error(message);
      return Promise.reject(message);
    }
    var jar = request.jar();
    var req = request.defaults({
      jar: jar,
    });

    return getSSOToken(req, jar, creds)
      .then(function () {
        return getAuthCode(req, creds);
      })
      .then(function (authCode) {
        return getAccessToken(req, authCode);
      })
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
  deleteAllOrgTokens: function (token, user) {
    var creds = auth[user];
    if (!creds) {
      var message = 'Credentials for ' + user + ' not found';
      console.error(message);
      return Promise.reject(message);
    }
    return deleteThisOrgToken(request, token, user)
      .catch(function (error) {
        console.error('Unable to get remove token.', error);
        return Promise.reject(error)
      });
  },
  auth: auth,
};
