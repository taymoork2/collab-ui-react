(function () {
  'use strict';

  describe('Service: SyncService', function () {
    var service, $httpBackend, authinfo, urlconfig;

    beforeEach(function () {
      angular.mock.module('Messenger');

      angular.mock.module(function ($provide) {
        authinfo = {
          getOrgId: sinon.stub(),
        };
        authinfo.getOrgId.returns("12345");

        urlconfig = {
          getMessengerServiceUrl: sinon.stub(),
        };
        urlconfig.getMessengerServiceUrl.returns("foo");

        $provide.value('Authinfo', authinfo);
        $provide.value('UrlConfig', urlconfig);
      });

      inject(function (_SyncService_, _$httpBackend_) {
        service = _SyncService_;
        $httpBackend = _$httpBackend_;
        service.getSyncStatus();
      });
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('check defaults after getSyncStatus()', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: true, ciSyncMode: 'foo' });
      $httpBackend.flush();

      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(true);

      expect(service.getNewDataFormat()).toEqual(false);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(true);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(true);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(true);
      expect(service.getNewDirSyncFlag()).toEqual(false);
    });

    it('check Messenger Sync mode', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: true, ciSyncMode: 'foo' });
      $httpBackend.flush();

      service.setMessengerSyncMode(true);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(true);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(true);

      service.setMessengerSyncMode(false);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(true);
    });

    it('check DirSync mode', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: true, ciSyncMode: 'foo' });
      $httpBackend.flush();

      service.setDirSyncMode(true);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(true);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(false);

      service.setDirSyncMode(false);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(false);
    });

    it('check old data format parsing', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: true, ciSyncMode: 'enabled' });
      $httpBackend.flush();

      expect(service.getSimplifiedStatus().isAuthRedirect).toEqual(true);
      expect(service.getNewDataFormat()).toEqual(false);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(true);

      service.parseSyncMode('enabled_nospark');
      expect(service.getNewDataFormat()).toEqual(false);

      service.parseSyncMode('disabled');
      expect(service.getNewDataFormat()).toEqual(false);
    });

    it('check new data format parsing', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: false, ciSyncMode: 'spark_to_msgr;pwd_sync=1:spark_ent=1:usr_dis=1:usr_del=1:usr_min=0' });
      $httpBackend.flush();

      expect(service.getSimplifiedStatus().isAuthRedirect).toEqual(false);
      expect(service.getNewDataFormat()).toEqual(true);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(true);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(true);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(true);
      expect(service.getNewDirSyncFlag()).toEqual(false);
    });

    it('check new data format parsing : other data non-default values', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: true, ciSyncMode: 'msgr_to_spark;pwd_sync=0:spark_ent=0:usr_dis=0:usr_min=1' });
      $httpBackend.flush();

      expect(service.getNewDataFormat()).toEqual(true);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(true);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(false);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(false);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(false);
      expect(service.getNewDirSyncFlag()).toEqual(true);
    });
    it('check new data format parsing : other data default for missing data', function () {
      $httpBackend.expectGET('foo/orgs/12345/cisync/').respond({ orgName: 'prod', authRedirect: true, ciSyncMode: 'disabled;pwd_sync=1:spark_ent=1' });
      $httpBackend.flush();

      expect(service.getNewDataFormat()).toEqual(true);
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(true);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(true);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(true);
      expect(service.getNewDirSyncFlag()).toEqual(false);
    });
  });
})();
