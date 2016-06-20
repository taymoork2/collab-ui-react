'use strict';

//Below is the Test Suit written for FaultRuleService
describe('WebexClientVersion Test', function () {

  //load the service's module
  //beforeEach(module('wx2AdminWebClientApp'));
  beforeEach(module('wx2AdminWebClientApp'));

  var WebexClientVersion, httpBackend, $translate, UrlConfig;
  var clientVersions1;

  beforeEach(inject(function (_$httpBackend_, _UrlConfig_, _WebexClientVersion_) {

    httpBackend = _$httpBackend_;

    WebexClientVersion = _WebexClientVersion_;
    UrlConfig = _UrlConfig_;

    clientVersions1 = {
      "clientVersions": ["c1", "c2", "c3"]
    };

  }));

  afterEach(function () {
    //httpBackend.verifyNoOutstandingExpectation();
    //httpBackend.verifyNoOutstandingRequest();
  });

  it("shoud get test data", function () {
    var td = WebexClientVersion.getTestData();
    expect(td).toBe("testData");
  });

  it("shoud get admin service url", function () {
    expect(UrlConfig.getAdminServiceUrl()).toBe('https://atlas-integration.wbx2.com/admin/api/v1/');
  });

  it("shoud get admin service url", function () {
    expect(WebexClientVersion.getAdminServiceUrl()).toBe('https://atlas-integration.wbx2.com/admin/api/v1/');
  });

  it("shoud get client versions url when getTotalUrl(clientVersions) called", function () {
    expect(WebexClientVersion.getTotalUrl('clientVersions')).toBe('https://atlas-integration.wbx2.com/admin/api/v1/clientversions');
  });

  it('should get client versions', function () {

    var url = UrlConfig.getAdminServiceUrl() + 'clientversions';

    //httpBackend.resetExpectations();

    //unfortunately, this line is necessary. Not sure where it's coming from
    httpBackend.expectGET('l10n/en_US.json').respond(200, {});
    httpBackend.whenGET(url).respond(200, clientVersions1);
    //httpBackend.expectGET('/admin/api/v1/partnertemplate/clientversions');

    var versionp = WebexClientVersion.getWbxClientVersions();

    versionp.then(function (data) {
      expect(data[0]).toBe('c1');
    });

    httpBackend.flush();
  });

  it('Test of a test', function () {
    expect('x').toBe('x');
  });

});
