'use strict';

var moduleName = require('./index').default;

describe('Service: UserDetails', function () {
  beforeEach(angular.mock.module(moduleName));

  var UserDetails, $httpBackend, progress;

  describe('merge user details based on uss state and response from ci user info', function () {
    beforeEach(inject(function (_UserDetails_, _$httpBackend_) {
      UserDetails = _UserDetails_;
      $httpBackend = _$httpBackend_;
      progress = { total: 0, current: 0 };
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    function expectUserRow(userRow, user, type, cluster, status, details, id, service) {
      expect(userRow[0]).toBe(user);
      expect(userRow[1]).toBe(type);
      expect(userRow[2]).toBe(cluster);
      expect(userRow[3]).toBe('hercules.activationStatus.' + status);
      expect(userRow[4]).toBe(details);
      expect(userRow[5]).toBe(id);
      expect(userRow[6]).toBe('hercules.hybridServiceNames.' + service);
    }

    function expectUserRowWithResourceGroup(userRow, user, type, cluster, status, details, id, service, resourceGroupName) {
      expect(userRow[0]).toBe(user);
      expect(userRow[1]).toBe(type);
      expect(userRow[2]).toBe(cluster);
      expect(userRow[3]).toBe(resourceGroupName);
      expect(userRow[4]).toBe('hercules.activationStatus.' + status);
      expect(userRow[5]).toBe(details);
      expect(userRow[6]).toBe(id);
      expect(userRow[7]).toBe('hercules.hybridServiceNames.' + service);
    }

    it('when uss user is entitled and activated', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com',
          }],
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'activated',
        serviceId: 'squared-fusion-cal',
        connector: { hostname: 'cool.cisco.com' },
        cluster: { name: 'Tom is Awesome Cluster' },
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expectUserRow(userRows[0], 'sparkuser1@gmail.com', 'common.user', 'Tom is Awesome Cluster (cool.cisco.com)', 'activated', '', '111', 'squared-fusion-cal');
          expect(progress.current).toEqual(1);
        });
      $httpBackend.flush();
    });

    it('when there are no user statuses returned (stale UI)', function () {
      var simulatedResponse = [];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expect(userRows.length).toEqual(0);
        });
    });

    it('also shows the status description in the Activated state', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com',
          }],
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'activated',
        serviceId: 'squared-fusion-cal',
        connector: { hostname: 'cool.cisco.com' },
        cluster: { name: 'Tom is Awesome Cluster' },
        messages: [{
          key: 'tull',
          severity: 'error',
          description: 'WebEx is not configured',
        }],
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expectUserRow(userRows[0], 'sparkuser1@gmail.com', 'common.user', 'Tom is Awesome Cluster (cool.cisco.com)', 'activated', 'common.error: WebEx is not configured', '111', 'squared-fusion-cal');
        });
      $httpBackend.flush();
    });

    it('when uss reports error for a user', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com',
          }],
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'error',
        serviceId: 'squared-fusion-cal',
        messages: [{
          key: '987',
          severity: 'warning',
          description: 'The request failed. The SMTP address has no mailbox associated with it.',
        }],
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expectUserRow(userRows[0], 'sparkuser1@gmail.com', 'common.user', '', 'error',
            'common.warning: The request failed. The SMTP address has no mailbox associated with it.', '111', 'squared-fusion-cal');
        });
      $httpBackend.flush();
    });

    it('when a user is NOT found, check if it is a machine account', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" or id eq "222" or id eq "333"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'balleklorin@gmail.com',
          }],
        });
      $httpBackend
        .when('GET', 'https://identity.webex.com/organization/5632-f806-org/v1/Machines?filter=id eq "222" or id eq "333"')
        .respond({
          data: [{
            id: '222', name: 'machine1', displayName: 'Cloudberry Device', machineType: 'lyra_space',
          }],
        });
      var simulatedResponse = [{
        userId: '111', // User
        entitled: true,
        serviceId: 'squared-fusion-cal',
        state: 'activated',
      }, {
        userId: '222', // Machine account
        entitled: true,
        serviceId: 'squared-fusion-cal',
        state: 'error',
      }, {
        userId: '333', // Unknown (not found)
        entitled: true,
        serviceId: 'squared-fusion-cal',
        state: 'error',
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expectUserRow(userRows[0], 'balleklorin@gmail.com', 'common.user', '', 'activated', '', '111', 'squared-fusion-cal');
          expectUserRow(userRows[1], 'Cloudberry Device', 'machineTypes.lyra_space', '', 'error', '', '222', 'squared-fusion-cal');
          expectUserRow(userRows[2], 'hercules.export.userNotFound', '', '', 'error', '', '333', 'squared-fusion-cal');
          expect(progress.current).toEqual(3);
        });
      $httpBackend.flush();
    });

    it('populates the cluster column correctly when Office 365', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com',
          }],
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'activated',
        owned: 'ccc',
        serviceId: 'squared-fusion-o365',
        messages: [],
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expectUserRow(userRows[0], 'sparkuser1@gmail.com', 'common.user', 'common.ciscoCollaborationCloud', 'activated',
            '', '111', 'squared-fusion-o365');
        });
      $httpBackend.flush();
    });

    it('include the resource group column', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" or id eq "222"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com',
          },
          {
            id: '222',
            userName: 'sparkuser2@gmail.com',
          }],
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: true,
        state: 'activated',
        serviceId: 'squared-fusion-cal',
        connector: { hostname: 'cool.cisco.com' },
        cluster: { name: 'Tom is Awesome Cluster' },
        resourceGroup: { name: 'ResourceGroupA' },
      },
      {
        userId: '222',
        entitled: true,
        state: 'activated',
        serviceId: 'squared-fusion-cal',
        connector: { hostname: 'cool.cisco.com' },
        cluster: { name: 'Tom is Awesome Cluster' },
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress, true)
        .then(function (userRows) {
          expectUserRowWithResourceGroup(userRows[0], 'sparkuser1@gmail.com', 'common.user', 'Tom is Awesome Cluster (cool.cisco.com)', 'activated', '', '111', 'squared-fusion-cal', 'ResourceGroupA');
          expectUserRowWithResourceGroup(userRows[1], 'sparkuser2@gmail.com', 'common.user', 'Tom is Awesome Cluster (cool.cisco.com)', 'activated', '', '222', 'squared-fusion-cal', '');
          expect(progress.current).toEqual(2);
        });
      $httpBackend.flush();
    });

    it('fetching multiple users from CI in one request', function () {
      $httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/5632-f806-org/v1/Users?filter=id eq "111" or id eq "222"')
        .respond({
          Resources: [{
            id: '111',
            userName: 'sparkuser1@gmail.com',
          }, {
            id: '222',
            userName: 'sparkuser2@gmail.com',
          }],
        });
      var simulatedResponse = [{
        userId: '111',
        entitled: false,
        state: 'pendingActivation',
        serviceId: 'squared-fusion-cal',
      }, {
        userId: '222',
        entitled: true,
        state: 'activated',
        serviceId: 'squared-fusion-cal',
      }];
      UserDetails.getUsers('5632-f806-org', simulatedResponse, progress)
        .then(function (userRows) {
          expectUserRow(userRows[0], 'sparkuser1@gmail.com', 'common.user', '', 'not_entitled', '', '111', 'squared-fusion-cal');
          expectUserRow(userRows[1], 'sparkuser2@gmail.com', 'common.user', '', 'activated', '', '222', 'squared-fusion-cal');
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
