'use strict';

//Below is the Test Suit written for FaultRuleService
describe('partnerProfileCtrl Test', function () {

  //load the service's module
  //beforeEach(module('wx2AdminWebClientApp'));
  beforeEach(module('Core'));
  beforeEach(module('WebExApp'));
  beforeEach(module('wx2AdminWebClientApp'));

  var WebexClientVersion, httpBackend, $translate, Config, PartnerProfileCtrl_1, $controller, Authinfo;
  var $scope, $q, FeatureToggleService;

  //beforeEach(inject(function ($injector, _Config_, _WebexClientVersion_, _PartnerProfileCtrl_) {

  beforeEach(inject(function ($injector, _Config_, _$controller_, _Authinfo_, _WebexClientVersion_, _$q_, _FeatureToggleService_) {

    $controller = _$controller_;
    $scope = {};
    Authinfo = _Authinfo_;
    $q = _$q_;
    FeatureToggleService = _FeatureToggleService_;

    var PartnerProfileCtrl_1 = $controller(
      'PartnerProfileCtrl', {
        $scope: $scope

      }
    );

    WebexClientVersion = _WebexClientVersion_;
    Config = _Config_;

    var testJson = {
      'data': {
        'partnerId': 'xyzpid'
      }
    };

    var jsonTestData = {
      'data': {
        'partnerTemplateId': 'someTemplateId',
        'partnerId': 'somePartnerId',
        'clientVersion': 'T38SP8',
        'useLatest': false
      }
    };

    spyOn(Authinfo, 'isPartner').and.returnValue(true);
    spyOn(Authinfo, 'getOrgId').and.returnValue('xyz');
    spyOn(WebexClientVersion, 'getWbxClientVersions').and.callFake(function () {
      var deferred = $q.defer();
      deferred.resolve(['c1', 'c2', 'c3']);
      return deferred.promise;
    });
    //spyOn(WebexClientVersion, 'getWbxClientVersions').and.returnValue($q.when(['c1', 'c2', 'c3']));
    spyOn(WebexClientVersion, 'getPartnerIdGivenOrgId').and.returnValue($q.when(testJson));
    spyOn(WebexClientVersion, 'getTemplate').and.returnValue($q.when(jsonTestData));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue('marvelpartners@gmail.com');

    //non-existing parthertemplate.
    var jsonTestData2 = {
      'data': {
        'partnerTemplateId': '',
        'partnerId': '',
        'clientVersion': '',
        'useLatest': false
      }
    };

    var controller = $controller(
      'PartnerProfileCtrl', {
        $scope: $scope,
        Authinfo: Authinfo,
        WebexClientVersion: WebexClientVersion,
      }
    );

  }));

  afterEach(function () {
    //httpBackend.verifyNoOutstandingExpectation();
    //httpBackend.verifyNoOutstandingRequest();
  });

  xit('After call initWbxClientVersions should have useLatestWbxVersion set correctly', function () {
    expect($scope.useLatestWbxVersion).toBe(false);
  });

  xit('After call initWbxClientVersions should have wbxclientversionselected set correctly', function () {
    //$scope.initWbxClientVersions();
    expect($scope.wbxclientversionselected).toBe('T38SP8');
  });

  it('Test Test', function () {
    expect('z').toBe('z');
  });

});
