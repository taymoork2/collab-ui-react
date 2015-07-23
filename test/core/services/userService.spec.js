'use strict';

describe('User Service', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var $httpBackend, Config, Userservice;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _Userservice_, _Config_) {
    $httpBackend = _$httpBackend_;
    Userservice = _Userservice_;
    Config = _Config_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('deactivateUser should send DELETE request to specific organization', function () {
    var user = {
      email: 'testUser'
    };
    $httpBackend.expectDELETE(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/user?email=' + user.email).respond(204);
    Userservice.deactivateUser(user);
    $httpBackend.flush();
  });

});
