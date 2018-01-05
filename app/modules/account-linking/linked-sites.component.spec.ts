import linkedSites from './index';
import { LinkingOperation } from './account-linking.interface';

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
      '$scope');
  });

  beforeEach(function () {
    this.filterSitesDeferred = this.$q.defer();
    spyOn(this.LinkedSitesService, 'filterSites').and.returnValue(this.filterSitesDeferred.promise);
    this.sites =
    [{
      label: 'whatever1',
      name: 'whatever1',
      license: { linkedSiteUrl: 'CoolSiteUrl' },
      isCustomerPartner: false,
      value: 'whatever',
    }, {
      label: 'whatever2',
      name: 'whatever2',
      license: { linkedSiteUrl: 'anotherCoolSiteUrl' },
      isCustomerPartner: true,
      value: 'whatever',
    }];
    this.sites = [
      { linkedSiteUrl: 'CoolSiteUrl', accountLinkingStatus: 'Unknown', usersLinked: 'Unknown' },
      { linkedSiteUrl: 'anotherCoolSiteUrl', accountLinkingStatus: 'Unknown', usersLinked: 'Unknown' },
    ];
  });

  describe('at startup', () => {

    beforeEach(function () {
      this.controller = this.$componentController('linkedSites', {
        LinkedSitesService: this.LinkedSitesService,
        $state: this.$state,
        $stateParams: { originator: 'Banner' },
      }, {});
    });
    it('prevent data mining if feature toggle not set', function() {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      this.filterSitesDeferred.resolve(this.sites);
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.controller.sitesInfo).toBeUndefined();
    });
    it('read from service and convert to format suitable for grid', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      spyOn(this.$state, 'go');
      this.filterSitesDeferred.resolve(this.sites);
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.controller.sitesInfo).toEqual([
        {
          linkedSiteUrl: 'CoolSiteUrl',
          accountLinkingStatus: 'Unknown',
          usersLinked: 'Unknown',
        }, {
          linkedSiteUrl: 'anotherCoolSiteUrl',
          accountLinkingStatus: 'Unknown',
          usersLinked: 'Unknown',
        }]);
    });

    it('show wizard directly if entering page from the banner', function () {
      this.controller = this.$componentController('linkedSites', {
        LinkedSitesService: this.LinkedSitesService,
        $state: this.$state,
        $stateParams: { originator: 'Banner' },
      });

      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      spyOn(this.$state, 'go');
      this.filterSitesDeferred.resolve(this.sites);
      this.controller.$onInit();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith(
        'site-list.linked.details.wizard',
        {
          siteInfo: { linkedSiteUrl: 'CoolSiteUrl', accountLinkingStatus: 'Unknown', usersLinked: 'Unknown' },
          operation: LinkingOperation.New,
        },
      );
    });

  });


  describe('View: ', () => {

    beforeEach(function () {
      this.controller = this.$componentController('linkedSites', {
        LinkedSitesService: this.LinkedSitesService,
        $state: this.$state,
        $stateParams: { originator: 'Banner' },
      }, {});

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
