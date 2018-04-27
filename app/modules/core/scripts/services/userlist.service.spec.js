'use strict';

describe('User List Service', function () {
  var testData, needsHttpFlush;

  beforeEach(function () {
    // modules
    this.initModules(
      require('./userlist.service')
    );

    // dependencies
    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$q',
      '$rootScope',
      'Authinfo',
      'UrlConfig',
      'UserListService'
    );

    // spies
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.$rootScope, '$emit');

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
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '?filter=active%20eq%20true%20and%20entitlements%20eq%20%22everything%22%20and%20(userName%20sw%20%22test%22%20or%20name.givenName%20sw%20%22test%22%20or%20name.familyName%20sw%20%22test%22%20or%20displayName%20sw%20%22test%22)&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences&count=10';

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
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '?filter=active%20eq%20true%20and%20(userName%20sw%20%22test%22%20or%20name.givenName%20sw%20%22test%22%20or%20name.familyName%20sw%20%22test%22%20or%20displayName%20sw%20%22test%22)&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences&count=10';

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
      var listUsersUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '?filter=active%20eq%20true%20and%20entitlements%20eq%20%22everything%22&attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences&count=10';

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
      var _this = this;
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
        expect(_this.$rootScope.$emit).toHaveBeenCalledWith('IDLE_TIMEOUT_KEEP_ALIVE'); //keep from logging out
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

  describe('helpers:', function () {
    beforeEach(function () {
      needsHttpFlush = false;
    });

    describe('mkAttrEqValsExpr():', function () {
      it('should return undefined if either "attrName" or "matchVals" args is false-y', function () {
        var mkAttrEqValsExpr = this.UserListService._helpers.mkAttrEqValsExpr;
        expect(mkAttrEqValsExpr(undefined, 'fake-val')).toBe(undefined);
        expect(mkAttrEqValsExpr(false, 'fake-val')).toBe(undefined);
        expect(mkAttrEqValsExpr(null, 'fake-val')).toBe(undefined);
        expect(mkAttrEqValsExpr('', 'fake-val')).toBe(undefined);
        expect(mkAttrEqValsExpr('fake-attr-name', undefined)).toBe(undefined);
        expect(mkAttrEqValsExpr('fake-attr-name', false)).toBe(undefined);
        expect(mkAttrEqValsExpr('fake-attr-name', null)).toBe(undefined);
        expect(mkAttrEqValsExpr('fake-attr-name', '')).toBe(undefined);
      });

      it('should return a CI query expression mapping "attrName" to "matchVals" values using "eq"', function () {
        var mkAttrEqValsExpr = this.UserListService._helpers.mkAttrEqValsExpr;
        expect(mkAttrEqValsExpr('color', 'blue')).toBe('(color eq "blue")');
        expect(mkAttrEqValsExpr('color', ['blue'])).toBe('(color eq "blue")');
        expect(mkAttrEqValsExpr('color', ['red', 'blue'])).toBe('(color eq "red" and color eq "blue")');
        expect(mkAttrEqValsExpr('color', ['red', 'green', 'blue'])).toBe('(color eq "red" and color eq "green" and color eq "blue")');
      });

      it('should return a CI query expression mapping "attrName" to all "matchVals" values using a given boolean operator', function () {
        var mkAttrEqValsExpr = this.UserListService._helpers.mkAttrEqValsExpr;
        expect(mkAttrEqValsExpr('color', ['red', 'blue'], 'or')).toBe('(color eq "red" or color eq "blue")');
        expect(mkAttrEqValsExpr('color', ['red', 'green', 'blue'], 'or')).toBe('(color eq "red" or color eq "green" or color eq "blue")');
      });
    });

    describe('mkAttrsFilterExpr():', function () {
      it('should return undefined if either "attrNames" or "searchStr" args is false-y', function () {
        var mkAttrsFilterExpr = this.UserListService._helpers.mkAttrsFilterExpr;
        expect(mkAttrsFilterExpr(undefined, 'fake-val')).toBe(undefined);
        expect(mkAttrsFilterExpr(false, 'fake-val')).toBe(undefined);
        expect(mkAttrsFilterExpr(null, 'fake-val')).toBe(undefined);
        expect(mkAttrsFilterExpr('', 'fake-val')).toBe(undefined);
        expect(mkAttrsFilterExpr('fake-attr-name', undefined)).toBe(undefined);
        expect(mkAttrsFilterExpr('fake-attr-name', false)).toBe(undefined);
        expect(mkAttrsFilterExpr('fake-attr-name', null)).toBe(undefined);
        expect(mkAttrsFilterExpr('fake-attr-name', '')).toBe(undefined);
      });

      it('should return a CI query expression mapping "attrNames" values to "searchStr" using "sw"', function () {
        var mkAttrsFilterExpr = this.UserListService._helpers.mkAttrsFilterExpr;
        expect(mkAttrsFilterExpr('nickName', 'ba')).toBe('(nickName sw "ba")');
        expect(mkAttrsFilterExpr(['nickName'], 'ba')).toBe('(nickName sw "ba")');
        expect(mkAttrsFilterExpr(['nickName', 'userName'], 'ba')).toBe('(nickName sw "ba" or userName sw "ba")');
      });

      it('should return a CI query expression mapping "attrName" to all "matchVals" values using "filterOp"', function () {
        var mkAttrsFilterExpr = this.UserListService._helpers.mkAttrsFilterExpr;
        var filterOp = 'ew';
        expect(mkAttrsFilterExpr(['nickName', 'userName'], 'ba', filterOp)).toBe('(nickName ew "ba" or userName ew "ba")');
      });

      it('should return a CI query expression mapping "attrName" to all "matchVals" values using "booleanOp"', function () {
        var mkAttrsFilterExpr = this.UserListService._helpers.mkAttrsFilterExpr;
        var booleanOp = 'and';
        expect(mkAttrsFilterExpr(['nickName', 'userName'], 'ba', undefined, booleanOp)).toBe('(nickName sw "ba" and userName sw "ba")');
      });
    });

    describe('mkAttrsSwValExpr():', function () {
      it('calls through to mkAttrsFilterExpr() with prepopulated value for "filterOp" and "booleanOp"', function () {
        var mkAttrsSwValExpr = this.UserListService._helpers.mkAttrsSwValExpr;
        var mkAttrsFilterExpr = spyOn(this.UserListService._helpers, 'mkAttrsFilterExpr');
        mkAttrsSwValExpr(['a', 'b'], 'c');
        expect(mkAttrsFilterExpr).toHaveBeenCalledWith(['a', 'b'], 'c', 'sw', 'or');
      });
    });

    describe('mkEntitlementsExpr():', function () {
      it('calls through to mkAttrEqValsExpr() with prepopulated value for "attrName"', function () {
        var mkEntitlementsExpr = this.UserListService._helpers.mkEntitlementsExpr;
        var mkAttrEqValsExpr = spyOn(this.UserListService._helpers, 'mkAttrEqValsExpr');
        mkEntitlementsExpr(['fake-entitlement-1']);
        expect(mkAttrEqValsExpr).toHaveBeenCalledWith('entitlements', ['fake-entitlement-1']);
      });
    });

    describe('mkRolesExpr():', function () {
      it('calls through to mkAttrEqValsExpr() with prepopulated value for "attrName"', function () {
        var mkRolesExpr = this.UserListService._helpers.mkRolesExpr;
        var mkAttrEqValsExpr = spyOn(this.UserListService._helpers, 'mkAttrEqValsExpr');
        mkRolesExpr(['fake-role-1']);
        expect(mkAttrEqValsExpr).toHaveBeenCalledWith('roles', ['fake-role-1']);
      });
    });

    describe('mkNameStartsWithExpr():', function () {
      it('calls through to mkAttrsSwValExpr() with prepopulated value for "attrNames"', function () {
        var mkNameStartsWithExpr = this.UserListService._helpers.mkNameStartsWithExpr;
        var mkAttrsSwValExpr = spyOn(this.UserListService._helpers, 'mkAttrsSwValExpr');
        mkNameStartsWithExpr('fake-search-str');
        expect(mkAttrsSwValExpr).toHaveBeenCalledWith(
          ['userName', 'name.givenName', 'name.familyName', 'displayName'], 'fake-search-str');
      });
    });

    describe('mkFilterExpr():', function () {
      var mkFilterExpr;

      beforeEach(function () {
        mkFilterExpr = this.UserListService._helpers.mkFilterExpr;
      });

      afterEach(function () {
        mkFilterExpr = undefined;
      });

      it('should return a default expression if no valid "filterParams" passed', function () {
        expect(mkFilterExpr()).toBe('active eq true');
        expect(mkFilterExpr({})).toBe('active eq true');
      });

      it('should return an expression with the work-around hack if "filterParams.useUnboundedResultsHack" is truthy', function () {
        expect(mkFilterExpr({
          useUnboundedResultsHack: true,
        })).toBe('active eq true or displayName sw "xz"');

        expect(mkFilterExpr({
          useUnboundedResultsHack: false,
        })).toBe('active eq true');
      });

      it('should return an expression searching various name attributes if "filterParams.nameStartsWith" is at least 2 chars', function () {
        expect(mkFilterExpr({
          useUnboundedResultsHack: true,
          nameStartsWith: 'ab',
        })).toBe('active eq true and (userName sw "ab" or name.givenName sw "ab" or name.familyName sw "ab" or displayName sw "ab")');
      });

      it('should return an expression still using the work-around hack if "filterParams.nameStartsWith" is <2 chars', function () {
        expect(mkFilterExpr({
          useUnboundedResultsHack: true,
          nameStartsWith: 'a',
        })).toBe('active eq true or displayName sw "xz"');
      });

      it('should return an expression searching roles if "filterParams.allRoles" is passed', function () {
        expect(mkFilterExpr({
          allRoles: 'fake-role-1',
        })).toBe('active eq true and (roles eq "fake-role-1")');

        expect(mkFilterExpr({
          allRoles: ['fake-role-1'],
        })).toBe('active eq true and (roles eq "fake-role-1")');

        expect(mkFilterExpr({
          allRoles: ['fake-role-1', 'fake-role-2'],
        })).toBe('active eq true and (roles eq "fake-role-1" and roles eq "fake-role-2")');
      });

      it('should return an expression searching entitlements if "filterParams.allEntitlements" is passed', function () {
        expect(mkFilterExpr({
          allEntitlements: 'fake-entitlement-1',
        })).toBe('active eq true and (entitlements eq "fake-entitlement-1")');

        expect(mkFilterExpr({
          allEntitlements: ['fake-entitlement-1'],
        })).toBe('active eq true and (entitlements eq "fake-entitlement-1")');

        expect(mkFilterExpr({
          allEntitlements: ['fake-entitlement-1', 'fake-entitlement-2'],
        })).toBe('active eq true and (entitlements eq "fake-entitlement-1" and entitlements eq "fake-entitlement-2")');
      });

      it('should return an expression stacking clauses if any of "filterParams.nameStartsWith", ' +
          '"filterParams.allRoles", "filterParams.allEntitlements" is passed', function () {
        var expectedResult = [
          'active eq true',
          '(userName sw "ab" or name.givenName sw "ab" or name.familyName sw "ab" or displayName sw "ab")',
          '(roles eq "fake-role-1")',
        ].join(' and ');

        expect(mkFilterExpr({
          nameStartsWith: 'ab',
          allRoles: 'fake-role-1',
        })).toBe(expectedResult);

        expectedResult = [
          'active eq true',
          '(userName sw "ab" or name.givenName sw "ab" or name.familyName sw "ab" or displayName sw "ab")',
          '(roles eq "fake-role-1")',
          '(entitlements eq "fake-entitlement-1")',
        ].join(' and ');

        expect(mkFilterExpr({
          nameStartsWith: 'ab',
          allRoles: 'fake-role-1',
          allEntitlements: 'fake-entitlement-1',
        })).toBe(expectedResult);
      });
    });
  });

  describe('listUsersAsPromise():', function () {
    it('should make a GET to CI using current org id if "params.orgId" not present', function () {
      this.$httpBackend.expectGET(/\/identity\/scim\/12345\/v1\/Users\?/).respond(200);
      this.UserListService.listUsersAsPromise({});
    });

    it('should make a GET to CI using "params.orgId" if present', function () {
      var fakeOrgId = 98765;
      this.$httpBackend.expectGET(/\/identity\/scim\/98765\/v1\/Users\?/).respond(200);
      this.UserListService.listUsersAsPromise({ orgId: fakeOrgId });
    });

    it('should return a catch call if it responds with a 403', function () {
      this.$httpBackend.expectGET(/\/identity\/scim\/12345\/v1\/Users/).respond(403);

      this.UserListService.listUsersAsPromise()
        .then(fail)
        .catch(function (response) {
          expect(response.status).toBe(403);
        });
    });

    it('calls through to mkFilterExpr() with "params.filter" property', function () {
      needsHttpFlush = false;
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve());
      spyOn(this.UserListService._helpers, 'mkFilterExpr');
      var params = {
        filter: {
          nameStartsWith: 'ab',
        },
      };
      this.UserListService.listUsersAsPromise(params);
      expect(this.UserListService._helpers.mkFilterExpr).toHaveBeenCalledWith(params.filter);
    });

    it('calls $http.get() with a params object containing a "filter" property (set by mkFilterExpr()), and an "attributes" property (static value)', function () {
      needsHttpFlush = false;
      spyOn(this.$http, 'get').and.returnValue(this.$q.resolve());
      var params = {
        filter: {
          nameStartsWith: 'ab',
        },
      };
      var expectedUrl = this.UrlConfig.getScimUrl(this.Authinfo.getOrgId());
      var expectedFilter = this.UserListService._helpers.mkFilterExpr(params.filter);
      var expectedAttrs = 'name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,linkedTrainSiteNames,licenseID,userSettings,userPreferences';
      var expectedGetParams = {
        params: {
          filter: expectedFilter,
          attributes: expectedAttrs,
        },
      };
      this.UserListService.listUsersAsPromise(params);
      expect(this.$http.get).toHaveBeenCalledWith(expectedUrl, expectedGetParams);
    });
  });

  describe('listNonAdminUsers():', function () {
    it('calls through to listUsersAsPromise() with a params object containing "filter.nameStartsWith" and ' +
        '"filter.useUnboundedResultsHack" properties set', function () {
      needsHttpFlush = false;
      spyOn(this.UserListService, 'listUsersAsPromise');
      this.UserListService.listNonAdminUsers({}, 'foo');
      expect(this.UserListService.listUsersAsPromise).toHaveBeenCalledWith({
        filter: {
          nameStartsWith: 'foo',
          useUnboundedResultsHack: true,
        },
      });

      // other properties are also passed through
      this.UserListService.listNonAdminUsers({
        filter: {
          entitlements: 'fake-entitlement-1',
        },
      }, 'foo');
      expect(this.UserListService.listUsersAsPromise).toHaveBeenCalledWith({
        filter: {
          entitlements: 'fake-entitlement-1',
          nameStartsWith: 'foo',
          useUnboundedResultsHack: true,
        },
      });
    });
  });

  describe('listFullAdminUsers():', function () {
    it('calls through to listUsersAsPromise() with a params object containing "filter.nameStartsWith" and ' +
        '"filter.allRoles" properties set', function () {
      needsHttpFlush = false;
      spyOn(this.UserListService, 'listUsersAsPromise');
      this.UserListService.listFullAdminUsers({}, 'foo');
      expect(this.UserListService.listUsersAsPromise).toHaveBeenCalledWith({
        filter: {
          nameStartsWith: 'foo',
          allRoles: 'id_full_admin',
        },
      });

      // other properties are also passed through
      this.UserListService.listFullAdminUsers({
        filter: {
          entitlements: 'fake-entitlement-1',
        },
      }, 'foo');
      expect(this.UserListService.listUsersAsPromise).toHaveBeenCalledWith({
        filter: {
          entitlements: 'fake-entitlement-1',
          nameStartsWith: 'foo',
          allRoles: 'id_full_admin',
        },
      });
    });
  });
});
