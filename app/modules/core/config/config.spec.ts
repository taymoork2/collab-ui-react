describe('Config', function () {
  beforeEach(function () {
    this.initModules(require('./config').default, 'core.tabconfig');
    this.injectDependencies(
      '$location',
      '$q',
      '$window',
      'LocalStorage',
      'tabConfig',
    );

    this.blaHost = 'wbx2.com/bla';
    this.devHost = 'localhost';
    this.cfeHost = 'cfe-admin.ciscospark.com';
    this.intHost = 'int-admin.ciscospark.com';
    this.prodHost = 'admin.ciscospark.com';

    spyOn(this.$location, 'host').and.returnValue(this.blaHost);
    // Config must be injected after the $location spy is set for returnValue to take effect
    this.injectDependencies('Config');
  });

  afterEach(function () {
    this.LocalStorage.remove('TEST_ENV_CONFIG');
  });

  it('partner_sales_admin should have correct roleStates', function () {
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).toContain('partneroverview');
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).toContain('customer-overview');
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).toContain('partnercustomers');
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).toContain('partnerreports');
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).toContain('trialAdd');
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).toContain('trialEdit');
    expect(this.Config.roleStates.PARTNER_SALES_ADMIN).not.toContain('settings');
  });

  it('should not have development states assigned to Full_Admin role in non-dev mode', function () {
    const adminStates = this.Config.roleStates.Full_Admin || [];

    const developmentStates: any[] = [];
    for (let i = 0; i < this.tabConfig.length; i++) {
      const tab = this.tabConfig[i];
      if (tab && tab.tab === 'developmentTab') {
        const subPages = tab.subPages;
        for (let j = 0; j < subPages.length; j++) {
          const devTab: any = subPages[j];
          if (devTab && devTab.state) {
            developmentStates.push(devTab.state);
          }
        }
      }
    }

    for (let i = 0; i < adminStates.length; i++) {
      expect(developmentStates).not.toContain(adminStates[i]);
    }
  });

  it('should detect dev environment', function () {
    this.$location.host.and.returnValue(this.blaHost);
    expect(this.Config.isDev()).toBe(false);

    this.$location.host.and.returnValue('127.0.0.1');
    expect(this.Config.isDev()).toBe(true);

    this.$location.host.and.returnValue('0.0.0.0');
    expect(this.Config.isDev()).toBe(true);

    this.$location.host.and.returnValue(this.devHost);
    expect(this.Config.isDev()).toBe(true);

    this.$location.host.and.returnValue('10.12.32.12');
    expect(this.Config.isDev()).toBe(false);

    expect(this.Config.isDevHostName('0.0.0.0')).toBe(true);
    expect(this.Config.isDevHostName('127.0.0.1')).toBe(true);
    expect(this.Config.isDevHostName(this.devHost)).toBe(true);
    expect(this.Config.isDevHostName('server')).toBe(true);
    expect(this.Config.isDevHostName('dev-admin.ciscospark.com')).toBe(true);

    expect(this.Config.canUseAbsUrlForDevLogin('http://127.0.0.1:8000')).toBe(true);
    expect(this.Config.canUseAbsUrlForDevLogin('https://127.0.0.1:8000')).toBe(false);
    expect(this.Config.canUseAbsUrlForDevLogin('https://127.0.0.1')).toBe(false);

    expect(this.Config.canUseAbsUrlForDevLogin('http://dev-admin.ciscospark.com:8000')).toBe(true);
    expect(this.Config.canUseAbsUrlForDevLogin('https://dev-admin.ciscospark.com:8000')).toBe(false);
    expect(this.Config.canUseAbsUrlForDevLogin('http://dev-admin.ciscospark.com')).toBe(false);
  });

  it('should detect load test environment', function () {
    this.$location.host.and.returnValue(this.cfeHost);
    expect(this.Config.isCfe()).toBe(true);

    this.$location.host.and.returnValue(this.prodHost);
    expect(this.Config.isCfe()).toBe(false);
  });

  it('should detect integration environment', function () {
    this.$location.host.and.returnValue(this.intHost);
    expect(this.Config.isIntegration()).toBe(true);

    this.$location.host.and.returnValue(this.devHost);
    expect(this.Config.isIntegration()).toBe(false);
  });

  it('should detect prod environment', function () {
    this.$location.host.and.returnValue(this.intHost);
    expect(this.Config.isProd()).toBe(false);

    this.$location.host.and.returnValue(this.prodHost);
    expect(this.Config.isProd()).toBe(true);
  });

  it('should return env', function () {
    this.$location.host.and.returnValue(this.devHost);
    expect(this.Config.getEnv()).toBe('dev');

    this.$location.host.and.returnValue(this.cfeHost);
    expect(this.Config.getEnv()).toBe('cfe');

    this.$location.host.and.returnValue(this.intHost);
    expect(this.Config.getEnv()).toBe('integration');

    this.$location.host.and.returnValue(this.prodHost);
    expect(this.Config.getEnv()).toBe('prod');

    this.$location.host.and.returnValue('random-host-is-prod');
    expect(this.Config.getEnv()).toBe('prod');
  });

  describe('service states', function () {
    it('spark-room-system should contain devices state', function () {
      expect(this.Config.serviceStates['spark-room-system']).toContain('devices');
    });
  });

  describe('test env config', function () {
    it('should have a default behaviour', function () {
      expect(this.Config.isE2E()).toBe(false);
      expect(this.Config.forceProdForE2E()).toBe(false);
    });

    it('should set env to prod', function () {
      this.Config.setTestEnvConfig('e2e-prod');
      expect(this.Config.isE2E()).toBe(true);
      expect(this.Config.forceProdForE2E()).toBe(true);
    });

    it('should set env to int', function () {
      this.Config.setTestEnvConfig('e2e-int');
      expect(this.Config.isE2E()).toBe(true);
      expect(this.Config.forceProdForE2E()).toBe(false);
    });

    it('should not be nulled', function () {
      this.Config.setTestEnvConfig('e2e-int');
      this.Config.setTestEnvConfig();
      expect(this.Config.isE2E()).toBe(true);
      expect(this.Config.forceProdForE2E()).toBe(false);
    });
  });
});
