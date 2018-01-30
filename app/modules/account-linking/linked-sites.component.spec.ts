import linkedSites from './index';
import { LinkingOperation, IACSiteInfo, IACLinkingStatus, IACWebexSiteinfoResponse, IACWebexPromises, LinkingOriginator } from './account-linking.interface';

describe('Component: linkedSites', () => {

  beforeEach(angular.mock.module(mockDependencies));

  function mockDependencies($provide) {
    $provide.value('uiGridConstants', {});
  }
  beforeEach(function () {
    this.initModules(linkedSites);

    this.injectDependencies(
      '$componentController',
      '$log',
      'LinkedSitesService',
      '$state',
      '$q',
      'FeatureToggleService',
      'Notification',
      '$scope');
  });

  beforeEach(function () {
    spyOn(this.$state, 'go');

    this.siteInfoDefer = <ng.IPromise<IACWebexSiteinfoResponse>>this.$q.defer();
    this.ciAccountSyncDefer = <ng.IPromise<IACLinkingStatus>>this.$q.defer();
    this.domainsDefer = <ng.IPromise<ng.IPromise<any>>>this.$q.defer();

    this.webexInfo = <IACWebexPromises> {
      siteInfoPromise: this.siteInfoDefer.promise,
      ciAccountSyncPromise: this.ciAccountSyncDefer.promise,
      domainsPromise: this.domainsDefer.promise,
    };

    this.siteWithAdmin1 = <IACSiteInfo>{
      isSiteAdmin: true,
      linkedSiteUrl: 'CoolSiteUrl',
      webexInfo: <IACWebexPromises> this.webexInfo,
    };

    this.siteWithAdmin2 = <IACSiteInfo>{
      isSiteAdmin: true,
      linkedSiteUrl: 'anotherCoolSiteUrl',
      webexInfo: <IACWebexPromises> this.webexInfo,
    };

    this.siteWithoutAdmin = <IACSiteInfo>{
      isSiteAdmin: false,
      linkedSiteUrl: 'SiteUrlNotAdmin',
      webexInfo: <IACWebexPromises> this.webexInfo,
    };

    this.filterSitesDeferred = this.$q.defer();
    spyOn(this.LinkedSitesService, 'filterSites').and.returnValue(this.filterSitesDeferred.promise);

  });

  describe('at startup', () => {

    beforeEach(function () {
      this.controller = this.$componentController('linkedSites', {
        LinkedSitesService: this.LinkedSitesService,
        $state: this.$state,
      }, {});
      this.controller.originator = LinkingOriginator.Banner;
    });

    describe('feature toggle not set', () => {
      it('prevent data mining if feature toggle not set', function() {
        spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
        this.filterSitesDeferred.resolve([this.siteWithAdmin1]);
        this.controller.$onInit();
        this.$scope.$apply();
        expect(this.controller.sitesInfo).toBeUndefined();
      });
    });

    describe('feature toggle set', () => {
      beforeEach(function () {
        spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      });

      it('get webex sites list', function () {
        this.controller.$onInit();
        this.filterSitesDeferred.resolve([this.siteWithAdmin1]);
        this.$scope.$apply();
        expect(this.controller.sitesInfo[0].linkedSiteUrl).toEqual('CoolSiteUrl');

      });

      it('get async response from related webex site', function () {
        this.controller.$onInit();
        this.filterSitesDeferred.resolve([this.siteWithAdmin1]);
        this.$scope.$apply();
        expect(this.controller.sitesInfo[0].linkedSiteUrl).toEqual('CoolSiteUrl');
        this.siteInfoDefer.resolve(<IACWebexSiteinfoResponse>{
        });

        this.ciAccountSyncDefer.resolve(<IACLinkingStatus>{
          accountsLinked: 10,
          totalWebExAccounts: 20,
        });

        this.domainsDefer.resolve(<ng.IPromise<any>>{
        });
        this.$scope.$apply();

        expect(this.controller.sitesInfo[0].linkingStatus).toEqual({
          accountsLinked: 10,
          totalWebExAccounts: 20,
        });
      });

      it('go to wizard if admin for only one site that needs accountlinking', function () {
        this.filterSitesDeferred.resolve([this.siteWithAdmin1]);
        this.controller.$onInit();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith(
          'site-list.linked.details.wizard',
          {
            siteInfo: jasmine.any(Object),
            operation: LinkingOperation.New,
            launchWebexFn: jasmine.any(Function),
            setAccountLinkingModeFn: jasmine.any(Function),
          },
        );
      });

      it('go to linkes sites list if admin for several sites that need accountlinking', function () {
        this.filterSitesDeferred.resolve([this.siteWithAdmin1, this.siteWithAdmin2]);
        this.controller.$onInit();
        this.$scope.$apply();
        expect(this.$state.go).toHaveBeenCalledWith(
          'site-list.linked',
          {
            selectedSiteInfo: jasmine.any(Object),
            showWizardFn: jasmine.any(Function),
            launchWebexFn: jasmine.any(Function),
          },
        );
      });

      it('dont show wizard if not admin for site', function () {
        this.filterSitesDeferred.resolve([this.siteWithoutAdmin]);
        this.controller.$onInit();
        this.$scope.$apply();
        expect(this.$state.go).not.toHaveBeenCalled();
      });
    });
  });

  describe('View: ', () => {
    beforeEach(function () {
      this.controller = this.$componentController('linkedSites', {
        LinkedSitesService: this.LinkedSitesService,
        $state: this.$state,
      }, {});
      this.controller.originator = LinkingOriginator.Banner;
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    });

    function initComponent() {
      this.compileComponent('linkedSites', {});
    }

    it('has account-linking section', function () {
      initComponent.call(this);
      this.controller.$onInit();
      const element = this.view.find('.account-linking');
      expect(element.get(0)).toExist();
    });

  });

});
