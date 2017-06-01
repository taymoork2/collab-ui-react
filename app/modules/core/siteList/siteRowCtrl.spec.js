'use strict';

describe('Controller: WebExSiteRowCtrl', function () {

  var controller, $scope, $q, FeatureToggleService, WebExSiteRowService, TokenService;
  var fakeShowGridData = true;
  var fakeGridData = {
    siteUrl: "abc.webex.com",
  };
  var fakeGridOptions = {
    data: fakeGridData,
  };

  var accessToken = "Token ABCDERFGHIJK";

  afterEach(function () {
    controller = $scope = $q = FeatureToggleService = WebExSiteRowService = TokenService = undefined;
  });

  afterAll(function () {
    fakeShowGridData = fakeGridData = fakeGridOptions = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _FeatureToggleService_, _WebExSiteRowService_, _TokenService_) {
    $scope = $rootScope.$new();

    FeatureToggleService = _FeatureToggleService_;
    WebExSiteRowService = _WebExSiteRowService_;
    TokenService = _TokenService_;
    $q = _$q_;

    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(WebExSiteRowService, 'getConferenceServices');
    spyOn(WebExSiteRowService, 'configureGrid');
    spyOn(WebExSiteRowService, 'getGridOptions').and.returnValue(fakeGridOptions);
    spyOn(WebExSiteRowService, 'getShowGridData').and.returnValue(fakeShowGridData);
    spyOn(TokenService, 'getAccessToken').and.returnValue(accessToken);

    controller = $controller('WebExSiteRowCtrl', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      WebExSiteRowService: WebExSiteRowService,
    });

    $scope.$apply();
  }));

  it('can correctly initialize WebExSiteRowCtrl', function () {
    expect(controller).toBeDefined();
    expect(controller.showGridData).toBe(true);
    expect(controller.gridOptions).not.toEqual(null);
    expect(controller.gridOptions.data.siteUrl).toEqual("abc.webex.com");
  });

  it("can correctly initialize cross luach to SiteAdmin home page", function () {
    controller.linkToSiteAdminHomePage('abc.webex.com');
    expect(controller.siteAdminUrl).toBe('https://abc.webex.com/wbxadmin/default.do?siteurl=abc');
    expect(controller.accessToken).toBe(accessToken);
  });

  it("can correctly initialize cross luach to SiteAdmin linked page", function () {
    controller.linkToSiteAdminLinkedPage('abc.webex.com');
    var expectRsult = [];
    expectRsult.push('https://abc.webex.com/wbxadmin/default.do?siteurl=abc');
    expectRsult.push('&mainPage=');
    expectRsult.push(encodeURIComponent('accountlinking.do?siteUrl='));
    expectRsult.push('abc');
    expect(controller.siteAdminUrl).toBe(expectRsult.join(''));
    expect(controller.accessToken).toBe(accessToken);
  });
});
