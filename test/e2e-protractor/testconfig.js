'use strict';

exports.oauthClientRegistration =  {
  id: 'C80fb9c7096bd8474627317ee1d7a817eff372ca9c9cee3ce43c3ea3e8d1511ec',
  secret: 'c10c371b4641010a750073b3c8e65a7fff0567400d316055828d3c74925b0857',
  scope: 'webexsquare%3Aadmin%20Identity%3ASCIM%20Identity%3AConfig%20Identity%3AOrganization'
};

exports.oauth2Url = 'https://idbroker.webex.com/idb/oauth2/v1/';

exports.adminServiceUrl = {
  dev: 'http://localhost:8080/atlas-server/admin/api/v1/',
  integration: 'https://atlas-integration.wbx2.com/admin/api/v1/',
  prod: 'https://atlas-a.wbx2.com/admin/api/v1/'
};

exports.deviceUserAgent = {
	androidHTC1: 'wx2_android',
	iPhone: 'wx2_iOS',
	iPad: 'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53',
	iPod: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53'
};
