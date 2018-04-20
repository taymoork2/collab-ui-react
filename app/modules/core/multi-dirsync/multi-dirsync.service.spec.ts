import testModule from './index';

describe('MultiDirSyncService - ', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'ModalService',
      'MultiDirSyncService',
      'Orgservice',
      'UrlConfig',
    );

    spyOn(this.Authinfo, 'isAdmin').and.returnValue(true);
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
      expect(results).toEqual([this.fixture.dirsyncRow]);
      expect(this.MultiDirSyncService.isRefreshed).toBe(true);
      expect(this.MultiDirSyncService.isEnabled).toBe(true);
    });
    this.$httpBackend.flush();
  });

  describe('isDirsyncEnabled', function () {
    it('should return true only when there are enabled domains', function () {
      spyOn(this.MultiDirSyncService, 'getDomains').and.returnValue(this.$q.resolve({
        data: {
          directorySyncResponseBeans: [
            this.fixture.dirsyncRow,
            this.fixture.dirsyncRowDisabled,
          ],
        },
      }));
      this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
        expect(results).toBe(true);
        this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
          // should not make the API call the second time
          expect(results).toBe(true);
          expect(this.MultiDirSyncService.getDomains).toHaveBeenCalledTimes(1);
        });
      });
    });

    it('should return false when there are no enabled domains', function () {
      spyOn(this.MultiDirSyncService, 'getDomains').and.returnValue(this.$q.resolve({ data: { directorySyncResponseBeans: [] } }));
      this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
        expect(results).toBe(false);
      });
    });

    it('should return false when API call is rejected', function () {
      spyOn(this.MultiDirSyncService, 'getDomains').and.returnValue(this.$q.reject({ status: 500 }));
      this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
        expect(results).toBe(false);
        this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
          // should not make the API call the second time
          expect(results).toBe(false);
          expect(this.MultiDirSyncService.getDomains).toHaveBeenCalledTimes(1);
        });
      });
    });

    it('should fail over to the Orgservice call when user is not full admin/readonly admin', function () {
      this.Authinfo.isAdmin.and.returnValue(false);
      spyOn(this.Orgservice, 'getOrg').and.returnValue(this.$q.resolve({
        data: {
          dirsyncEnabled: true,
        },
      }));

      this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
        expect(results).toBe(true);
        this.MultiDirSyncService.isDirsyncEnabled().then((results) => {
          // should not make the API call the second time
          expect(results).toBe(true);
          expect(this.Orgservice.getOrg).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  it('deactivateConnectorsModal should call delete on a connector', function () {
    this.$httpBackend.expectDELETE(`${this.baseURL}connector?name=connectorName`).respond(200);
    this.MultiDirSyncService.deactivateConnectorsModal('connectorName');
    this.$httpBackend.flush();
    expect(this.MultiDirSyncService.isRefreshed).toBe(false);
  });

  it('deleteAllDomainsModal should call delete on all domains', function () {
    this.$httpBackend.expectPATCH(`${this.baseURL}mode?enabled=false`).respond(200);
    this.MultiDirSyncService.deleteAllDomainsModal();
    this.$httpBackend.flush();
    expect(this.MultiDirSyncService.isRefreshed).toBe(false);
  });

  it('deleteDomainModal should call delete on only one domain', function () {
    this.$httpBackend.expectPATCH(`${this.baseURL}mode/domains/domainName?enabled=false`).respond(200);
    this.MultiDirSyncService.deleteDomainModal('domainName');
    this.$httpBackend.flush();
    expect(this.MultiDirSyncService.isRefreshed).toBe(false);
  });
});
