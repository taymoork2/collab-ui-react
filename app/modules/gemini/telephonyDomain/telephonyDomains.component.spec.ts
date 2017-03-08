import testModule from './index';

describe('Component: gmTelephonyDomains', () => {
  beforeAll(function () {
    this.preData = getJSONFixture('gemini/common.json');
    this.telephonyDomains = [
      {
        domainName: 'Test12',
        customerAttribute: null,
        primaryBridgeName: null,
        backupBridgeName: null,
        telephonyDomainSites: [],
        status: '',
        webDomainName: 'TestWebDomaindHQrq',
      },
      {
        domainName: 'CCA_Atlas-Test1_hmwd98_case9',
        customerAttribute: 'TD',
        primaryBridgeName: null,
        backupBridgeName: 'thm99',
        telephonyDomainSites: [],
        status: 'P',
        webDomainName: 'TestWebDomainghtUJ',
      },
      {
        domainName: 'CCA_Atlas-Test1_ws_test112233',
        customerAttribute: '123213',
        primaryBridgeName: 'thm95',
        backupBridgeName: null,
        telephonyDomainSites: [],
        status: 'A',
        webDomainName: 'TestWebDomainlrwcx',
      },
    ];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', '$state', '$timeout', '$stateParams', '$rootScope', 'TelephonyDomainService', 'Notification');

    initSpies.apply(this);
    this.$stateParams.companyName = 'E_Atlas-Test-5';
    this.$stateParams.customerId = 'ff808081527ccb3f0153116a3531041e';
  });

  function initSpies() {
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.TelephonyDomainService, 'getTelephonyDomains').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'telephonyDomainsExportCSV').and.returnValue(this.$q.resolve());
  }

  function initComponent() {
    this.compileComponent('gmTelephonyDomains', {});
    this.$scope.$apply();
  }

  describe('$onInit', () => {
    it('should render ui-grid from gridOptions', function () {
      let mockData = this.preData.common;
      mockData.content.data.body = this.telephonyDomains;
      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
      initComponent.call(this);
      expect(this.controller.gridOptions).toBeDefined();
    });

    it('should notify in message for non 200 http status', function() {
      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.reject({ status: 404 }));
      initComponent.call(this);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });

    it('should notify in message for non 0 error returnCode', function() {
      let mockData = this.preData.common;
      mockData.content.data.returnCode = 100;
      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));
      initComponent.call(this);
      expect(this.Notification.error).toHaveBeenCalled();
    });

    it('should call $state.go', function () {
      this.$stateParams.customerId = '';
      this.$rootScope.gem_companyName = 'E_Atlas-Test-5';
      this.$rootScope.gem_customerId = 'ff808081527ccb3f0153116a3531041e';

      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve());
      initComponent.call(this);
      expect(this.$state.go).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('should filter for search', function() {
      let mockData = this.preData.common;
      mockData.content.data.returnCode = 0;
      mockData.content.data.body = this.telephonyDomains;
      this.TelephonyDomainService.getTelephonyDomains.and.returnValue(this.$q.resolve(mockData));

      initComponent.call(this);
      this.controller.filterList('Test12');
      this.$timeout.flush();
      expect(this.controller.gridData.length).toBe(1);
    });
  });

  describe('export telephony Domains list', () => {
    it('should show notification when export TD list successfully', function() {
      initComponent.call(this);
      let mockData = this.preData.common;

      mockData.content.data.body = this.telephonyDomains;
      this.TelephonyDomainService.telephonyDomainsExportCSV.and.returnValue(this.$q.resolve(mockData));
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
});
