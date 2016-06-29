'use strict';

describe('Config', function () {

  beforeEach(angular.mock.module('Core'));

  var Config, $location, tabConfig, Storage;
  beforeEach(inject(function (_$location_, _Config_, _tabConfig_, _Storage_) {
    Config = _Config_;
    Storage = _Storage_;
    tabConfig = _tabConfig_;
    $location = _$location_;
    spyOn($location, 'host');
  }));

  afterEach(function () {
    Storage.put('TEST_ENV_CONFIG', '');
  });

  var devHost = 'localhost';
  var cfeHost = 'cfe-admin.ciscospark.com';
  var intHost = 'int-admin.ciscospark.com';
  var prodHost = 'admin.ciscospark.com';

  var orgId = 'abc123efg456';
  var siteURL = 'webex.com';

  it('partner_sales_admin should have correct roleStates', function () {
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('partneroverview');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('customer-overview');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('partnercustomers');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('partnerreports');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('trialAdd');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('trialEdit');
    expect(Config.roleStates.PARTNER_SALES_ADMIN).toContain('pstnSetup');
  });

  it('should not have development states assigned to Full_Admin role', function () {
    function getDevelopmentStates() {
      var devStates = [];
      for (var i = 0; i < tabConfig.length; i++) {
        var tab = tabConfig[i];
        if (tab && tab.tab === 'developmentTab') {
          var subPages = tab.subPages;
          for (var j = 0; j < subPages.length; j++) {
            var devTab = subPages[j];
            if (devTab && devTab.state) {
              devStates.push(devTab.state);
            }
          }
        }
      }
      return devStates;
    }
    var adminStates = Config.roleStates.Full_Admin || [];
    var developmentStates = getDevelopmentStates();
    for (var i = 0; i < adminStates.length; i++) {
      expect(developmentStates).not.toContain(adminStates[i]);
    }
  });

  it('should detect dev environment', function () {
    $location.host.and.returnValue('wbx2.com/bla');
    expect(Config.isDev()).toBe(false);

    $location.host.and.returnValue('127.0.0.1');
    expect(Config.isDev()).toBe(true);

    $location.host.and.returnValue('0.0.0.0');
    expect(Config.isDev()).toBe(true);

    $location.host.and.returnValue('localhost');
    expect(Config.isDev()).toBe(true);

    $location.host.and.returnValue('10.12.32.12');
    expect(Config.isDev()).toBe(false);
  });

  it('should detect load test environment', function () {
    $location.host.and.returnValue(cfeHost);
    expect(Config.isCfe()).toBe(true);

    $location.host.and.returnValue(prodHost);
    expect(Config.isCfe()).toBe(false);
  });

  it('should detect integration environment', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.isIntegration()).toBe(true);

    $location.host.and.returnValue(devHost);
    expect(Config.isIntegration()).toBe(false);
  });

  it('should detect prod environment', function () {
    $location.host.and.returnValue(intHost);
    expect(Config.isProd()).toBe(false);

    $location.host.and.returnValue(prodHost);
    expect(Config.isProd()).toBe(true);
  });

  it('should return env', function () {
    $location.host.and.returnValue(devHost);
    expect(Config.getEnv()).toBe('dev');

    $location.host.and.returnValue(cfeHost);
    expect(Config.getEnv()).toBe('cfe');

    $location.host.and.returnValue(intHost);
    expect(Config.getEnv()).toBe('integration');

    $location.host.and.returnValue(prodHost);
    expect(Config.getEnv()).toBe('prod');

    $location.host.and.returnValue('random-host-is-prod');
    expect(Config.getEnv()).toBe('prod');
  });

  describe('service states', function () {
    it('spark-room-system should contain devices state', function () {
      expect(Config.serviceStates['spark-room-system'][0]).toBe('devices');
    });
  });

  describe('test env config', function () {
    it('should have a default behaviour', function () {
      expect(Config.isE2E()).toBe(false);
      expect(Config.forceProdForE2E()).toBe(false);
    });
    it('should set env to prod', function () {
      Config.setTestEnvConfig('e2e-prod');
      expect(Config.isE2E()).toBe(true);
      expect(Config.forceProdForE2E()).toBe(true);
    });
    it('should set env to int', function () {
      Config.setTestEnvConfig('e2e-int');
      expect(Config.isE2E()).toBe(true);
      expect(Config.forceProdForE2E()).toBe(false);
    });
    it('should not be nulled', function () {
      Config.setTestEnvConfig('e2e-int');
      Config.setTestEnvConfig();
      expect(Config.isE2E()).toBe(true);
      expect(Config.forceProdForE2E()).toBe(false);
    });
  });

});
