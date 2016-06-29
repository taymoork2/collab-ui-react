'use strict';

describe('User List Service', function () {
  beforeEach(angular.mock.module('Core'));

  var $httpBackend, $rootScope, UserListService, Authinfo, Config, UrlConfig;

  var testData;

  beforeEach(function () {
    angular.mock.module(function ($provide) {
      Authinfo = {
        getOrgId: function () {
          return '12345';
        }
      };

      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function (_$httpBackend_, _$rootScope_, _UserListService_, _Config_, _Authinfo_, _UrlConfig_) {
    $httpBackend = _$httpBackend_;
    UserListService = _UserListService_;
    UrlConfig = _UrlConfig_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    $rootScope = _$rootScope_;

    testData = getJSONFixture('core/json/users/userlist.service.json');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully return an array of 2 users from calling listUsers', function () {
    var listUsersUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) +
      '?' + '&' + testData.listUsers.attributes +
      '&' + testData.listUsers.filter +
      '&count=' + testData.listUsers.count +
      '&sortBy=' + testData.listUsers.sortBy +
      '&sortOrder=' + testData.listUsers.sortOrder;

    $httpBackend.whenGET(listUsersUrl).respond(200, {
      TotalResults: "2",
      itemsPerPage: "2",
      startIndex: "1",
      schemas: testData.listUsers.schemas,
      Resources: testData.listUsers.users,
      success: true
    });

    UserListService.listUsers(testData.listUsers.startIndex, testData.listUsers.count,
      testData.listUsers.sortBy, testData.listUsers.sortOrder,
      function (data, status, searchStr) {
        expect(status).toBe(200);
        expect(data.TotalResults).toBe('2');
        expect(data.itemsPerPage).toBe('2');
        expect(data.startIndex).toBe('1');
        expect(data.schemas).toEqual(testData.listUsers.schemas);
        expect(data.Resources).toEqual(testData.listUsers.users);
        expect(data.success).toBe(true);
      }, '');

    $httpBackend.flush();
  });

  it('should successfully return the user reports ID from calling generateUserReports', function () {
    var generateUserReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId());

    $httpBackend.whenPOST(generateUserReportsUrl).respond(202, {
      id: testData.exportCSV.id,
      status: 'pending'
    });

    UserListService.generateUserReports('userName', function (data, status) {
      expect(status).toBe(202);
      expect(data.status).toBe('pending');
      expect(data.id).toBe(testData.exportCSV.id);
    });

    $httpBackend.flush();
  });

  it('should successfully return the user reports data from calling getUserReports', function () {
    var userReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId()) + '/' + testData.exportCSV.id;

    $httpBackend.whenGET(userReportsUrl).respond(200, {
      report: testData.exportCSV.report,
      id: testData.exportCSV.id,
      status: 'success'
    });

    $httpBackend.whenDELETE(userReportsUrl).respond(204);

    UserListService.getUserReports(testData.exportCSV.id, function (data, status) {
      expect(status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.id).toBe(testData.exportCSV.id);
      expect(data.report).toBe(testData.exportCSV.report);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 2 users from calling extractUsers', function () {
    var userReports = UserListService.extractUsers(testData.exportCSV.report,
      testData.exportCSV.filter);

    expect(userReports).toEqual(testData.exportCSV.users);
  });

  it('should successfully return an array of 2 users with headers from calling exportCSV', function () {
    var generateUserReportsUrl = UrlConfig.getUserReportsUrl(Authinfo.getOrgId());
    var getUserReportsUrl = generateUserReportsUrl + '/' + testData.exportCSV.id;

    $httpBackend.whenPOST(generateUserReportsUrl).respond(202, {
      id: testData.exportCSV.id,
      status: 'pending'
    });

    $httpBackend.whenGET(getUserReportsUrl).respond(200, {
      report: testData.exportCSV.report,
      id: testData.exportCSV.id,
      status: 'success'
    });

    $httpBackend.whenDELETE(getUserReportsUrl).respond(204);

    var promise = UserListService.exportCSV(testData.exportCSV.filter);

    promise.then(function (users) {
      expect(users).toEqual(testData.exportCSV.usersToExport);
    });

    $httpBackend.flush();
  });

  it('should successfully return user count 2 from calling getUserCount', function () {
    var userCountUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/reports/detailed/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day';
    $httpBackend.whenGET(userCountUrl).respond(200, {
      data: [{
        data: [{
          details: {
            totalRegisteredUsers: 2
          }
        }]
      }]
    });

    UserListService.getUserCount().then(function (count) {
      expect(count).toEqual(2);
    });

    $httpBackend.flush();
  });

  it('should successfully return an array of 2 partners from calling listPartners', function () {
    var orgId = Authinfo.getOrgId();
    var adminUrl = UrlConfig.getAdminServiceUrl() +
      'organization/' + orgId + '/users/partneradmins';

    $httpBackend.whenGET(adminUrl).respond(200, {
      partners: testData.listPartners.partners,
      status: true
    });

    UserListService.listPartners(orgId, function (data, status) {
      expect(status).toBe(200);
      expect(data.status).toBe(true);
      expect(data.partners).toEqual(testData.listPartners.partners);
    });

    $httpBackend.flush();
  });

});
