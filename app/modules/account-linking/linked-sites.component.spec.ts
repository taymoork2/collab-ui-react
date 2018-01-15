import linkedSites from './index';
import { LinkingOperation, IACSiteInfo, IACLinkingStatus, IACWebexSiteinfoResponse, IACWebexPromises, LinkingOriginator } from './account-linking.interface';

describe('Component: linkedSites', () => {

  beforeEach(angular.mock.module(mockDependencies));

  function mockDependencies($provide) {
    const Userservice = {
      getUserAsPromise: () => {
        return {
          then: (success) => {
            return success();
          },
        };
      },
    };
    $provide.value('Userservice', Userservice);
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

    this.sites = <IACSiteInfo[]>[
      {
        linkedSiteUrl: 'CoolSiteUrl',
        webexInfo: <IACWebexPromises> this.webexInfo,
      },
      {
        linkedSiteUrl: 'anotherCoolSiteUrl',
        webexInfo: <IACWebexPromises> this.webexInfo,
      },
    ];

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
        this.filterSitesDeferred.resolve(this.sites);
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
        this.filterSitesDeferred.resolve(this.sites);
        this.$scope.$apply();
        expect(this.controller.sitesInfo[0].linkedSiteUrl).toEqual('CoolSiteUrl');

      });

      it('get async response from related webex site', function () {
        this.controller.$onInit();
        this.filterSitesDeferred.resolve(this.sites);
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

      it('go to wizard with relevant parameters if entering page from the banner', function () {
        this.filterSitesDeferred.resolve(this.sites);
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
    });
  });

  // TODO: Add more relevant tests for the view, not only controller !
  xdescribe('View: ', () => {
    beforeEach(function () {
      this.controller = this.$componentController('linkedSites', {
        LinkedSitesService: this.LinkedSitesService,
        $state: this.$state,
        uiGridConstants: {},
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
      // TODO: Create a more relevant test...
      const element = this.view.find('.account-linking');
      expect(element.get(0)).toExist();

    });

  });

});
