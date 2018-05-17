// TODO: this file needs to be revisited to:
// - add missing return types for functions
// - add missing types for function args
// - replace instances of `any` with better TS types as-appropriate
import testModule from './index';

describe('Component: SiteList', () => {
  const fakeShowGridData = true;
  const fakeGridData = {
    siteUrl: 'abc.webex.com',
  };
  const fakeGridOptions = {
    data: fakeGridData,
  };

  const centerDetails = [
    {
      purchasedServices: {
        serviceName: 'MC',
        quantity: '20',
      },
    },
  ];

  const accessToken = 'Token ABCDERFGHIJK';
  const licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$modal',
      '$q',
      '$rootScope',
      '$state',
      'Auth',
      'Authinfo',
      'FeatureToggleService',
      'SetupWizardService',
      'SiteListService',
      'TokenService',
      'WebExSiteService',
    );

    spyOn(this.$state, 'go');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.Auth, 'getCustomerAccount').and.returnValue(this.$q.resolve(true));
    spyOn(this.Authinfo, 'updateAccountInfo');
    spyOn(this.SiteListService, 'getConferenceServices');
    spyOn(this.SiteListService, 'configureGrid');
    spyOn(this.SiteListService, 'initSiteRows');
    spyOn(this.SiteListService, 'getGridOptions').and.returnValue(fakeGridOptions);
    spyOn(this.SiteListService, 'getShowGridData').and.returnValue(fakeShowGridData);
    spyOn(this.SiteListService, 'getLicensesInSubscriptionGroupedBySites').and.returnValue(licensesGroupedBySites);
    spyOn(this.SetupWizardService, 'isSubscriptionPending').and.returnValue(false);
    spyOn(this.SetupWizardService, 'isSubscriptionEnterprise').and.returnValue(true);
    spyOn(this.SetupWizardService, 'getEnterpriseSubscriptionListWithStatus').and.returnValue([{}]);
    spyOn(this.WebExSiteService, 'getAllCenterDetailsFromSubscriptions').and.returnValue(this.$q.resolve(centerDetails));
    spyOn(this.WebExSiteService, 'deleteSite').and.returnValue(this.$q.resolve(true));
    spyOn(this.TokenService, 'getAccessToken').and.returnValue(accessToken);
    spyOn(this.$modal, 'open').and.returnValue({ result: this.$q.resolve() });

    this.compileComponent('site-list', {
      hideLinked: true,
    });
  });

  it('can correctly initialize WebExSiteRowCtrl', function () {
    expect(this.controller).toBeDefined();
    expect(this.controller.showGridData).toBe(true);
    expect(this.controller.gridOptions).not.toEqual(null);
    expect(this.controller.gridOptions.data.siteUrl).toEqual('abc.webex.com');
    expect(this.controller.allCenterDetailsForSubscriptions).toBeDefined();
  });
  it('can correctly initialize cross launch to SiteAdmin home page', function () {
    this.controller.linkToSiteAdminHomePage('abc.webex.com');
    expect(this.controller.siteAdminUrl).toBe('https://abc.webex.com/wbxadmin/default.do?siteurl=abc');
    expect(this.controller.accessToken).toBe(accessToken);
  });

  it('can correctly initialize cross launch to SiteAdmin linked page', function () {
    this.controller.linkToSiteAdminLinkedPage('abc.webex.com');
    const expectResult: any[] = [];
    expectResult.push('https://abc.webex.com/wbxadmin/default.do?siteurl=abc');
    expectResult.push('&mainPage=');
    expectResult.push(encodeURIComponent('accountlinking.do?siteUrl='));
    expectResult.push('abc');
    expect(this.controller.siteAdminUrl).toBe(expectResult.join(''));
    expect(this.controller.accessToken).toBe(accessToken);
  });

  it('can correctly go to metrics report page', function () {
    const stateName = 'reports.webex-metrics';
    const siteUrl = 'abc.webex.com';
    this.controller.linkToReports(siteUrl);
    expect(this.$state.go).toHaveBeenCalledWith(stateName, { siteUrl: siteUrl });
  });

  it('exclude linked sites if Account Linking Phase 2', function () {
    expect(this.SiteListService.initSiteRows).toHaveBeenCalledWith(true);
  });

  it('should go to detail page when site selected', function() {
    const stateName = 'site-list.not-linked.detail';
    this.controller.onSiteSelected(fakeGridData);
    expect(this.$state.go).toHaveBeenCalledWith(stateName, jasmine.objectContaining({
      selectedSite: fakeGridData,
    }));
  });

  describe('canModify function', function () {
    let entity;
    const licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

    beforeEach(function () {
      entity = {
        billingServiceId: '123',
        siteUrl: 'ag-test1-org.webex.com',
      };
    });

    it('should return TRUE if there are 2 or more sites in subscription and subscription is not pending', function () {
      expect(_.keys(licensesGroupedBySites).length >= 2).toBeTruthy();
      expect(this.controller.canModify(entity)).toBeTruthy();
    });

    it('should return FALSE if there are 2 or more sites in subscription but subscription is  pending', function () {
      this.SetupWizardService.isSubscriptionPending.and.returnValue(true);
      expect(_.keys(licensesGroupedBySites).length >= 2).toBeTruthy();
      expect(this.controller.canModify(entity)).toBeFalsy();
    });

    it('should return FALSE if there is only one site in subscription', function () {
      const oneSite = _.pick(licensesGroupedBySites, 'ag-test1-org.webex.com');
      this.SiteListService.getLicensesInSubscriptionGroupedBySites.and.returnValue(oneSite);
      expect(this.controller.canModify(entity)).toBeFalsy();
    });

    it('should return FALSE if entity does not have billingServiceId (e.g. trial site)', function () {
      entity = {
        siteUrl: 'ag-test1-org.webex.com',
      };
      expect(this.controller.canModify(entity)).toBeFalsy();
    });
  });

  describe('delete behavior', function () {
    let entity;
    const licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

    beforeEach(function () {
      entity = {
        billingServiceId: '123',
        siteUrl: 'ag-test1-org.webex.com',
      };
    });

    it('should launch license redistribution if there are more than 2 sites in subscription and subscription not pending', function () {
      const expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.deleteSiteModalTitle"></h3>';
      expect(this.controller.canModify(entity)).toBeTruthy();
      this.controller.deleteSite(entity);
      this.$scope.$digest();
      const modalCallArgs = this.$modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(this.$state.go).toHaveBeenCalledWith('site-list-delete', { subscriptionId: '123', siteUrl: 'ag-test1-org.webex.com', centerDetails: [] });
      expect(this.WebExSiteService.deleteSite).not.toHaveBeenCalled();
    });

    describe('behavior with two sites and non-pending subscription', function () {
      beforeEach(function () {
        const twoSites = _.omit(licensesGroupedBySites, 'JP-TEST-ORG.webex.com');
        this.SiteListService.getLicensesInSubscriptionGroupedBySites.and.returnValue(twoSites);
      });

      it('should redistribute licenses itself and call WebExSiteService.deleteSite() passing subscriptionId', function () {
        expect(this.controller.canModify(entity)).toBeTruthy();
        this.controller.deleteSite(entity);
        this.$scope.$digest();
        expect(this.$state.go).not.toHaveBeenCalled();
        expect(this.WebExSiteService.deleteSite).toHaveBeenCalled();
        expect(this.WebExSiteService.deleteSite.calls.mostRecent().args[0]).toBe(entity.billingServiceId);
      });

      it('should add licenses together for the remaining site', function () {
        const expectedResult = [
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
        this.controller.deleteSite(entity);
        this.$scope.$digest();
        const deleteSiteArgs = this.WebExSiteService.deleteSite.calls.mostRecent().args;
        expect(_.isEqual(deleteSiteArgs[1], expectedResult)).toBeTruthy();
      });

      it('if deleted site has the center type, and the remaining does not, add center type to remaining site', function () {
        entity.siteUrl = 'jp-test1-org.webex.com';
        const expectedResult = [
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
        this.controller.deleteSite(entity);
        this.$scope.$digest();
        const deleteSiteArgs = this.WebExSiteService.deleteSite.calls.mostRecent().args;
        expect(_.isEqual(deleteSiteArgs[1], expectedResult)).toBeTruthy();
        expect(this.Auth.getCustomerAccount).toHaveBeenCalled();
        expect(this.Authinfo.updateAccountInfo).toHaveBeenCalled();
      });
    });

    it('should not allow deletion if canModify() is false ', function () {
      const expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.deleteSiteRejectModalTitle"></h3>';
      const oneSite = _.pick(licensesGroupedBySites, 'ag-test1-org.webex.com');
      this.SiteListService.getLicensesInSubscriptionGroupedBySites.and.returnValue(oneSite);
      expect(this.controller.canModify(entity)).toBeFalsy();
      this.controller.deleteSite(entity);
      const modalCallArgs = this.$modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(this.$state.go).not.toHaveBeenCalled();
      expect(this.WebExSiteService.deleteSite).not.toHaveBeenCalled();
    });
  });

  describe('isSubscriptionEnterprise() function', function () {
    it('should return result from SetupWizardService.isSubscriptionEnterprise if license is passed ', function () {
      expect(this.controller.isSubscriptionEnterprise('123')).toBeTruthy();
      this.SetupWizardService.isSubscriptionEnterprise.and.returnValue(false);
      expect(this.controller.isSubscriptionEnterprise('123')).toBeFalsy();
    });
    it('should, if no license is passed, return true if there are any licenses returned by SetupWizardService.getEnterpriseSubscriptionListWithStatus', function () {
      expect(this.controller.isSubscriptionEnterprise()).toBeTruthy();
      this.SetupWizardService.getEnterpriseSubscriptionListWithStatus.and.returnValue([]);
      expect(this.controller.isSubscriptionEnterprise()).toBeFalsy();
    });
  });

  describe('redistribute licenses behavior', function () {
    let entity;
    const licensesGroupedBySites = _.groupBy(getJSONFixture('core/json/authInfo/webexLicenses.json'), 'siteUrl');

    beforeEach(function () {
      entity = {
        billingServiceId: '123',
        siteUrl: 'ag-test1-org.webex.com',
      };
    });
    it('should not launch redistribution if there is only one site in subscription', function () {
      const expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.redistributeRejectModalTitle"></h3>';
      const oneSite = _.pick(licensesGroupedBySites, 'ag-test1-org.webex.com');
      this.SiteListService.getLicensesInSubscriptionGroupedBySites.and.returnValue(oneSite);
      expect(this.controller.canModify(entity)).toBeFalsy();
      this.controller.redistributeLicenses(entity);
      const modalCallArgs = this.$modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(this.$state.go).not.toHaveBeenCalled();
    });
    it('should launch license redistribution if there are more than 2 sites in subscription and subscription is not pending', function () {
      expect(this.controller.canModify(entity)).toBeTruthy();
      this.controller.redistributeLicenses(entity);
      expect(this.$state.go).toHaveBeenCalledWith('site-list-distribute-licenses', { subscriptionId: '123', centerDetails: [] });
    });
    it('should NOT launch license redistribution and should show appropriate modal if subscription is pending', function () {
      const expectedModalTitle = '<h3 class="modal-title" translate="webexSiteManagement.redistributeRejectModalTitle"></h3>';
      this.SetupWizardService.isSubscriptionPending.and.returnValue(true);
      expect(this.controller.canModify(entity)).toBeFalsy();
      this.controller.redistributeLicenses(entity);
      const modalCallArgs = this.$modal.open.calls.mostRecent().args[0];
      expect(modalCallArgs.template.indexOf(expectedModalTitle) > -1);
      expect(this.$state.go).not.toHaveBeenCalled();
    });
  });
  describe('When a site is added or deleted', function () {
    it('should refresh the site list data', function () {
      this.$rootScope.$broadcast('core::siteListModified');
      this.$scope.$digest();
      expect(this.Auth.getCustomerAccount).toHaveBeenCalled();
      expect(this.Authinfo.updateAccountInfo).toHaveBeenCalled();
    });
  });
});
