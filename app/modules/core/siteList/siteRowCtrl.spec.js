'use strict';

describe('Controller: WebExSiteRowCtrl', function () {
  var controller, $controller, $modal, $scope, $q, FeatureToggleService, WebExSiteRowService, TokenService, state;
  var fakeShowGridData = true;
  var fakeGridData = {
    siteUrl: 'abc.webex.com',
  };
  var fakeGridOptions = {
    data: fakeGridData,
  };

  var accessToken = 'Token ABCDERFGHIJK';
  var licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

  afterEach(function () {
    controller = $scope = $modal = $controller = $q = FeatureToggleService = WebExSiteRowService = TokenService = state = undefined;
  });

  afterAll(function () {
    fakeShowGridData = fakeGridData = fakeGridOptions = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($rootScope, _$controller_, _$modal_, _$q_, $state, _FeatureToggleService_, _WebExSiteRowService_, _TokenService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    FeatureToggleService = _FeatureToggleService_;
    WebExSiteRowService = _WebExSiteRowService_;
    TokenService = _TokenService_;
    state = $state;
    $modal = _$modal_;
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
    spyOn(WebExSiteRowService, 'getLicensesInSubscriptionGroupedBySites').and.returnValue(licensesGroupedBySites);
    spyOn(WebExSiteRowService, 'isSubscriptionPending').and.returnValue(false);
    spyOn(WebExSiteRowService, 'deleteSite');
    spyOn($modal, 'open').and.returnValue({ result: $q.resolve() });
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

  it('dont exclude linked sites', function () {
    expect(WebExSiteRowService.initSiteRows).toHaveBeenCalledWith(false);
  });

  it('exclude linked sites if Account Linking Phase 2', function () {
    controller = $controller('WebExSiteRowCtrl', {
      $scope: $scope,
      FeatureToggleService: FeatureToggleService,
      WebExSiteRowService: WebExSiteRowService,
      accountLinkingPhase2: true,
    });
    expect(WebExSiteRowService.initSiteRows).toHaveBeenCalledWith(true);
  });

  describe('canModify function', function () {
    var entity;
    var licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

    beforeEach(function () {
      entity = {
        billingServiceId: '123',
        siteUrl: 'ag-test1-org.webex.com',
      };
    });

    it('should return TRUE if there are 2 or more sites in subscription and subscription is not pending', function () {
      expect(_.keys(licensesGroupedBySites).length >= 2).toBeTruthy();
      expect(controller.canModify(entity)).toBeTruthy();
    });

    it('should return FALSE if there are 2 or more sites in subscription but subscription is  pending', function () {
      WebExSiteRowService.isSubscriptionPending.and.returnValue(true);
      expect(_.keys(licensesGroupedBySites).length >= 2).toBeTruthy();
      expect(controller.canModify(entity)).toBeFalsy();
    });

    it('should return FALSE if there is only one site in subscription', function () {
      var oneSite = _.pick(licensesGroupedBySites, 'ag-test1-org.webex.com');
      WebExSiteRowService.getLicensesInSubscriptionGroupedBySites.and.returnValue(oneSite);
      expect(controller.canModify(entity)).toBeFalsy();
    });

    it('should return FALSE if entity does not have billingServiceId (e.g. trial site)', function () {
      entity = {
        siteUrl: 'ag-test1-org.webex.com',
      };
      expect(controller.canModify(entity)).toBeFalsy();
    });
  });

  describe('delete behavior', function () {
    var entity;
    var licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

    beforeEach(function () {
      entity = {
        billingServiceId: '123',
        siteUrl: 'ag-test1-org.webex.com',
      };
    });

    it('should launch license redistribution if there are more than 2 sites in subscription and subscription not pending', function () {
      var expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.deleteSiteModalTitle"></h3>';
      expect(controller.canModify(entity)).toBeTruthy();
      controller.deleteSite(entity);
      $scope.$digest();
      var modalCallArgs = $modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(state.go).toHaveBeenCalledWith('site-list-delete', { subscriptionId: '123', siteUrl: 'ag-test1-org.webex.com' });
      expect(WebExSiteRowService.deleteSite).not.toHaveBeenCalled();
    });

    it('should redistribute licenses itself when there are two sites in subscription and subscription is not pending', function () {
      var twoSites = _.omit(licensesGroupedBySites, 'JP-TEST-ORG.webex.com');
      var expectedResult = [
        {
          offerName: 'EE',
          volume: 100,
          siteUrl: 'jp-test1-org.webex.com',
        },
        {
          offerName: 'TC',
          volume: 200,
          siteUrl: 'jp-test1-org.webex.com',
        },
      ];

      WebExSiteRowService.getLicensesInSubscriptionGroupedBySites.and.returnValue(twoSites);
      expect(controller.canModify(entity)).toBeTruthy();
      controller.deleteSite(entity);
      $scope.$digest();
      expect(state.go).not.toHaveBeenCalled();
      expect(WebExSiteRowService.deleteSite).toHaveBeenCalledWith(entity.siteUrl, expectedResult);
    });

    it('should not allow deletion if canModify() is false ', function () {
      var expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.deleteSiteRejectModalTitle"></h3>';
      var oneSite = _.pick(licensesGroupedBySites, 'ag-test1-org.webex.com');
      WebExSiteRowService.getLicensesInSubscriptionGroupedBySites.and.returnValue(oneSite);
      expect(controller.canModify(entity)).toBeFalsy();
      controller.deleteSite(entity);
      var modalCallArgs = $modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(state.go).not.toHaveBeenCalled();
      expect(WebExSiteRowService.deleteSite).not.toHaveBeenCalled();
    });
  });

  describe('redistribute licenses behavior', function () {
    var entity;
    var licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

    beforeEach(function () {
      entity = {
        billingServiceId: '123',
        siteUrl: 'ag-test1-org.webex.com',
      };
    });
    it('should not launch redistribution if there is only one site in subscription', function () {
      var expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.redistributeRejectModalTitle"></h3>';
      var oneSite = _.pick(licensesGroupedBySites, 'ag-test1-org.webex.com');
      WebExSiteRowService.getLicensesInSubscriptionGroupedBySites.and.returnValue(oneSite);
      expect(controller.canModify(entity)).toBeFalsy();
      controller.redistributeLicenses(entity);
      var modalCallArgs = $modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(state.go).not.toHaveBeenCalled();
    });
    it('should launch license redistribution if there are more than 2 sites in subscription and subscription is not pending', function () {
      expect(controller.canModify(entity)).toBeTruthy();
      controller.redistributeLicenses(entity);
      expect(state.go).toHaveBeenCalledWith('site-list-distribute-licenses', { subscriptionId: '123' });
    });
    it('should NOT launch license redistribution and should show appropriate modal if subscription is pending', function () {
      var expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.redistributeRejectModalTitle"></h3>';
      WebExSiteRowService.isSubscriptionPending.and.returnValue(true);
      expect(controller.canModify(entity)).toBeFalsy();
      controller.redistributeLicenses(entity);
      var modalCallArgs = $modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(state.go).not.toHaveBeenCalled();
    });
  });
});
