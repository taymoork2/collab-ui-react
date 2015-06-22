'use strict';

describe('Service: UserDetails', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var UserDetails, $httpBackend;
  beforeEach(inject(function (_UserDetails_, _$httpBackend_) {
    UserDetails = _UserDetails_;
    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('merge user details based on uss state and response from ci user info', function () {

    it('when uss user entitled is true', function () {
      var request = 'https://identity.webex.com/identity/scim/null/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond({
          "Resources": [{
            "id": "111",
            "userName": "sparkuser1@gmail.com"
          }]
        });

      var callback = sinon.stub();
      var simulatedResponse = {
        "userId": "111",
        "entitled": true,
        "state": "whatever"
      };

      var users = UserDetails.getUsers(simulatedResponse, callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var data = callback.args[0][0];

      expect(data.details.id).toBe('111');
      expect(data.details.userName).toBe('sparkuser1@gmail.com');
      expect(data.details.entitled).toBe('Entitled');
      expect(data.details.state).toBe('whatever');

    });

    it('when uss user entitled is false', function () {
      var request = 'https://identity.webex.com/identity/scim/null/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond({
          "Resources": [{
            "id": "111",
            "userName": "sparkuser1@gmail.com"
          }]
        });

      var callback = sinon.stub();
      var simulatedResponse = {
        "userId": "111",
        "entitled": false,
        "state": "whatever"
      };

      var users = UserDetails.getUsers(simulatedResponse, callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var data = callback.args[0][0];

      expect(data.details.id).toBe('111');
      expect(data.details.userName).toBe('sparkuser1@gmail.com');
      expect(data.details.entitled).toBe('Not Entitled');
      expect(data.details.state).toBe('whatever');

    });

    it('when uss reports error for a user', function () {
      var request = 'https://identity.webex.com/identity/scim/null/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond(404, '');
      var callback = sinon.stub();
      var simulatedResponse = {
        "userId": "111",
        "entitled": true,
        "state": "error",
        "description": {
          "key": "987",
          "defaultMessage": "The request failed. The SMTP address has no mailbox associated with it."
        }
      };

      var users = UserDetails.getUsers(simulatedResponse, callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var data = callback.args[0][0];

      expect(data.details.id).toBe('111');
      expect(data.details.userName).toBe('username not found');
      expect(data.details.entitled).toBe('Entitled');
      expect(data.details.state).toBe('error');
      expect(data.details.message).toBe('The request failed. The SMTP address has no mailbox associated with it.');

    });

    it('when ci user NOT found', function () {
      var request = 'https://identity.webex.com/identity/scim/null/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond(404, '');
      var callback = sinon.stub();
      var simulatedResponse = {
        "userId": "111",
        "entitled": true,
        "state": "whatever"
      };

      var users = UserDetails.getUsers(simulatedResponse, callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var data = callback.args[0][0];

      expect(data.details.id).toBe('111');
      expect(data.details.userName).toBe('username not found');
      expect(data.details.entitled).toBe('Entitled');
      expect(data.details.state).toBe('whatever');
    });

  });

});
