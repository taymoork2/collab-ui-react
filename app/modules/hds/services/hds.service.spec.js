'use strict';

describe('Service: HDSService', function () {
  var HDSService, $q, $httpBackend, UrlConfig;

  beforeEach(angular.mock.module('HDS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module(mockDependencies));
  beforeEach(inject(dependencies));
  function dependencies(_HDSService_, _$q_, _$httpBackend_, _UrlConfig_) {
    HDSService = _HDSService_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    UrlConfig = _UrlConfig_;
    UrlConfig.getScimUrl = jasmine.createSpy('getScimUrl').and.returnValue('foo/Users');
    UrlConfig.getHybridEncryptionServiceUrl = jasmine.createSpy('getHybridEncryptionServiceUrl').and.returnValue('foo');
    UrlConfig.getAdminServiceUrl = jasmine.createSpy('getAdminServiceUrl').and.returnValue('foo/');
  }

  function mockDependencies($provide) {
    var response = {
      data: {
        orgSettings: {
          kmsServer: 'kms1',
        },
      },
    };
    $provide.value('Orgservice', {
      getOrg: function () {
        return $q.resolve(response);
      },
    });
  }

  it('getOrgSettings should return org settings when successfull', function () {
    var promise = HDSService.getOrgSettings();
    promise.then(function (result) {
      expect(result.kmsServer).toEqual({ kmsServer: 'kms1' });
    });
  });

  it('should getHDSInfo use correct API', function () {
    $httpBackend.expectGET('foo/kms').respond([]);
    HDSService.getHDSInfo();
    $httpBackend.flush();
  });

  it('should deleteCIGroup use correct API', function () {
    $httpBackend.expectDELETE('foo/Groups/gid').respond(200);
    HDSService.deleteCIGroup('oid', 'gid');
    $httpBackend.flush();
  });

  it('should addHdsTrialUsers use correct API', function () {
    $httpBackend.expectPATCH('foo/Groups/null').respond(200);
    HDSService.addHdsTrialUsers('oid', 'jasonString');
    $httpBackend.flush();
  });

  it('should queryUser use correct API', function () {
    $httpBackend.expectGET('foo/Users?filter=username eq "john.doe%40foo.com"').respond(200);
    HDSService.queryUser('oid', 'john.doe@foo.com');
    $httpBackend.flush();
  });

  it('should removeHdsTrialUsers use correct API', function () {
    $httpBackend.expectPATCH('foo/Groups/null').respond(200);
    HDSService.removeHdsTrialUsers('oid', 'uids');
    $httpBackend.flush();
  });

  it('should setOrgAltHdsServersHds use correct API', function () {
    $httpBackend.expectPUT('foo/organizations/oid/settings/altHdsServers').respond(200);
    HDSService.setOrgAltHdsServersHds('oid', 'jasonString');
    $httpBackend.flush();
  });

  it('should refreshEncryptionServerForTrialUsers use correct API', function () {
    $httpBackend.expectPOST('foo/flushTrialUserGroupCache/gid').respond(200);
    HDSService.refreshEncryptionServerForTrialUsers('gid');
    $httpBackend.flush();
  });
});
