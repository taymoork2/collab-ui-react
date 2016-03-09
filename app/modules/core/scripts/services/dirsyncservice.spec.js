'use strict';

describe('DirSyncService', function () {
  beforeEach(module('Core'));
  describe('getDirSyncStatus', function () {

    var $httpBackend, DirSyncService, UrlConfig, Authinfo, Log;

    beforeEach(function () {
      module(function ($provide) {
        UrlConfig = {
          getAdminServiceUrl: function () {
            return '/foo/';
          },
          getOauth2Url: sinon.stub()
        };
        Authinfo = {
          getOrgId: function () {
            return 'bar';
          }
        };
        Log = {
          debug: sinon.stub()
        };
        $provide.value('Log', Log);
        $provide.value('UrlConfig', UrlConfig);
        $provide.value('Authinfo', Authinfo);
      });
    });

    beforeEach(inject(function ($injector, _DirSyncService_) {
      DirSyncService = _DirSyncService_;
      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingRequest();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should set status to false when request fail', function () {
      $httpBackend
        .when(
          'GET',
          '/foo/organization/bar/dirsync/status'
        )
        .respond(500);

      var callback = sinon.stub();
      DirSyncService.getDirSyncStatus(callback);

      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.args[0][0].success).toBe(false);
    });

    it('should set status to true when request succeed', function () {
      $httpBackend
        .when(
          'GET',
          '/foo/organization/bar/dirsync/status'
        )
        .respond({
          serviceMode: 'ENABLED'
        });

      var callback = sinon.stub();
      DirSyncService.getDirSyncStatus(callback);

      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.args[0][0].success).toBe(true);
      expect(callback.args[0][0].serviceMode).toBe('ENABLED');
    });

  });
});
