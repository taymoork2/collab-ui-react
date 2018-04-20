'use strict';

var moduleName = require('./telephonyUserService');

describe('Service: HuronUser', function () {
  beforeEach(angular.mock.module(moduleName));

  var $httpBackend, HuronConfig, HuronUser;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _HuronUser_, _HuronConfig_) {
    $httpBackend = _$httpBackend_;
    HuronUser = _HuronUser_;
    HuronConfig = _HuronConfig_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('update user', function () {
    var userUuid, userData;
    beforeEach(function () {
      userUuid = '123';
      userData = {};
    });

    it('should default to empty firstName, lastName', function () {
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/' + Authinfo.getOrgId() + '/users/' + userUuid, {
        firstName: '',
        lastName: '',
      }).respond(200);
      HuronUser.update(userUuid, userData);
      $httpBackend.flush();
    });

    it('should update firstName, lastName', function () {
      userData.name = {
        givenName: 'myFirstName',
        familyName: 'myLastName',
      };

      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/' + Authinfo.getOrgId() + '/users/' + userUuid, {
        firstName: userData.name.givenName,
        lastName: userData.name.familyName,
      }).respond(200);
      HuronUser.update(userUuid, userData);
      $httpBackend.flush();
    });
  });
});
