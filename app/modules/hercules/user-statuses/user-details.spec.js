'use strict';

describe('Service: UserDetails', function () {
  beforeEach(angular.mock.module('Hercules'));

  var UserDetails, $httpBackend;

  describe('merge user details based on uss state and response from ci user info', function () {
    beforeEach(inject(function (_UserDetails_, _$httpBackend_) {
      UserDetails = _UserDetails_;
      $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('when uss user entitled is true', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"';
      $httpBackend
        .when('GET', request)
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com'
          }]
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'whatever'
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse)
        .then(function (userDetails) {
          expect(userDetails[0][0]).toBe('sparkuser1@gmail.com');
          expect(userDetails[0][2]).toBe('whatever');
        });
      $httpBackend.flush();
    });

    it('when uss reports error for a user', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"';
      $httpBackend
        .when('GET', request)
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com'
          }]
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'error',
        description: {
          key: '987',
          defaultMessage: 'The request failed. The SMTP address has no mailbox associated with it.'
        }
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse)
        .then(function (userDetails) {
          expect(userDetails[0][0]).toBe('sparkuser1@gmail.com');
          expect(userDetails[0][2]).toBe('error');
          expect(userDetails[0][3]).toBe('The request failed. The SMTP address has no mailbox associated with it.');
        });
      $httpBackend.flush();
    });

    it('when ci user NOT found', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"';
      $httpBackend
        .when('GET', request)
        .respond({
          Resources: []
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'whatever'
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse)
        .then(function (userDetails) {
          expect(userDetails[0][0]).toBe('Not found');
          expect(userDetails[0][2]).toBe('whatever');
        });
      $httpBackend.flush();
    });

    it('fetching multiple users from CI in one request', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" or id eq "222"';
      $httpBackend
        .when('GET', request)
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com'
          }, {
            id: '222',
            userName: 'sparkuser2@gmail.com'
          }]
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: false,
        state: 'whatever'
      }, {
        userId: '222',
        entitled: true,
        state: 'whenever'
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse)
        .then(function (userDetails) {
          expect(userDetails[0][0]).toBe('sparkuser1@gmail.com');
          expect(userDetails[0][2]).toBe('whatever');
          expect(userDetails[1][0]).toBe('sparkuser2@gmail.com');
          expect(userDetails[1][2]).toBe('whenever');
        });
      $httpBackend.flush();
    });
  });

  it('creates a CI user API compatible filter string based on multiple userids', function () {
    inject(function (_UserDetails_) {
      UserDetails = _UserDetails_;
    });
    var usersIds = ['1111', '2222', '3333'];
    var filter = UserDetails.multipleUserFilter(usersIds);
    expect(filter).toEqual('id eq "1111" or id eq "2222" or id eq "3333"');
  });

  it('creates a user url', function () {
    var url = UserDetails.userUrl('5632-f806-org', ['1234']);
    expect(url).toEqual('https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "1234"');
  });
});
