import testModule from '../index';

describe('Component: gmTdSites', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$state', '$httpBackend', '$stateParams', 'Notification', 'TelephonyDomainService', 'PreviousState', 'UrlConfig', '$modal');
    initSpies.apply(this);
    initComponent.apply(this);
  });

  function initSpies() {
    this.$httpBackend.whenGET(this.UrlConfig.getGeminiUrl() + 'countries').respond(200);
    spyOn(this.PreviousState, 'go');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$modal, 'open').and.returnValue({ result: this.$q.resolve() });
    spyOn(this.TelephonyDomainService, 'moveSite').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    this.$stateParams.data = {
      customerId: 'ff808081527ccb3f0153116a3531041e',
      curTd: {
        ccaDomainId: '8a607bdb59baadf5015aaba2d1731b48',
        primaryBridgeId: 7887,
        primaryBridgeName: 'thm95',
        backupBridgeId: 7892,
        backupBridgeName: 'thm99',
        telephonyDomainSites: [{
          siteId: '858622',
          siteName: 'xiaoyuantest1',
          siteUrl: 'xiaoyuantest1.webex.com',
        }, {
          siteId: '858623',
          siteName: 'xiaoyuantest2',
          siteUrl: 'xiaoyuantest2.webex.com',
        }],
      },
      tds: [{
        ccaDomainId: '8a607bdb59baadf5015aaba2d1731b47',
        primaryBridgeId: 7887,
        primaryBridgeName: 'thm95',
        backupBridgeId: 7892,
        backupBridgeName: 'thm99',
      }, {
        ccaDomainId: '8a607bdb59baadf5015aaba2d1731b48',
        primaryBridgeId: 7887,
        primaryBridgeName: 'thm95',
        backupBridgeId: 7892,
        backupBridgeName: 'thm99',
      }],
    };

    this.$state.current.data = {};
    this.compileComponent('gmTdSites', {});
    this.$scope.$apply();
  }

  describe('$onInit', function () {
    it('Should get correct info for gmTdSites component', function () {
      expect(this.controller.sites.length).toBe(2);
    });
  });

  describe('Click event', function () {
    it('Should move site successfully when click move site link', function () {
      const site = {
        siteId: '858622',
        siteUrl: 'xiaoyuantest1.webex.com',
      };
      const targetTd = {
        targetCcaDomainId: '8a607bdb59baadf5015aaba2d1731b47',
        targetDomainName: 'TD001',
      };

      this.TelephonyDomainService.moveSite.and.returnValue(this.$q.resolve());
      this.controller.onClick(site, targetTd);
      this.$scope.$apply();

      expect(this.controller.sites.length).toBe(1);
    });

    it('Should move site failed when click move site link', function () {
      const site = {
        siteId: '858622',
        siteUrl: 'xiaoyuantest1.webex.com',
      };
      const targetTd = {
        targetCcaDomainId: '8a607bdb59baadf5015aaba2d1731b47',
        targetDomainName: 'TD001',
      };

      this.TelephonyDomainService.moveSite.and.returnValue(this.$q.reject( { status: 404 } ));
      this.controller.onClick(site, targetTd);
      this.$scope.$apply();

      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('Should go to previous state when click cancel button', function () {
      this.controller.onCancel();
      expect(this.PreviousState.go).toHaveBeenCalled();
    });
  });
});
