import testModule from './index';

describe('Component: gmTelephonyDomains', () => {
  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
    this.telephonyDomains = [
      {
        domainName: 'Test12',
        customerAttribute: null,
        primaryBridgeName: null,
        backupBridgeName: null,
        telephonyDomainSites: [],
        status: '',
      },
      {
        domainName: 'CCA_Atlas-Test1_hmwd98_case9',
        customerAttribute: 'TD',
        primaryBridgeName: null,
        backupBridgeName: 'thm99',
        telephonyDomainSites: [],
        status: 'P',
      },
      {
        domainName: 'CCA_Atlas-Test1_ws_test112233',
        customerAttribute: '123213',
        primaryBridgeName: 'thm95',
        backupBridgeName: null,
        telephonyDomainSites: [],
        status: 'A',
      },
    ];

    this.fakeModal = {
      result: {
        then: function (okCallback, cancelCallback) {
          this.okCallback = okCallback;
          this.cancelCallback = cancelCallback;
        },
      },
      ok: function (item) {
        this.result.okCallback(item);
      },
      cancel: function (type) {
        this.result.cancelCallback(type);
      },
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'UrlConfig', '$httpBackend', '$state', '$timeout', '$modal', '$stateParams', '$rootScope', 'TelephonyDomainService', 'Notification');

    initSpies.apply(this);
    this.$stateParams.companyName = 'E_Atlas-Test-5';
    this.$stateParams.customerId = 'ff808081527ccb3f0153116a3531041e';
  });

  function initSpies() {
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$modal, 'open').and.returnValue(this.fakeModal);
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'telephonyDomainsExportCSV').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();

    this.compileComponent('gmTelephonyDomains', {});
    this.$scope.$apply();
  }

  describe('$onInit', () => {
    it('should render ui-grid from gridOptions', function () {
      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(this.telephonyDomains));
      initComponent.call(this);
      this.$scope.$emit('tdUpdated', true);
      expect(this.controller.gridOptions).toBeDefined();
    });

    it('should notify in message for non 200 http status', function() {
      this.TelephonyDomainService.getTelephonyDomains.and.callFake(() => {
        return this.$q.reject({ status: 404 });
      });
      initComponent.call(this);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should call $state.go', function () {
      this.$stateParams.customerId = '';
      this.$rootScope.gem_companyName = 'E_Atlas-Test-5';
      this.$rootScope.gem_customerId = 'ff808081527ccb3f0153116a3531041e';

      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve());
      initComponent.call(this);
      expect(this.$state.go).toHaveBeenCalled();
    });

    it('should call $state.go when show TD detail', function () {
      const item = {
        ccaDomainId: 'ccaDomainId',
        domainName: 'domainName',
      };
      initComponent.call(this);
      this.controller.showDetail(item);
      expect(this.$state.go).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('should filter for search', function() {
      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(this.telephonyDomains));

      initComponent.call(this);
      this.controller.filterList('Test12');
      this.$timeout.flush();
      expect(this.controller.gridData.length).toBe(1);
    });
  });

  describe('export telephony Domains list', () => {
    it('should show notification when export TD list successfully', function() {
      initComponent.call(this);

      this.TelephonyDomainService.telephonyDomainsExportCSV.and.returnValue(this.$q.resolve(this.telephonyDomains));
      this.controller.exportCSV();
      this.$scope.$apply();
      this.$timeout.flush();

      expect(this.Notification.success).toHaveBeenCalled();
    });

    it('should show notification when export TD list failed', function() {
      initComponent.call(this);
      this.TelephonyDomainService.telephonyDomainsExportCSV.and.returnValue(this.$q.reject({ status: 404 }));
      this.controller.exportCSV();
      this.$scope.$apply();
      this.$timeout.flush();

      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('onRequest', () => {
    it('should open request TD modal', function() {
      initComponent.call(this);
      this.controller.onRequest();
      this.fakeModal.ok();
      expect(this.$state.go).toHaveBeenCalled();
    });
  });
});
