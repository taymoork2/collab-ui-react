import testModule from './index';

describe('MultiDirSyncSettingService - ', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'MultiDirSyncSettingService',
      'UrlConfig',
    );

    this.fixture = getJSONFixture('core/json/settings/multiDirsync.json');
    this.baseURL = `${this.UrlConfig.getAdminServiceUrl()}organization/${this.Authinfo.getOrgId()}/dirsync/`;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('getDomains should return all domains or a single domain depending on if a domainName is passed in', function () {
    this.$httpBackend.expectGET(`${this.baseURL}configurations/domains`).respond(200, { directorySyncResponseBeans: [ this.fixture.dirsyncRow ] });

    this.MultiDirSyncSettingService.getDomains().then((results) => {
      expect(results.data.directorySyncResponseBeans).toEqual([this.fixture.dirsyncRow]);
    });
    this.$httpBackend.flush();
  });

  it('deleteConnector should call delete on a connector', function () {
    this.$httpBackend.expectDELETE(`${this.baseURL}connector?name=connectorName`).respond(200);
    this.MultiDirSyncSettingService.deleteConnector('connectorName');
    this.$httpBackend.flush();
  });

  it('deactivateDomain should call delete on all domains when domain name is not specified', function () {
    this.$httpBackend.expectPATCH(`${this.baseURL}mode?enabled=false`).respond(200);
    this.MultiDirSyncSettingService.deactivateDomain();
    this.$httpBackend.flush();
  });

  it('deactivateDomain should call delete on only one domain when domain name is specified', function () {
    this.$httpBackend.expectPATCH(`${this.baseURL}mode/domains/domainName?enabled=false`).respond(200);
    this.MultiDirSyncSettingService.deactivateDomain('domainName');
    this.$httpBackend.flush();
  });
});
