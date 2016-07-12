/**
 * 
 */
'use strict';

describe('WebExUtilsFact: isCIEnabledSite() test', function () {
  beforeEach(module('WebExApp'));

  var WebExUtilsFact;
  var Authinfo;

  var fakeLicenses = [{
    "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_fakeConferencingIsCITrue.fake.com",
    "offerName": "MC",
    "licenseType": "CONFERENCING",
    "billingServiceId": "1446768353",
    "features": ["cloudmeetings"],
    "volume": 25,
    "isTrial": false,
    "isCIUnifiedSite": true,
    "status": "ACTIVE",
    "capacity": 200,
    "siteUrl": "fakeConferencingIsCITrue.fake.com"
  }, {
    "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_fakeConferencingIsCIFalse.fake.com",
    "offerName": "MC",
    "licenseType": "CONFERENCING",
    "billingServiceId": "1446768353",
    "features": ["cloudmeetings"],
    "volume": 25,
    "isTrial": false,
    "isCIUnifiedSite": false,
    "status": "ACTIVE",
    "capacity": 200,
    "siteUrl": "fakeConferencingIsCIFalse.fake.com"
  }, {
    "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_fakeConferencing.fake.com",
    "offerName": "MC",
    "licenseType": "CONFERENCING",
    "billingServiceId": "1446768353",
    "features": ["cloudmeetings"],
    "volume": 25,
    "isTrial": false,
    "status": "ACTIVE",
    "capacity": 200,
    "siteUrl": "fakeConferencing.fake.com"
  }, {
    "licenseId": "CMR_1b25c88e-8016-4251-bc81-e1a856a5c0f0_fakeCMRIsCITrue.fake.com",
    "offerName": "CMR",
    "licenseType": "CMR",
    "billingServiceId": "SubCt30test201582703",
    "features": [],
    "volume": 100,
    "isTrial": false,
    "isCIUnifiedSite": true,
    "status": "ACTIVE",
    "capacity": 100,
    "siteUrl": "fakeCMRIsCITrue.fake.com"
  }, {
    "licenseId": "CMR_1b25c88e-8016-4251-bc81-e1a856a5c0f0_fakeCMRIsCIFalse.fake.com",
    "offerName": "CMR",
    "licenseType": "CMR",
    "billingServiceId": "SubCt30test201582703",
    "features": [],
    "volume": 100,
    "isTrial": false,
    "isCIUnifiedSite": false,
    "status": "ACTIVE",
    "capacity": 100,
    "siteUrl": "fakeCMRIsCIFalse.fake.com"
  }, {
    "licenseId": "CMR_1b25c88e-8016-4251-bc81-e1a856a5c0f0_fakeCMR.fake.com",
    "offerName": "CMR",
    "licenseType": "CMR",
    "billingServiceId": "SubCt30test201582703",
    "features": [],
    "volume": 100,
    "isTrial": false,
    "status": "ACTIVE",
    "capacity": 100,
    "siteUrl": "fakeCMR.fake.com"
  }];

  beforeEach(inject(function (
    _Authinfo_,
    _WebExUtilsFact_
  ) {

    Authinfo = _Authinfo_;
    WebExUtilsFact = _WebExUtilsFact_;

    spyOn(Authinfo, 'getLicenses').and.returnValue(fakeLicenses);
  })); // beforeEach(inject())

  it('can correct return true for licenseType=CONFERENCING', function () {
    var isCISite = WebExUtilsFact.isCIEnabledSite("fakeConferencing.fake.com");

    expect(isCISite).toEqual(true);
  });

  it('can correct return true for licenseType=CONFERENCING and isCIUnifiedSite=true', function () {
    var isCISite = WebExUtilsFact.isCIEnabledSite("fakeConferencingIsCITrue.fake.com");

    expect(isCISite).toEqual(true);
  });

  it('can correct return false for licenseType=CONFERENCING and isCIUnifiedSite=false', function () {
    var isCISite = WebExUtilsFact.isCIEnabledSite("fakeConferencingIsCIFalse.fake.com");

    expect(isCISite).toEqual(false);
  });

  it('can correct return true for licenseType=CMR', function () {
    var isCISite = WebExUtilsFact.isCIEnabledSite("fakeCMR.fake.com");

    expect(isCISite).toEqual(true);
  });

  it('can correct return true for licenseType=CMR and isCIUnifiedSite=true', function () {
    var isCISite = WebExUtilsFact.isCIEnabledSite("fakeCMRIsCITrue.fake.com");

    expect(isCISite).toEqual(true);
  });

  it('can correct return false for licenseType=CMR and isCIUnifiedSite=false', function () {
    var isCISite = WebExUtilsFact.isCIEnabledSite("fakeCMRIsCIFalse.fake.com");

    expect(isCISite).toEqual(false);
  });
}); // describe()

describe('WebExUtilsFact: utf8ToUtf16le() test', function () {
  beforeEach(module('WebExApp'));

  var WebExUtilsFact;

  var utf8Data = '' +
    'UserID\tActive\n';

  var utf16leDataExpected = [255, 254, 85, 0, 115, 0, 101, 0, 114, 0, 73, 0, 68, 0, 9, 0, 65, 0, 99, 0, 116, 0, 105, 0, 118, 0, 101, 0, 10, 0];

  var utf16leDataConverted;

  beforeEach(inject(function (
    _WebExUtilsFact_
  ) {

    WebExUtilsFact = _WebExUtilsFact_;
  })); // beforeEach(inject())

  it('can convert utf-8 string to utf-16le', function () {
    utf16leDataConverted = WebExUtilsFact.utf8ToUtf16le(utf8Data);

    expect(utf16leDataConverted).toEqual(utf16leDataExpected);
  });
}); // describe()

describe('WebExUtilsFact: getSiteName() test', function () {
  beforeEach(module('WebExApp'));

  var WebExUtilsFact;
  var siteName;

  beforeEach(inject(function (
    _WebExUtilsFact_
  ) {

    WebExUtilsFact = _WebExUtilsFact_;
  })); // beforeEach(inject())

  it('can process siteUrl=<blah>.webex.com', function () {
    siteName = WebExUtilsFact.getSiteName("fake.webex.com");

    expect(siteName).toEqual("fake");
  });

  it('can process siteUrl=<blah>.my.webex.com', function () {
    siteName = WebExUtilsFact.getSiteName("fake.my.webex.com");

    expect(siteName).toEqual("fake.my");
  });

  it('can process siteUrl=<blah>.mydmz.webex.com', function () {
    siteName = WebExUtilsFact.getSiteName("fake.mydmz.webex.com");

    expect(siteName).toEqual("fake.mydmz");
  });

  it('can process siteUrl=<blah>.mybts.webex.com', function () {
    siteName = WebExUtilsFact.getSiteName("fake.mybts.webex.com");

    expect(siteName).toEqual("fake.mybts");
  });

  it('can process siteUrl=<blah>.mydev.webex.com', function () {
    siteName = WebExUtilsFact.getSiteName("fake.mydev.webex.com");

    expect(siteName).toEqual("fake.mydev");
  });

  it('can process siteUrl=<blah>.dmz.webex.com', function () {
    siteName = WebExUtilsFact.getSiteName("fake.dmz.webex.com");

    expect(siteName).toEqual("fake");
  });
}); // describe()

describe('WebExUtilsFact', function () {

  var $q;
  var $rootScope;

  var WebExXmlApiFact;
  var WebExUtilsFact;
  var Orgservice;

  var hostName = 'aaa.bbb.com';
  var siteName = 'foo';
  var urlPart = 'https://' + hostName + '/wbxadmin/clearcookie.do?proxyfrom=atlas&siteurl=';
  var url = urlPart + siteName;
  var deferred_licenseInfo;

  var fake_validLicenses = [{
    "licenseId": "MC_5b2fe3b2-fff2-4711-9d6e-4e45fe61ce52_200_sjsite14.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 3,
    "capacity": 200,
    "usage": 0
  }, {
    "licenseId": "MS_a6d7016a-478d-4d94-9889-9c37f337a8ce",
    "licenseType": "MESSAGING",
    "volume": 10,
    "usage": 1
  }, {
    "licenseId": "MS_970610a0-14fd-433b-a1ee-cd14f4c5ab9c",
    "licenseType": "MESSAGING",
    "volume": 5,
    "usage": 1
  }, {
    "licenseId": "MC_3ada1218-1763-428b-bb7f-d03f8ea91fa1_200_t30citestprov9.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 25,
    "capacity": 200,
    "usage": 1
  }, {
    "licenseId": "MS_41d0fcfe-4de4-4ce0-abec-ed4d4942898e",
    "licenseType": "MESSAGING",
    "volume": 10,
    "usage": 0
  }, {
    "licenseId": "CF_0d98b765-3c43-4996-9320-a5a649a9542f_8",
    "licenseType": "CONFERENCING",
    "volume": 8,
    "capacity": 8,
    "usage": 0
  }, {
    "licenseId": "MC_66e1a7c9-3549-442f-942f-41a53b020689_200_sjsite04.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 25,
    "capacity": 200,
    "usage": 0
  }, {
    "licenseId": "MS_145d46ef-beef-4868-8980-f11812774589",
    "licenseType": "MESSAGING",
    "volume": 10,
    "usage": 0
  }, {
    "licenseId": "ST_e1c86f12-5fa4-463e-82f2-b670fcfeca0e_5",
    "licenseType": "STORAGE",
    "volume": 0,
    "capacity": 5,
    "usage": 0
  }, {
    "licenseId": "CMR_1b25c88e-8016-4251-bc81-e1a856a5c0f0_100_sjsite14.webex.com",
    "licenseType": "CMR",
    "volume": 100,
    "capacity": 100,
    "usage": 1
  }, {
    "licenseId": "MS_b700e98c-a109-4e1b-bc6d-6ea5af20598a",
    "licenseType": "MESSAGING",
    "volume": 10,
    "usage": 0
  }, {
    "licenseId": "ST_251d6481-7a5f-4f11-ba89-957e7008905f_10",
    "licenseType": "STORAGE",
    "volume": 0,
    "capacity": 10,
    "usage": 0
  }, {
    "licenseId": "MC_5320533d-da5d-4f92-b95e-1a42567c55a0_200_cisjsite031.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 25,
    "capacity": 200,
    "usage": 1
  }, {
    "licenseId": "MC_5f078901-2e59-4129-bba4-b2126d356b61_25_sjsite04.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 25,
    "capacity": 25,
    "usage": 0
  }, {
    "licenseId": "ST_b1f9330b-1a32-43e8-ac3a-e5da0685ebf4_10",
    "licenseType": "STORAGE",
    "volume": 0,
    "capacity": 10,
    "usage": 0
  }, {
    "licenseId": "ST_57f29b75-7df8-4f60-b57e-6f6f4891e73a_10",
    "licenseType": "STORAGE",
    "volume": 0,
    "capacity": 10,
    "usage": 0
  }, {
    "licenseId": "ST_c4d1597d-7c01-4aab-8ce0-11991b2d918c_10",
    "licenseType": "STORAGE",
    "volume": 0,
    "capacity": 10,
    "usage": 0
  }];

  beforeEach(module('Core'));
  beforeEach(module('WebExApp'));

  beforeEach(inject(function (_$q_, _$rootScope_, _WebExXmlApiFact_, _WebExUtilsFact_, _Orgservice_) {
    $q = _$q_;
    $rootScope = _$rootScope_;

    WebExXmlApiFact = _WebExXmlApiFact_;
    WebExUtilsFact = _WebExUtilsFact_;
    Orgservice = _Orgservice_;

    deferred_licenseInfo = $q.defer();
  }));

  it('calls correct logout URL', function () {
    $rootScope.nginxHost = hostName;
    $rootScope.lastSite = siteName + '.webex.com';
    spyOn($, "ajax");

    var promise = WebExUtilsFact.logoutSite();
    expect($.ajax.calls.mostRecent().args[0]["url"]).toEqual(url);
  });

  it('can log out from a site', function (done) {
    $rootScope.nginxHost = hostName;
    $rootScope.lastSite = siteName + '.webex.com';
    spyOn($, "ajax").and.callFake(function (e) {
      var result = $q.defer();
      result.resolve();
      return result;
    });

    var promise = WebExUtilsFact.logoutSite();

    promise.then(function () {
      done();
    });
    $rootScope.$apply();
  });

  it('does not block if no site visited', function (done) {
    var promise = WebExUtilsFact.logoutSite();

    promise.then(function () {
      done();
    }, function () {
      done();
    });
    $rootScope.$apply();
  });

  it('does not block on error response', function (done) {
    $rootScope.nginxHost = hostName;
    $rootScope.lastSite = siteName + '.webex.com';
    spyOn($, "ajax").and.callFake(function (e) {
      var result = $q.defer();
      result.reject();
      return result;
    });

    var promise = WebExUtilsFact.logoutSite();

    promise.then(function () {
      done();
    });
    $rootScope.$apply();
  });

  it('gets webex licenses for sites of current user', function () {
    spyOn(Orgservice, "getValidLicenses").and.returnValue(deferred_licenseInfo.promise);

    var response = WebExUtilsFact.getAllSitesWebexLicenseInfo();
    deferred_licenseInfo.resolve(fake_validLicenses);

    $rootScope.$apply();

    expect(response).not.toBe(null);

    // expect(response.$$state.value[0].siteHasMCLicense).toBe(true);
    // expect(response.$$state.value[1].siteHasMCLicense).toBe(true);
    // expect(response.$$state.value[4].siteHasCMRLicense).toBe(true);

    expect(response.$$state.value[0].offerCode).toBe("MC");
    expect(response.$$state.value[1].offerCode).toBe("MC");
    expect(response.$$state.value[4].offerCode).toBe("CMR");

    /** This is what response looks like, given the fake input data:
     * 'response = {"$$state":{"status":1,"value":[
     *        {"webexSite":"sjsite14.webex.com","siteHasMCLicense":true,"offerCode":"MC","capacity":"200"},
     *        {"webexSite":"t30citestprov9.webex.com","siteHasMCLicense":true,"offerCode":"MC","capacity":"200"},
     *        null,
     *        {"webexSite":"sjsite04.webex.com","siteHasMCLicense":true,"offerCode":"MC","capacity":"200"},
     *        {"webexSite":"sjsite14.webex.com","siteHasCMRLicense":true,"offerCode":"CMR","capacity":"100"},
     *        {"webexSite":"cisjsite031.webex.com","siteHasMCLicense":true,"offerCode":"MC","capacity":"200"},
     *        {"webexSite":"sjsite04.webex.com","siteHasMCLicense":true,"offerCode":"MC","capacity":"25"}]}}'
     */

  });

  afterEach(function () {
    $rootScope.nginxHost = undefined;
    $rootScope.lastSite = undefined;
  });
});
