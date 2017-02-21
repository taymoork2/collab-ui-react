'use strict';

describe('User List Service', function () {
  var testData, needsHttpFlush;

  beforeEach(function () {
    // modules
    this.initModules(
      'Core'
    );

    // dependencies
    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$q',
      'Authinfo',
      'UrlConfig',
      'UserListService'
    );

    // spies
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    // closured vars
    testData = _.clone(getJSONFixture('core/json/users/userlist.service.json'));

    // most specs in this suite currently (as of 2017-02-08) need http flush, so default to true
    needsHttpFlush = true;
  });

  afterEach(function () {
    if (needsHttpFlush) {
      this.$httpBackend.flush();
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    }
    testData = undefined;
    needsHttpFlush = undefined;
  });

  describe('listUsers():', function () {
    it('should successfully return an array of 2 users from calling listUsers', function () {
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) +
        '?' + '&' + testData.listUsers.attributes +
        '&' + testData.listUsers.filter +
        '&count=' + testData.listUsers.count +
        '&sortBy=' + testData.listUsers.sortBy +
        '&sortOrder=' + testData.listUsers.sortOrder;

      this.$httpBackend.expectGET(listUsersUrl).respond(200, {
        TotalResults: '2',
        itemsPerPage: '2',
        startIndex: '1',
        schemas: testData.listUsers.schemas,
        Resources: testData.listUsers.users,
        success: true,
      });

      this.UserListService.listUsers(testData.listUsers.startIndex, testData.listUsers.count,
        testData.listUsers.sortBy, testData.listUsers.sortOrder,
        function (data, status) {
          expect(status).toBe(200);
          expect(data.TotalResults).toBe('2');
          expect(data.itemsPerPage).toBe('2');
          expect(data.startIndex).toBe('1');
          expect(data.schemas).toEqual(testData.listUsers.schemas);
          expect(data.Resources).toEqual(testData.listUsers.users);
          expect(data.success).toBe(true);
        }, '');
    });

    it('should include entitlements in query when specified', function () {
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '?filter=active%20eq%20true%20and%20entitlements%20eq%20%22everything%22%20and%20(userName%20sw%20%22test%22%20or%20name.givenName%20sw%20%22test%22%20or%20name.familyName%20sw%20%22test%22%20or%20displayName%20sw%20%22test%22)&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID,userSettings&count=10';

      this.$httpBackend.expectGET(listUsersUrl).respond(200, {
        TotalResults: '2',
        itemsPerPage: '2',
        startIndex: '1',
        schemas: testData.listUsers.schemas,
        Resources: testData.listUsers.users,
        success: true,
      });

      this.UserListService.listUsers(0, 10,
        null, null,
        function (data, status) {
          expect(status).toBe(200);
          expect(data.TotalResults).toBe('2');
          expect(data.itemsPerPage).toBe('2');
          expect(data.startIndex).toBe('1');
          expect(data.schemas).toEqual(testData.listUsers.schemas);
          expect(data.Resources).toEqual(testData.listUsers.users);
          expect(data.success).toBe(true);
        }, 'test', false, 'everything');
    });

    it('should leave out entitlements in query when not specified', function () {
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '?filter=active%20eq%20true%20and%20(userName%20sw%20%22test%22%20or%20name.givenName%20sw%20%22test%22%20or%20name.familyName%20sw%20%22test%22%20or%20displayName%20sw%20%22test%22)&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID,userSettings&count=10';

      this.$httpBackend.expectGET(listUsersUrl).respond(200, {
        TotalResults: '2',
        itemsPerPage: '2',
        startIndex: '1',
        schemas: testData.listUsers.schemas,
        Resources: testData.listUsers.users,
        success: true,
      });

      this.UserListService.listUsers(0, 10,
        null, null,
        function (data, status) {
          expect(status).toBe(200);
          expect(data.TotalResults).toBe('2');
          expect(data.itemsPerPage).toBe('2');
          expect(data.startIndex).toBe('1');
          expect(data.schemas).toEqual(testData.listUsers.schemas);
          expect(data.Resources).toEqual(testData.listUsers.users);
          expect(data.success).toBe(true);
        }, 'test', false);
    });

    it('should include entitlements in query when specified without search filter', function () {
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '?filter=active%20eq%20true%20and%20entitlements%20eq%20%22everything%22&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID,userSettings&count=10';

      this.$httpBackend.expectGET(listUsersUrl).respond(200, {
        TotalResults: '2',
        itemsPerPage: '2',
        startIndex: '1',
        schemas: testData.listUsers.schemas,
        Resources: testData.listUsers.users,
        success: true,
      });

      this.UserListService.listUsers(0, 10,
        null, null,
        function (data, status) {
          expect(status).toBe(200);
          expect(data.TotalResults).toBe('2');
          expect(data.itemsPerPage).toBe('2');
          expect(data.startIndex).toBe('1');
          expect(data.schemas).toEqual(testData.listUsers.schemas);
          expect(data.Resources).toEqual(testData.listUsers.users);
          expect(data.success).toBe(true);
        }, '', false, 'everything');
    });
  });

  describe('generateUserReports():', function () {
    it('should successfully return the user reports ID from calling generateUserReports', function () {
      var generateUserReportsUrl = this.UrlConfig.getUserReportsUrl(this.Authinfo.getOrgId());

      this.$httpBackend.expectPOST(generateUserReportsUrl).respond(202, {
        id: testData.exportCSV.id,
        status: 'pending',
      });

      this.UserListService.generateUserReports('userName', function (data, status) {
        expect(status).toBe(202);
        expect(data.status).toBe('pending');
        expect(data.id).toBe(testData.exportCSV.id);
      });
    });
  });

  describe('getUserReportsUrl():', function () {
    it('should successfully return the user reports data from calling getUserReports', function () {
      var userReportsUrl = this.UrlConfig.getUserReportsUrl(this.Authinfo.getOrgId()) + '/' + testData.exportCSV.id;

      this.$httpBackend.expectGET(userReportsUrl).respond(200, {
        report: testData.exportCSV.report,
        id: testData.exportCSV.id,
        status: 'success',
      });

      this.$httpBackend.expectDELETE(userReportsUrl).respond(204);

      this.UserListService.getUserReports(testData.exportCSV.id, function (data, status) {
        expect(status).toBe(200);
        expect(data.status).toBe('success');
        expect(data.id).toBe(testData.exportCSV.id);
        expect(data.report).toBe(testData.exportCSV.report);
      });
    });
  });

  describe('extractUsers():', function () {
    it('should successfully return an array of 2 users from calling extractUsers', function () {
      needsHttpFlush = false;
      var userReports = this.UserListService.extractUsers(testData.exportCSV.report,
        testData.exportCSV.filter);

      expect(userReports).toEqual(testData.exportCSV.users);
    });
  });

  describe('exportCSV():', function () {
    it('should successfully return an array of 2 users with headers from calling exportCSV', function () {
      var generateUserReportsUrl = this.UrlConfig.getUserReportsUrl(this.Authinfo.getOrgId());
      var getUserReportsUrl = generateUserReportsUrl + '/' + testData.exportCSV.id;

      this.$httpBackend.expectPOST(generateUserReportsUrl).respond(202, {
        id: testData.exportCSV.id,
        status: 'pending',
      });

      this.$httpBackend.expectGET(getUserReportsUrl).respond(200, {
        report: testData.exportCSV.report,
        id: testData.exportCSV.id,
        status: 'success',
      });

      this.$httpBackend.expectDELETE(getUserReportsUrl).respond(204);

      var promise = this.UserListService.exportCSV(testData.exportCSV.filter);

      promise.then(function (users) {
        expect(users).toEqual(testData.exportCSV.usersToExport);
      });
    });
  });

  describe('getUserCount():', function () {
    var userCountUrl;

    beforeEach(function () {
      // TODO: redo how 'getUserCount' uses 'userCountResource' resource to get its url
      userCountUrl = this.UrlConfig.getAdminServiceUrl() + 'organization/' + null + '/reports/detailed/activeUsers?&intervalCount=7&intervalType=day&spanCount=1&spanType=day';
    });

    afterEach(function () {
      userCountUrl = undefined;
    });

    it('should successfully return user count', function () {
      this.$httpBackend.expectGET(userCountUrl).respond(200, {
        data: [{
          data: [{
            details: {
              activeUsers: '0',
              totalRegisteredUsers: '2',
            },
          }],
        }],
      });

      this.UserListService.getUserCount()
        .then(function (count) {
          expect(count).toEqual(2);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
    });

    it('should return -1 for empty response', function () {
      this.$httpBackend.expectGET(userCountUrl).respond(200, {
      });

      this.UserListService.getUserCount()
        .then(function (count) {
          expect(count).toEqual(-1);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
    });

    it('should return 0 when no users in response data', function () {
      this.$httpBackend.expectGET(userCountUrl).respond(200, {
        data: [{
          data: [
            { details: { totalRegisteredUsers: '0' } }, { details: { totalRegisteredUsers: '0' } }, { details: { totalRegisteredUsers: '0' } },
            { details: { totalRegisteredUsers: '0' } }, { details: { totalRegisteredUsers: '0' } }, { details: { totalRegisteredUsers: '0' } },
            { details: { totalRegisteredUsers: '0' } }],
        }],
      });

      this.UserListService.getUserCount()
        .then(function (count) {
          expect(count).toEqual(0);
        })
        .catch(function () {
          expect('reject called').toBeFalsy();
        });
    });

    it('should reject promise when error occurs', function () {
      this.$httpBackend.expectGET(userCountUrl).respond(503, 'error occurred');

      var catchCalled = false;
      this.UserListService.getUserCount()
        .then(function () {
          expect('resolve called').toBeFalsy();
        })
        .catch(function (response) {
          expect(response.status).toEqual(503);
          catchCalled = true;
        })
        .finally(function () {
          expect(catchCalled).toBeTruthy();
        });
    });
  });

  describe('listPartners():', function () {
    it('should successfully return an array of 2 partners from calling listPartners', function () {
      var orgId = this.Authinfo.getOrgId();
      var adminUrl = this.UrlConfig.getAdminServiceUrl() +
        'organization/' + orgId + '/users/partneradmins';

      this.$httpBackend.expectGET(adminUrl).respond(200, {
        partners: testData.listPartners.partners,
        status: true,
      });

      this.UserListService.listPartners(orgId, function (data, status) {
        expect(status).toBe(200);
        expect(data.status).toBe(true);
        expect(data.partners).toEqual(testData.listPartners.partners);
      });
    });
  });
});
