'use strict';

describe('Service: Schedule Upgrade', function () {
  beforeEach(module('Core'));

  var $httpBackend, $rootScope, ScheduleUpgradeService, Authinfo;

  beforeEach(function () {
    module(function ($provide) {
      Authinfo = {
        getOrgId: function () {
          return '12345';
        }
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function (_$httpBackend_, _$rootScope_, _UserListService_, _Config_, _Authinfo_) {
    $httpBackend = _$httpBackend_;
    Authinfo = _Authinfo_;
    $rootScope = _$rootScope_;
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // soon…
});
