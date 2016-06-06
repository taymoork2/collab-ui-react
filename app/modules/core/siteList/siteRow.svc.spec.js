'use strict';

describe('Service: WebExSiteRowService', function () {

  var controller, $scope, $q, WebExSiteRowService;

  var fakeSiteRow = {
    "label": "Enterprise Edition 200",
    "value": 1,
    "name": "confRadio",
    "license": {
      "licenseId": "EE_97e59181-0db2-4030-b6f5-d484f6adc297_200_cisjsite032.webex.com",
      "offerName": "EE",
      "licenseType": "CONFERENCING",
      "billingServiceId": "SubCt31test0303032",
      "features": ["cloudmeetings"],
      "volume": 200,
      "isTrial": false,
      "status": "PENDING",
      "capacity": 200,
      "siteUrl": "cisjsite032.webex.com"
    },
    "isCustomerPartner": false
  };

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('WebExApp'));

  beforeEach(inject(function ($rootScope, $log, $interval, $translate, _Authinfo_, _Userservice_, _FeatureToggleService_, _WebExUtilsFact_, _UrlConfig_, _WebExApiGatewayService_, _WebExApiGatewayConstsService_, _WebExSiteRowService_) {

    WebExSiteRowService = _WebExSiteRowService_;
  }));

  it('can correctly initialize WebExSiteRowService', function () {
    expect(WebExSiteRowService).toBeDefined();
    WebExSiteRowService.addSiteRow(fakeSiteRow);
    var siteRowArray = WebExSiteRowService.getSiteRows();
    expect(siteRowArray.length).toBe(1);
  });
});
