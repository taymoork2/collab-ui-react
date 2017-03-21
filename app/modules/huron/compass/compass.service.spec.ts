describe('Service: HuronCompassService', () => {
  beforeEach(function () {
    this.initModules('huron.compass-service');
    this.injectDependencies(
      '$httpBackend',
      'UrlConfig',
      'HuronCompassService',
    );

    spyOn(this.HuronCompassService, 'fetchDomain').and.callThrough();

    this.authData = {
      orgId: 1,
    };

    this.orgInfo = {
      orgSettingsWithDomain: {
        orgSettings: [
          '{\"sparkCallBaseDomain\":\"sparkc-eu.com\"}',
        ],
      },
      orgSettingsWithOutDomain: {
        orgSettings: [
          '{\"someOtherSetting\":\"\"}',
        ],
      },
    };
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should send a request for the org info', function () {
    this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}organizations/1?disableCache=true&basicInfo=true`)
      .respond(200, this.orgInfo.orgSettingsWithDomain);
    this.HuronCompassService.fetchDomain(this.authData).then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.authData));

    });
    this.$httpBackend.flush();
  });

  it('should return the base domain from the orgSettings', function () {
    this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}organizations/1?disableCache=true&basicInfo=true`)
      .respond(200, this.orgInfo.orgSettingsWithDomain);
    this.HuronCompassService.fetchDomain(this.authData).then(() => {
      expect(this.HuronCompassService.getBaseDomain()).toBe('sparkc-eu.com');
    });
    this.$httpBackend.flush();
  });

  it('should return the default domain when missing from orgSettings', function () {
    this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}organizations/1?disableCache=true&basicInfo=true`)
      .respond(200, this.orgInfo.orgSettingsWithOutDomain);
    this.HuronCompassService.fetchDomain(this.authData).then(() => {
      expect(this.HuronCompassService.getBaseDomain()).toBe('huron-int.com');
    });
    this.$httpBackend.flush();
  });

  it('should return the default domain when the request fails', function () {
    this.$httpBackend.expectGET(`${this.UrlConfig.getAdminServiceUrl()}organizations/1?disableCache=true&basicInfo=true`)
      .respond(400, null);
    this.HuronCompassService.fetchDomain(this.authData).then(() => {
      expect(this.HuronCompassService.getBaseDomain()).toBe('huron-int.com');
    });
    this.$httpBackend.flush();
  });

});
