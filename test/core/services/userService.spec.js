'use strict';

describe('User Service', function () {
  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  var $httpBackend, Config, Userservice, HuronConfig, rootScope;

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, $injector, _Config_, _HuronConfig_, _$rootScope_) {
    $httpBackend = _$httpBackend_;
    Userservice = $injector.get("Userservice");
    rootScope = _$rootScope_;
    spyOn(rootScope, '$broadcast').and.returnValue({});
    Config = _Config_;
    HuronConfig = _HuronConfig_;
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

  it('updateUsers should send POST request to create user', function () {
    var users = [{
      address: 'dntodid@gmail.com',
      assignedDn: {
        uuid: "testUUID",
        pattern: "5000"
      },
      externalNumber: {
        uuid: "testUUID",
        pattern: "+123423423445"
      }
    }, {
      address: 'dntodid1@gmail.com',
      assignedDn: {
        uuid: "testUUID",
        pattern: "5001"
      },
      externalNumber: {
        uuid: "testUUID",
        pattern: "+133423423445"
      }
    }];
    $httpBackend.expectPATCH(Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users').respond(201, {
      status: 201,
      userResponse: [{
        email: "dntodid@gmail.com",
        entitled: ["ciscouc"]
      }]
    });
    $httpBackend.expectPOST(HuronConfig.getCmiV2Url() + '/customers/' + Authinfo.getOrgId() + '/users').respond(201);
    $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId() + '/users/directorynumbers').respond(200);
    $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/identity/users/otp').respond(201);
    $httpBackend.expectPOST(HuronConfig.getEmailUrl() + '/email/userwelcome').respond(201);
    Userservice.updateUsers(users);
    $httpBackend.flush();
    expect(rootScope.$broadcast).toHaveBeenCalledWith('Userservice::updateUsers');
  });

});
