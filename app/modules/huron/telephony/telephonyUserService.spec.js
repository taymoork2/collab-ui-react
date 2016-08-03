'use strict';

describe('Service: HuronUser', function () {
  beforeEach(angular.mock.module('Huron'));

  var $httpBackend, HuronConfig, HuronUser;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
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
        'firstName': '',
        'lastName': ''
      }).respond(200);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userUuid + '/directorynumbers').respond(200);
      HuronUser.update(userUuid, userData);
      $httpBackend.flush();
    });

    it('should update firstName, lastName', function () {
      userData.name = {
        givenName: 'myFirstName',
        familyName: 'myLastName'
      };

      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/' + Authinfo.getOrgId() + '/users/' + userUuid, {
        'firstName': userData.name.givenName,
        'lastName': userData.name.familyName
      }).respond(200);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userUuid + '/directorynumbers').respond(200);
      HuronUser.update(userUuid, userData);
      $httpBackend.flush();
    });
  });

  describe('add user', function () {
    var userUuid, userData;
    beforeEach(function () {
      userUuid = '123';
      userData = {
        'email': 'test@gmail.com'
      };
    });

    it('should default to empty firstName, lastName', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users', {
        'uuid': userUuid,
        'userName': userData.email
      }).respond(201);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userUuid + '/directorynumbers').respond(200);
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/identity/users/otp').respond(201);
      $httpBackend.expectPOST(HuronConfig.getEmailUrl() + '/email/userwelcome').respond(201);
      HuronUser.create(userUuid, userData);
      $httpBackend.flush();
    });

    it('should update firstName, lastName', function () {
      userData.name = {
        givenName: 'myFirstName',
        familyName: 'myLastName'
      };

      $httpBackend.expectPOST(HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users', {
        'uuid': userUuid,
        'userName': userData.email,
        'firstName': userData.name.givenName,
        'lastName': userData.name.familyName
      }).respond(201);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/' + userUuid + '/directorynumbers').respond(200);
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/identity/users/otp').respond(201);
      $httpBackend.expectPOST(HuronConfig.getEmailUrl() + '/email/userwelcome').respond(201);
      HuronUser.create(userUuid, userData);
      $httpBackend.flush();
    });
  });

});
