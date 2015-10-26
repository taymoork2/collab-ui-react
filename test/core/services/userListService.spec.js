'use strict';

describe('User List Service', function () {
  beforeEach(module('Core'));

  var $httpBackend, $rootScope, UserListService, Authinfo, Config;

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
    UserListService = _UserListService_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    $rootScope = _$rootScope_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully return an array of 2 users from calling listUsers', function () {

    var attributes = 'attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID';
    var filter = 'filter=active%20eq%20true%20or%20displayName%20sw%20%22xz%22';
    var startIndex = 0;
    var count = 100;
    var sortBy = 'name';
    var sortOrder = 'ascending';
    var listUsersUrl = Config.getScimUrl(Authinfo.getOrgId()) +
      '?' + '&' + attributes +
      '&' + filter +
      '&count=' + count + '&sortBy=' + sortBy + '&sortOrder=' + sortOrder;

    var users = [{
      "userName": "sq-testpaiduser@atlas.test.com",
      "name": {
        "givenName": "SQ",
        "familyName": "Doe"
      },
      "entitlements": ["squared-room-moderation", "squared-call-initiation", "webex-squared", "squared-syncup"],
      "id": "e068f40b-c6e2-4051-af50-95bef3f0ea67",
      "meta": {
        "created": "2015-04-13T22:00:56.496Z",
        "lastModified": "2015-10-24T16:10:06.672Z",
        "version": "23882928410",
        "lastServiceAccessTime": [{
          "type": "webexsquare",
          "value": "2015-10-19T20:40:04.079Z"
        }],
        "location": "https://identity.webex.com/identity/scim/c054027f-c5bd-4598-8cd8-07c08163e8cd/v1/Users/e068f40b-c6e2-4051-af50-95bef3f0ea67",
        "organizationID": "c054027f-c5bd-4598-8cd8-07c08163e8cd"
      },
      "displayName": "John Doe j8l5fd4p0",
      "active": true,
      "avatarSyncEnabled": false
    }, {
      "userName": "atlaspartneradmin@atlas.test.com",
      "name": {
        "givenName": "Jackson",
        "familyName": "Smith"
      },
      "entitlements": ["squared-call-initiation", "webex-squared"],
      "id": "17256dc8-db74-41b5-8a7c-e20e4f594a0a",
      "meta": {
        "created": "2014-10-20T22:40:57.142Z",
        "lastModified": "2015-10-24T16:21:14.676Z",
        "version": "210856469650",
        "lastServiceAccessTime": [{
          "type": "webexsquare",
          "value": "2015-10-24T01:09:15.539Z"
        }, {
          "type": "ciscouc",
          "value": "2015-07-27T18:24:18.039Z"
        }, {
          "type": "FusionConnectorManagement",
          "value": "2015-09-17T16:54:58.455Z"
        }, {
          "type": "squared-fusion-uss",
          "value": "2015-10-20T21:15:01.643Z"
        }],
        "location": "https://identity.webex.com/identity/scim/c054027f-c5bd-4598-8cd8-07c08163e8cd/v1/Users/17256dc8-db74-41b5-8a7c-e20e4f594a0a",
        "organizationID": "c054027f-c5bd-4598-8cd8-07c08163e8cd"
      },
      "displayName": "Partner Administrator",
      "roles": ["id_full_admin"],
      "active": true,
      "avatarSyncEnabled": false
    }];
    var schemas = ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"];

    $httpBackend.whenGET(listUsersUrl).respond(200, {
      TotalResults: "2",
      itemsPerPage: "2",
      startIndex: "1",
      schemas: schemas,
      Resources: users,
      success: true
    });

    UserListService.listUsers(startIndex, count, sortBy, sortOrder, function (data, status, searchStr) {
      expect(status).toBe(200);
      expect(data.TotalResults).toBe('2');
      expect(data.itemsPerPage).toBe('2');
      expect(data.startIndex).toBe('1');
      expect(data.schemas).toEqual(schemas);
      expect(data.Resources).toEqual(users);
      expect(data.success).toBe(true);
    }, '');

    $httpBackend.flush();
  });

  it('should successfully return the user reports ID from calling generateUserReports', function () {
    var userReportsID = '54321';
    var generateUserReportsUrl = Config.getConfigUrl(Authinfo.getOrgId());

    $httpBackend.whenPOST(generateUserReportsUrl).respond(202, {
      id: userReportsID,
      status: 'pending'
    });

    UserListService.generateUserReports('userName', function (data, status) {
      expect(status).toBe(202);
      expect(data.status).toBe('pending');
      expect(data.id).toBe(userReportsID);
    });

    $httpBackend.flush();
  });

  it('should successfully return the user reports data from calling getUserReports', function () {
    var userReportsID = '54321';
    var generateUserReportsUrl = Config.getConfigUrl(Authinfo.getOrgId());
    var getUserReportsUrl = generateUserReportsUrl + '/' + userReportsID;
    var userReportsData = 'H4sIAAAAAAAAAM1UTU/cMBD9KyhnHNmOnTg+FfXjgETVavdUtEKOMwGLxFliZ2GF+t9rh90t7ALbQ6X2FGU8bzxv5vldPiZO30CnXCIvk3Gw0mnTyU1M6n4ASVKcnB6ewYMH60xvpTZO9yG363prarDe+PWEWgSYg+Gr6iCRifKtcks1eAuDqjtjP0yR1IPzaUCHS+yU+ZhcmxXYDexc6VvX23DaqM6060141hl/k/w8Tab7WujCdyLh7kY1QI20altkrPFGeTPh76GCB7Q5j82ZOhQiBeV5rQWqq4IhRiqOhCo0AoqBNbxkCqsA7sCr2JoeQHmIQIoJQwQjiueUSoYlL1LC6I+QHGj5i742jdlm8piJ8znJJctlRlPBeMxcwRBnGPvghRBlVlKa802JGQwro+FMa3BubiLvy8fEr5dxABObJzKxjmpHeH4Vn1MiKZNUpCQrf4RJ7ZDTvka9j8IFosWciIgiIsV7qC9jbPRjby1o3w8XyqrraeoHdUpEikiUM8lFyjh/UWe7n2aqh0bnjhQoSxIKLMKqa+OWrdoq4NuTlE7OopaM84MKbYVaQ9/CpARTXzVj215NYov7VtoHYSXSDyOEv5Xyapitrf5sVdXGTTWqdRB7/SePIoYP30SMzrzyY+gmWYKtjb1ONtptgnCbAhMEdUEQK3WJlCYCsargTVWxOgP9lnbDnFkY9ZxiSXOJecqpeEu7u8wslyRPhWB72mUZF4KK8JSSgz0dp7jdyzT++Bvkaf2W9OWO9eI/WZq7Q7H7pTL164Re87HZ930L+9TDewY29H2Hur4ObrkxsD+1tt+ZLgxqXO68DnAuGoYrpHOgiGFOkGo4RiWvoMkaDCov3tULyaLX4eB1ecrK/LjX8aisktCXeqHB5nDwOsbzv2B14aagzOAVWVrkr3vFeX9jT8K8T+7JrVvly4fnsjtiB4tf53Vw9CUHAAA=';

    $httpBackend.whenGET(getUserReportsUrl).respond(200, {
      report: userReportsData,
      id: userReportsID,
      status: 'success'
    });

    UserListService.getUserReports(userReportsID, function (data, status) {
      expect(status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.id).toBe(userReportsID);
      expect(data.report).toBe(userReportsData);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 2 users from calling extractUsers', function () {
    var userReportsData = 'H4sIAAAAAAAAAM1UTU/cMBD9KyhnHNmOnTg+FfXjgETVavdUtEKOMwGLxFliZ2GF+t9rh90t7ALbQ6X2FGU8bzxv5vldPiZO30CnXCIvk3Gw0mnTyU1M6n4ASVKcnB6ewYMH60xvpTZO9yG363prarDe+PWEWgSYg+Gr6iCRifKtcks1eAuDqjtjP0yR1IPzaUCHS+yU+ZhcmxXYDexc6VvX23DaqM6060141hl/k/w8Tab7WujCdyLh7kY1QI20altkrPFGeTPh76GCB7Q5j82ZOhQiBeV5rQWqq4IhRiqOhCo0AoqBNbxkCqsA7sCr2JoeQHmIQIoJQwQjiueUSoYlL1LC6I+QHGj5i742jdlm8piJ8znJJctlRlPBeMxcwRBnGPvghRBlVlKa802JGQwro+FMa3BubiLvy8fEr5dxABObJzKxjmpHeH4Vn1MiKZNUpCQrf4RJ7ZDTvka9j8IFosWciIgiIsV7qC9jbPRjby1o3w8XyqrraeoHdUpEikiUM8lFyjh/UWe7n2aqh0bnjhQoSxIKLMKqa+OWrdoq4NuTlE7OopaM84MKbYVaQ9/CpARTXzVj215NYov7VtoHYSXSDyOEv5Xyapitrf5sVdXGTTWqdRB7/SePIoYP30SMzrzyY+gmWYKtjb1ONtptgnCbAhMEdUEQK3WJlCYCsargTVWxOgP9lnbDnFkY9ZxiSXOJecqpeEu7u8wslyRPhWB72mUZF4KK8JSSgz0dp7jdyzT++Bvkaf2W9OWO9eI/WZq7Q7H7pTL164Re87HZ930L+9TDewY29H2Hur4ObrkxsD+1tt+ZLgxqXO68DnAuGoYrpHOgiGFOkGo4RiWvoMkaDCov3tULyaLX4eB1ecrK/LjX8aisktCXeqHB5nDwOsbzv2B14aagzOAVWVrkr3vFeX9jT8K8T+7JrVvly4fnsjtiB4tf53Vw9CUHAAA=';
    var expectedUserReports = [{
      "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
      "userName": "atlaspartneradmin@atlas.test.com",
      "name": {
        "givenName": "Jackson",
        "familyName": "Smith"
      },
      "entitlements": ["squared-call-initiation", "webex-squared"],
      "id": "17256dc8-db74-41b5-8a7c-e20e4f594a0a",
      "meta": {
        "created": "2014-10-20T22:40:57.142Z",
        "lastModified": "2015-10-06T16:46:32.845Z",
        "version": "157889392265",
        "lastServiceAccessTime": [{
          "type": "webexsquare",
          "value": "2015-10-05T21:24:28.139Z"
        }, {
          "type": "ciscouc",
          "value": "2015-07-27T18:24:18.039Z"
        }, {
          "type": "FusionConnectorManagement",
          "value": "2015-09-17T16:54:58.455Z"
        }, {
          "type": "squared-fusion-uss",
          "value": "2015-09-17T16:54:58.991Z"
        }]
      },
      "displayName": "Partner Administrator",
      "roles": ["id_full_admin"],
      "active": true,
      "avatarSyncEnabled": false
    }, {
      "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
      "userName": "sq-testpaiduser@atlas.test.com",
      "name": {
        "givenName": "SQ",
        "familyName": "Doe"
      },
      "entitlements": ["squared-room-moderation", "squared-call-initiation", "webex-squared", "squared-syncup"],
      "id": "e068f40b-c6e2-4051-af50-95bef3f0ea67",
      "meta": {
        "created": "2015-04-13T22:00:56.496Z",
        "lastModified": "2015-10-06T16:45:05.912Z",
        "version": "23920939456",
        "lastServiceAccessTime": [{
          "type": "webexsquare",
          "value": "2015-10-06T10:34:53.761Z"
        }]
      },
      "displayName": "John Doe w1ksv6pxm",
      "active": true,
      "avatarSyncEnabled": false
    }];
    var entitlementFilter = '';

    var userReports = UserListService.extractUsers(userReportsData, entitlementFilter);

    expect(userReports).toEqual(expectedUserReports);
  });

  it('should successfully return an array of 2 users from calling exportCSV', function () {
    var userReportsID = '54321';
    var userReportsData = 'H4sIAAAAAAAAAM1UTU/cMBD9KyhnHNmOnTg+FfXjgETVavdUtEKOMwGLxFliZ2GF+t9rh90t7ALbQ6X2FGU8bzxv5vldPiZO30CnXCIvk3Gw0mnTyU1M6n4ASVKcnB6ewYMH60xvpTZO9yG363prarDe+PWEWgSYg+Gr6iCRifKtcks1eAuDqjtjP0yR1IPzaUCHS+yU+ZhcmxXYDexc6VvX23DaqM6060141hl/k/w8Tab7WujCdyLh7kY1QI20altkrPFGeTPh76GCB7Q5j82ZOhQiBeV5rQWqq4IhRiqOhCo0AoqBNbxkCqsA7sCr2JoeQHmIQIoJQwQjiueUSoYlL1LC6I+QHGj5i742jdlm8piJ8znJJctlRlPBeMxcwRBnGPvghRBlVlKa802JGQwro+FMa3BubiLvy8fEr5dxABObJzKxjmpHeH4Vn1MiKZNUpCQrf4RJ7ZDTvka9j8IFosWciIgiIsV7qC9jbPRjby1o3w8XyqrraeoHdUpEikiUM8lFyjh/UWe7n2aqh0bnjhQoSxIKLMKqa+OWrdoq4NuTlE7OopaM84MKbYVaQ9/CpARTXzVj215NYov7VtoHYSXSDyOEv5Xyapitrf5sVdXGTTWqdRB7/SePIoYP30SMzrzyY+gmWYKtjb1ONtptgnCbAhMEdUEQK3WJlCYCsargTVWxOgP9lnbDnFkY9ZxiSXOJecqpeEu7u8wslyRPhWB72mUZF4KK8JSSgz0dp7jdyzT++Bvkaf2W9OWO9eI/WZq7Q7H7pTL164Re87HZ930L+9TDewY29H2Hur4ObrkxsD+1tt+ZLgxqXO68DnAuGoYrpHOgiGFOkGo4RiWvoMkaDCov3tULyaLX4eB1ecrK/LjX8aisktCXeqHB5nDwOsbzv2B14aagzOAVWVrkr3vFeX9jT8K8T+7JrVvly4fnsjtiB4tf53Vw9CUHAAA=';
    var generateUserReportsUrl = Config.getConfigUrl(Authinfo.getOrgId());
    var getUserReportsUrl = generateUserReportsUrl + '/' + userReportsID;
    var expectedUsers = [{
      "userName": "atlaspartneradmin@atlas.test.com",
      "name": "Jackson Smith",
      "entitlements": "squared-call-initiation webex-squared "
    }, {
      "userName": "sq-testpaiduser@atlas.test.com",
      "name": "SQ Doe",
      "entitlements": "squared-room-moderation squared-call-initiation webex-squared squared-syncup "
    }];
    var activeFilter = '';

    $httpBackend.whenPOST(generateUserReportsUrl).respond(202, {
      id: userReportsID,
      status: 'pending'
    });

    $httpBackend.whenGET(getUserReportsUrl).respond(200, {
      report: userReportsData,
      id: userReportsID,
      status: 'success'
    });

    var promise = UserListService.exportCSV(activeFilter);

    promise.then(function (users) {
      expect(users).toEqual(expectedUsers);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 2 partners from calling listPartners', function () {
    var orgId = Authinfo.getOrgId();
    var adminUrl = Config.getAdminServiceUrl() + 'organization/' + orgId + '/users/partneradmins';
    var partners = ["testParnter1", "testPartner2"];

    $httpBackend.whenGET(adminUrl).respond(200, {
      partners: partners,
      status: true
    });

    UserListService.listPartners(orgId, function (data, status) {
      expect(status).toBe(200);
      expect(data.status).toBe(true);
      expect(data.partners).toEqual(partners);
    });

    $httpBackend.flush();
  });

});
