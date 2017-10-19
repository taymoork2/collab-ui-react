'use strict';

describe('Controller: WebExSiteRowCtrl', function () {
  var controller, $controller, $scope, $q, FeatureToggleService, WebExSiteRowService, TokenService, state;
  var fakeShowGridData = true;
  var fakeGridData = {
    siteUrl: 'abc.webex.com',
  };
  var fakeGridOptions = {
    data: fakeGridData,
  };

  var accessToken = 'Token ABCDERFGHIJK';

  afterEach(function () {
    controller = $scope = $controller = $q = FeatureToggleService = WebExSiteRowService = TokenService = state = undefined;
  });

  afterAll(function () {
    fakeShowGridData = fakeGridData = fakeGridOptions = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($rootScope, _$controller_, $state, _$q_, _FeatureToggleService_, _WebExSiteRowService_, _TokenService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    FeatureToggleService = _FeatureToggleService_;
    WebExSiteRowService = _WebExSiteRowService_;
    TokenService = _TokenService_;
    state = $state;
    $q = _$q_;

    spyOn(state, 'go');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasWebexAddSiteGetStatus').and.returnValue($q.resolve(true));
    spyOn(WebExSiteRowService, 'getConferenceServices');
    spyOn(WebExSiteRowService, 'configureGrid');
    spyOn(WebExSiteRowService, 'initSiteRows');
    spyOn(WebExSiteRowService, 'getGridOptions').and.returnValue(fakeGridOptions);
    spyOn(WebExSiteRowService, 'getShowGridData').and.returnValue(fakeShowGridData);
    spyOn(TokenService, 'getAccessToken').and.returnValue(accessToken);
  }));

  beforeEach(initController);

  function initController() {
    controller = $controller('WebExSiteRowCtrl', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      WebExSiteRowService: WebExSiteRowService,
      hasAtlasHybridCallUserTestTool: false,
      accountLinkingPhase2: false,
    });

    $scope.$apply();
  }

  it('can correctly initialize WebExSiteRowCtrl', function () {
    expect(controller).toBeDefined();
    expect(controller.showGridData).toBe(true);
    expect(controller.gridOptions).not.toEqual(null);
    expect(controller.gridOptions.data.siteUrl).toEqual('abc.webex.com');
  });

  it('can correctly initialize cross luach to SiteAdmin home page', function () {
    controller.linkToSiteAdminHomePage('abc.webex.com');
    expect(controller.siteAdminUrl).toBe('https://abc.webex.com/wbxadmin/default.do?siteurl=abc');
    expect(controller.accessToken).toBe(accessToken);
  });

  it('can correctly initialize cross luach to SiteAdmin linked page', function () {
    controller.linkToSiteAdminLinkedPage('abc.webex.com');
    var expectRsult = [];
    expectRsult.push('https://abc.webex.com/wbxadmin/default.do?siteurl=abc');
    expectRsult.push('&mainPage=');
    expectRsult.push(encodeURIComponent('accountlinking.do?siteUrl='));
    expectRsult.push('abc');
    expect(controller.siteAdminUrl).toBe(expectRsult.join(''));
    expect(controller.accessToken).toBe(accessToken);
  });

  it('can correctly go to metrics report page', function () {
    var stateName = 'reports.webex-metrics';
    var siteUrl = 'abc.webex.com';
    controller.linkToReports(siteUrl);
    expect(state.go).toHaveBeenCalledWith(stateName, { siteUrl: siteUrl });
  });

  it('will set isShowAddSite to TRUE if \'atlasWebexAddSiteGetStatus\' FT is enabled', function () {
    expect(controller.isShowAddSite).toBeTruthy();
  });

  it('will set isShowAddSite to FALSE  if \'atlasWebexAddSiteGetStatus\' FT is disabled', function () {
    FeatureToggleService.atlasWebexAddSiteGetStatus.and.returnValue($q.resolve(false));
    initController();
    expect(controller.isShowAddSite).toBeFalsy();
  });

  it('dont exclude linked sites'), function () {
    expect(WebExSiteRowService.initSiteRows).toHaveBeenCalledWith(false);
  }

  it('exclude linked sites if Account Linking Phase 2', function () {
    controller = $controller('WebExSiteRowCtrl', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      WebExSiteRowService: WebExSiteRowService,
      accountLinkingPhase2: true,
    });
    expect(WebExSiteRowService.initSiteRows).toHaveBeenCalledWith(true);
  });
});
