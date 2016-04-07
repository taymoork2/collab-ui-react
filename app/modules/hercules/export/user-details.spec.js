'use strict';

describe('Service: UserDetails', function () {
  beforeEach(module('Hercules'));

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
          "Resources": [{
            "id": "111",
            "userName": "sparkuser1@gmail.com"
          }]
        });

      var callback = sinon.stub();
      var simulatedResponse = [{
        "userId": "111",
        "entitled": true,
        "state": "whatever"
      }];

      var users = UserDetails.getUsers(simulatedResponse, "5632-f806-org", callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var userDetails = callback.args[0][0];

      expect(userDetails[0].details.userName).toBe('sparkuser1@gmail.com');
      expect(userDetails[0].details.state).toBe('whatever');

    });

    it('when uss user entitled is false', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond({
          "Resources": [{
            "id": "111",
            "userName": "sparkuser1@gmail.com"
          }]
        });

      var callback = sinon.stub();
      var simulatedResponse = [{
        "userId": "111",
        "entitled": false,
        "state": "whatever"
      }];

      var users = UserDetails.getUsers(simulatedResponse, "5632-f806-org", callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var userDetails = callback.args[0][0];

      expect(userDetails[0].details.userName).toBe('sparkuser1@gmail.com');
      expect(userDetails[0].details.state).toBe('whatever');

    });

    it('when uss reports error for a user', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond({
          "Resources": [{
            "id": "111",
            "userName": "sparkuser1@gmail.com"
          }]
        });

      var callback = sinon.stub();
      var simulatedResponse = [{
        "userId": "111",
        "entitled": true,
        "state": "error",
        "description": {
          "key": "987",
          "defaultMessage": "The request failed. The SMTP address has no mailbox associated with it."
        }
      }];

      var users = UserDetails.getUsers(simulatedResponse, "5632-f806-org", callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var userDetails = callback.args[0][0];

      expect(userDetails[0].details.userName).toBe('sparkuser1@gmail.com');
      expect(userDetails[0].details.state).toBe('error');
      expect(userDetails[0].details.message).toBe('The request failed. The SMTP address has no mailbox associated with it.');

    });

    it('when ci user NOT found', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"';

      $httpBackend
        .when('GET', request)
        .respond({
          "Resources": []
        });

      var callback = sinon.stub();
      var simulatedResponse = [{
        "userId": "111",
        "entitled": true,
        "state": "whatever"
      }];

      var users = UserDetails.getUsers(simulatedResponse, "5632-f806-org", callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var userDetails = callback.args[0][0];

      expect(userDetails[0].details.userName).toBe('Not found');
      expect(userDetails[0].details.state).toBe('whatever');
    });

    it('fetching multiple users from CI in one request', function () {
      var request = 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" or id eq "222"';

      $httpBackend
        .when('GET', request)
        .respond({
          "Resources": [{
            "id": "111",
            "userName": "sparkuser1@gmail.com"
          }, {
            "id": "222",
            "userName": "sparkuser2@gmail.com"
          }]
        });

      var callback = sinon.stub();
      var simulatedResponse = [{
        "userId": "111",
        "entitled": false,
        "state": "whatever"
      }, {
        "userId": "222",
        "entitled": true,
        "state": "whenever"
      }];

      var users = UserDetails.getUsers(simulatedResponse, "5632-f806-org", callback);

      $httpBackend.flush();
      expect(callback.callCount).toBe(1);
      var userDetails = callback.args[0][0];

      expect(userDetails[0].details.userName).toBe('sparkuser1@gmail.com');
      expect(userDetails[0].details.state).toBe('whatever');

      expect(userDetails[1].details.userName).toBe('sparkuser2@gmail.com');
      expect(userDetails[1].details.state).toBe('whenever');

    });

  });

  it('creates a CI user API compatible filter string based on multiple userids', function () {

    inject(function (_UserDetails_) {
      UserDetails = _UserDetails_;
    });

    var usersIds = ["1111", "2222", "3333"];
    var filter = UserDetails.multipleUserFilter(usersIds);
    expect(filter).toEqual('id eq "1111" or id eq "2222" or id eq "3333"');
  });

  it('creates a user url', function () {
    var url = UserDetails.userUrl(["1234"], "5632-f806-org");
    expect(url).toEqual('https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "1234"');
  });

});
