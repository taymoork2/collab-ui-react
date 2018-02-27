'use strict';

describe('Controller: WebExSiteRowCtrl', function () {
  var controller, $controller, $modal, $scope, $q, Auth, Authinfo, FeatureToggleService, SetupWizardService, WebExSiteRowService, WebExSiteService, TokenService, rootScope, state;
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
    controller = $scope = $modal = $controller = $q = FeatureToggleService = SetupWizardService = WebExSiteRowService = TokenService = state = undefined;
  });

  afterAll(function () {
    fakeShowGridData = fakeGridData = fakeGridOptions = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($rootScope, _$controller_, _$modal_, _$q_, $state, _Auth_, _Authinfo_, _FeatureToggleService_, _SetupWizardService_, _WebExSiteService_, _WebExSiteRowService_, _TokenService_) {
    rootScope = $rootScope;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    Auth = _Auth_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    WebExSiteRowService = _WebExSiteRowService_;
    WebExSiteService = _WebExSiteService_;
    TokenService = _TokenService_;
    SetupWizardService = _SetupWizardService_;
    state = $state;
    $modal = _$modal_;
    $q = _$q_;

    spyOn(state, 'go');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(Auth, 'getCustomerAccount').and.returnValue($q.resolve(true));
    spyOn(Authinfo, 'updateAccountInfo');
    spyOn(WebExSiteRowService, 'shouldShowSiteManagement').and.returnValue($q.resolve(true));
    spyOn(WebExSiteRowService, 'getConferenceServices');
    spyOn(WebExSiteRowService, 'configureGrid');
    spyOn(WebExSiteRowService, 'initSiteRows');
    spyOn(WebExSiteRowService, 'getGridOptions').and.returnValue(fakeGridOptions);
    spyOn(WebExSiteRowService, 'getShowGridData').and.returnValue(fakeShowGridData);
    spyOn(WebExSiteRowService, 'getLicensesInSubscriptionGroupedBySites').and.returnValue(licensesGroupedBySites);
    spyOn(SetupWizardService, 'isSubscriptionPending').and.returnValue(false);
    spyOn(SetupWizardService, 'isSubscriptionEnterprise').and.returnValue(true);
    spyOn(SetupWizardService, 'getEnterpriseSubscriptionListWithStatus').and.returnValue([{}]);
    spyOn(WebExSiteService, 'getCenterDetailsForAllSubscriptions').and.returnValue($q.resolve([]));
    spyOn(WebExSiteService, 'deleteSite').and.returnValue($q.resolve(true));
    spyOn(TokenService, 'getAccessToken').and.returnValue(accessToken);
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

  it('will set isShowAddSite to TRUE if \'shouldShowSiteManagement()\' resolves with TRUE ', function () {
    expect(controller.isShowAddSite).toBeTruthy();
  });

  it('will set isShowAddSite to FALSE  if \'shouldShowSiteManagement\' resolves with FALSE', function () {
    WebExSiteRowService.shouldShowSiteManagement.and.returnValue($q.resolve(false));
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
      SetupWizardService.isSubscriptionPending.and.returnValue(true);
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
      expect(WebExSiteService.getCenterDetailsForAllSubscriptions).toHaveBeenCalled();
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(state.go).toHaveBeenCalledWith('site-list-delete', { subscriptionId: '123', siteUrl: 'ag-test1-org.webex.com', centerDetails: [] });
      expect(WebExSiteService.deleteSite).not.toHaveBeenCalled();
    });

    describe('behavior with two sites and non-pending subscription', function () {
      beforeEach(function () {
        var twoSites = _.omit(licensesGroupedBySites, 'JP-TEST-ORG.webex.com');
        WebExSiteRowService.getLicensesInSubscriptionGroupedBySites.and.returnValue(twoSites);
      });

      it('should redistribute licenses itself and call WebExSiteService.deleteSite() passing subscriptionId', function () {
        expect(controller.canModify(entity)).toBeTruthy();
        controller.deleteSite(entity);
        $scope.$digest();
        expect(state.go).not.toHaveBeenCalled();
        expect(WebExSiteService.deleteSite).toHaveBeenCalled();
        expect(WebExSiteService.deleteSite.calls.mostRecent().args[0]).toBe(entity.billingServiceId);
      });

      it('should add licenses together for the remaining site', function () {
        var expectedResult = [
          {
            centerType: 'EE',
            quantity: 100,
            siteUrl: 'jp-test1-org.webex.com',
          },
          {
            centerType: 'TC',
            quantity: 200,
            siteUrl: 'jp-test1-org.webex.com',
          },
        ];
        controller.deleteSite(entity);
        $scope.$digest();
        var deleteSiteArgs = WebExSiteService.deleteSite.calls.mostRecent().args;
        expect(_.isEqual(deleteSiteArgs[1], expectedResult)).toBeTruthy();
      });

      it('if deleted site has the center type, and the remaining does not, add center type to remaining site', function () {
        entity.siteUrl = 'jp-test1-org.webex.com';
        var expectedResult = [
          {
            centerType: 'TC',
            quantity: 200,
            siteUrl: 'ag-test1-org.webex.com',
          },
          {
            centerType: 'EE',
            quantity: 100,
            siteUrl: 'ag-test1-org.webex.com',
          },
        ];
        controller.deleteSite(entity);
        $scope.$digest();
        var deleteSiteArgs = WebExSiteService.deleteSite.calls.mostRecent().args;
        expect(_.isEqual(deleteSiteArgs[1], expectedResult)).toBeTruthy();
        expect(Auth.getCustomerAccount).toHaveBeenCalled();
        expect(Authinfo.updateAccountInfo).toHaveBeenCalled();
      });
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
      expect(WebExSiteService.deleteSite).not.toHaveBeenCalled();
    });
  });

  describe('isSubscriptionEnterprise() function', function () {
    it('should return result from SetupWizardService.isSubscriptionEnterprise if license is passed ', function () {
      expect(controller.isSubscriptionEnterprise('123')).toBeTruthy();
      SetupWizardService.isSubscriptionEnterprise.and.returnValue(false);
      expect(controller.isSubscriptionEnterprise('123')).toBeFalsy();
    });
    it('should, if no license is passed, return true if there are any licenses returned by SetupWizardService.getEnterpriseSubscriptionListWithStatus', function () {
      expect(controller.isSubscriptionEnterprise()).toBeTruthy();
      SetupWizardService.getEnterpriseSubscriptionListWithStatus.and.returnValue([]);
      expect(controller.isSubscriptionEnterprise()).toBeFalsy();
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
      expect(state.go).toHaveBeenCalledWith('site-list-distribute-licenses', { subscriptionId: '123', centerDetails: [] });
    });
    it('should NOT launch license redistribution and should show appropriate modal if subscription is pending', function () {
      var expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.redistributeRejectModalTitle"></h3>';
      SetupWizardService.isSubscriptionPending.and.returnValue(true);
      expect(controller.canModify(entity)).toBeFalsy();
      controller.redistributeLicenses(entity);
      var modalCallArgs = $modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(state.go).not.toHaveBeenCalled();
    });
  });
  describe('When a site is added or deleted', function () {
    it('should refresh the site list data', function () {
      rootScope.$broadcast('core::siteListModified');
      $scope.$digest();
      expect(Auth.getCustomerAccount).toHaveBeenCalled();
      expect(Authinfo.updateAccountInfo).toHaveBeenCalled();
    });
  });
});
