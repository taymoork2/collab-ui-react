'use strict';

var PROVIDERS = [{
  "name": "INTELEPEER",
  "logoSrc": "images/carriers/logo_intelepeer.svg",
  "logoAlt": "IntelePeer",
  "docSrc": "docs/carriers/IntelePeerVoicePackage.pdf",
  "features": [
    "intelepeerFeatures.feature1",
    "intelepeerFeatures.feature2",
    "intelepeerFeatures.feature3",
    "intelepeerFeatures.feature4",
  ],
}, {
  "name": "THINKTEL",
  "logoSrc": "images/carriers/logo_thinktel.svg",
  "logoAlt": "ThinkTel",
  "docSrc": "",
  "features": [
    "thinktelFeatures.feature1",
    "thinktelFeatures.feature2",
    "thinktelFeatures.feature3",
    "thinktelFeatures.feature4",
    "thinktelFeatures.feature5",
    "thinktelFeatures.feature6",
  ],
}];

var CARRIER = {
  "uuid": "92e4823e-ad60-49c1-8a6a-334fd25f29ab",
  "name": "WEBEX_BTS_THINKTEL_PSTN",
  "displayName": "WEBEX_BTS_THINKTEL_PSTN",
  "description": "ThinkTel BTS",
  "countryCode": "+1",
  "country": "CA",
  "apiImplementation": "INTELEPEER",
  "vendor": "THINKTEL",
  "services": ["PSTN"],
  "defaultOffer": false,
  "offers": ["thinktel_spark_CAN_CISCOVOICEBUNDLE"],
  "voiceCarrierRef": "be6f962e-46e5-40b0-9866-ba91826910dc",
  "url": "https://terminus.huron-int.com/api/v1/carriers/92e4823e-ad60-49c1-8a6a-334fd25f29ab",
};

describe('Controller: PstnToSCtrl', function () {
  var $q, $rootScope, $scope, $controller, $httpBackend, controller, Orgservice, PstnSetupService;

  beforeEach(angular.mock.module('Huron'));

  afterAll(function () {
    $q = $rootScope = $scope = $controller = controller = Orgservice = PstnSetupService = undefined;
  });

  beforeEach(inject(function (_$q_, _$rootScope_, _$controller_, _$httpBackend_, _Orgservice_, _PstnSetupService_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    PstnSetupService = _PstnSetupService_;
    $httpBackend = _$httpBackend_;

    $scope.$close = jasmine.createSpy('$close');

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({ id: '1234512345' }, 200);
    });

    spyOn(PstnSetupService, 'getCustomerV2').and.returnValue($q.resolve({ trial: true, pstnCarrierId: '1234' }));
    spyOn(PstnSetupService, 'getCustomerTrialV2').and.returnValue($q.resolve({ termsOfServiceUrl: 'http://server/tos' }));
    spyOn(PstnSetupService, 'setCustomerTrialV2').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'getCarrierDetails').and.returnValue($q.resolve(CARRIER));

    $httpBackend.when('GET', 'modules/huron/pstn/pstnProviders/pstnProviders.json').respond(PROVIDERS);

    controller = $controller('PstnToSCtrl', {
      $scope: $scope,
      Orgservice: Orgservice,
      PstnSetupService: PstnSetupService,
    });
    $rootScope.$apply();
  }));

  it('should accept the Terms of Service', function () {
    controller.firstName = 'fname';
    controller.lastName = 'lname';
    controller.email = 'flname@company.com';

    controller.onAgreeClick();
    expect(controller.loading).toEqual(true);
    expect(PstnSetupService.setCustomerTrialV2).toHaveBeenCalled();

    $rootScope.$apply();
    expect($scope.$close).toHaveBeenCalled();
  });

});
