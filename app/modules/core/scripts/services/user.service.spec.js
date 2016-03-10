/* globals $httpBackend, $rootScope, Authinfo, Config, Userservice, UrlConfig */
'use strict';

describe('User Service', function () {

  beforeEach(function () {
    bard.appModule('Huron');
    bard.inject(this, '$httpBackend', '$injector', '$rootScope', 'Authinfo', 'Config', 'Userservice', 'UrlConfig');
    spyOn($rootScope, '$broadcast').and.returnValue({});
    spyOn(Authinfo, 'getOrgId').and.returnValue('abc123efg456');
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('deactivateUser should send DELETE request to specific organization', function () {
    var user = {
      email: 'testUser'
    };
    $httpBackend.expectDELETE(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/user?email=' + user.email).respond(204);
    Userservice.deactivateUser(user);
    $httpBackend.flush();
  });

  it('updateUsers should send PATCH request to update user', function () {
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
    }, {
      address: 'dntodid2@gmail.com',
      assignedDn: {
        uuid: "testUUID",
        pattern: "5002"
      },
      externalNumber: {
        uuid: "",
        pattern: "None"
      }
    }];
    $httpBackend.expectPATCH(UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users').respond(201, {
      status: 201,
      userResponse: [{
        email: "dntodid@gmail.com",
        entitled: ["ciscouc"]
      }]
    });
    Userservice.updateUsers(users);
    $httpBackend.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('Userservice::updateUsers');
  });

});
