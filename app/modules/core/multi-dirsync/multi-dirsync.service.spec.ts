import testModule from './index';

describe('MultiDirSyncService - ', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'ModalService',
      'MultiDirSyncService',
      'UrlConfig',
    );

    spyOn(this.ModalService, 'open').and.returnValue({
      result: this.$q.resolve(true),
    });

    this.fixture = getJSONFixture('core/json/settings/multiDirsync.json');
    this.baseURL = `${this.UrlConfig.getAdminServiceUrl()}organization/${this.Authinfo.getOrgId()}/dirsync/`;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('getDomains should return all domains or a single domain depending on if a domainName is passed in', function () {
    this.$httpBackend.expectGET(`${this.baseURL}configurations/domains`).respond(200, { directorySyncResponseBeans: [ this.fixture.dirsyncRow ] });

    this.MultiDirSyncService.getDomains().then((results) => {
      expect(results.data.directorySyncResponseBeans).toEqual([this.fixture.dirsyncRow]);
    });
    this.$httpBackend.flush();
  });

  it('getEnabledDomains should return all enabled domains', function () {
    this.$httpBackend.expectGET(`${this.baseURL}configurations/domains`).respond(200, { directorySyncResponseBeans: [
      this.fixture.dirsyncRow,
      this.fixture.dirsyncRowDisabled,
    ] });

    this.MultiDirSyncService.getEnabledDomains().then((results) => {
      expect(results.data.directorySyncResponseBeans).toEqual([this.fixture.dirsyncRow]);
    });
    this.$httpBackend.flush();
  });

  it('deactivateConnectorsModal should call delete on a connector', function () {
    this.$httpBackend.expectDELETE(`${this.baseURL}connector?name=connectorName`).respond(200);
    this.MultiDirSyncService.deactivateConnectorsModal('connectorName');
    this.$httpBackend.flush();
  });

  it('deleteAllDomainsModal should call delete on all domains', function () {
    this.$httpBackend.expectPATCH(`${this.baseURL}mode?enabled=false`).respond(200);
    this.MultiDirSyncService.deleteAllDomainsModal();
    this.$httpBackend.flush();
  });

  it('deleteDomainModal should call delete on only one domain', function () {
    this.$httpBackend.expectPATCH(`${this.baseURL}mode/domains/domainName?enabled=false`).respond(200);
    this.MultiDirSyncService.deleteDomainModal('domainName');
    this.$httpBackend.flush();
  });
});
