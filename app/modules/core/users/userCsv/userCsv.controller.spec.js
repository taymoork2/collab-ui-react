'use strict';

var userCsvServiceModule = require('./userCsv.service');
var csvDownloadModule = require('modules/core/csvDownload').default;

describe('userCsv.controller', function () {
  beforeEach(init);

  ///////////////////////////////

  function init() {
    this.initModules('Core', 'Hercules', 'Huron', 'Sunlight', 'Messenger', userCsvServiceModule, csvDownloadModule);

    this.injectDependencies('$controller', '$interval', '$modal', '$previousState', '$q', '$rootScope',
      '$scope', '$state', '$timeout', 'Analytics', 'Authinfo', 'CsvDownloadService', 'FeatureToggleService',
      'HuronCustomer', 'Notification', 'Orgservice', 'ResourceGroupService', 'UserCsvService', 'Userservice', 'USSService', 'DirSyncService');

    initFixtures.apply(this);
    initMocks.apply(this);
    initDependencySpies.apply(this);
  }

  function initDependencySpies() {
    var _this = this;
    spyOn(this.$state, 'go').and.returnValue(this.$q.resolve());
    spyOn(this.Analytics, 'trackAddUsers').and.returnValue(this.$q.resolve());
    spyOn(this.Authinfo, 'isOnline').and.returnValue(true);
    spyOn(this.Authinfo, 'isFusionUC').and.returnValue(false);
    spyOn(this.Authinfo, 'isFusionCal').and.returnValue(true);
    spyOn(this.Authinfo, 'isFusionIMP').and.returnValue(false);
    this.modalDefer = this.$q.defer();
    spyOn(this.$modal, 'open').and.returnValue({
      result: this.modalDefer.promise,
    });

    spyOn(this.DirSyncService, 'requiresRefresh').and.returnValue(false);
    spyOn(this.DirSyncService, 'refreshStatus').and.returnValue(this.$q.resolve());

    spyOn(this.CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return _this.$q.resolve(_this.headers);
      } else {
        return _this.$q.resolve({});
      }
    });

    spyOn(this.Notification, 'notify').and.callThrough();
    spyOn(this.Notification, 'error').and.callThrough();
    spyOn(this.Orgservice, 'getUnlicensedUsers').and.callThrough();

    spyOn(this.FeatureToggleService, 'getFeaturesForUser').and.returnValue(this.getMyFeatureToggles);
    spyOn(this.FeatureToggleService, 'supports').and.callFake(function () {
      return _this.$q.resolve(false);
    });
    spyOn(this.FeatureToggleService, 'atlasCsvImportTaskManagerGetStatus').and.callFake(function () {
      return _this.$q.resolve(false);
    });
    spyOn(this.FeatureToggleService, 'atlasUserCsvSubscriptionEnableGetStatus').and.callFake(function () {
      return _this.$q.resolve(true);
    });

    spyOn(this.Userservice, 'onboardUsers').and.callThrough();
    spyOn(this.Userservice, 'bulkOnboardUsers').and.returnValue(this.$q.resolve());
    spyOn(this.Userservice, 'getUser').and.returnValue(this.getUserMe);
    spyOn(this.Userservice, 'migrateUsers').and.returnValue(this.getMigrateUsers);
    spyOn(this.Userservice, 'updateUsers').and.callThrough();

    spyOn(this.$scope, '$broadcast').and.callThrough();
    spyOn(this.HuronCustomer, 'get').and.returnValue(this.$q.resolve(this.customer));
    spyOn(this.ResourceGroupService, 'getAll').and.returnValue(this.$q.resolve(this.resourceGroups.items));

    spyOn(this.USSService, 'getAllUserProps').and.returnValue(this.$q.resolve([]));
    spyOn(this.USSService, 'updateBulkUserProps').and.returnValue(this.$q.resolve());

    spyOn(this.$previousState, 'get').and.returnValue({
      state: {
        name: 'test.state',
      },
    });
    spyOn(this.$rootScope, '$emit');
  }

  function initFixtures() {
    this.getUserMe = getJSONFixture('core/json/users/me.json');
    this.getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    this.getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    this.headers = getJSONFixture('core/json/users/headers.json');
    this.customer = getJSONFixture('huron/json/settings/customer.json');
    this.resourceGroups = getJSONFixture('core/json/users/resource_groups.json');
  }

  function initMocks() {
    this.bulkOnboardUsersResponseMock = function (statusCode, additionalCodes) {
      var _this = this;
      var statusCodes = additionalCodes || [];

      return function (uploadedData) {
        _this.uploadedDataCapture = uploadedData;
        return bulkOnboardSuccessResponse.apply(_this, [uploadedData, statusCode, statusCodes]);
      };
    };

    this.bulkOnboardUsersErrorResponseMock = function (statusCode, headers, successAfterTries, successCode) {
      var _this = this;
      var triesUntilSuccess = successAfterTries || Number.MAX_VALUE;

      return function (uploadedData) {
        _this.uploadedDataCapture = uploadedData;
        if (triesUntilSuccess > 0) {
          // fail this request
          triesUntilSuccess--;
          var response = {
            status: statusCode,
            _headers: headers,
            headers: function getHeader(name) {
              return headers[name];
            },
            data: {
              userResponse: [],
            },
          };
          return _this.$q.reject(response);
        } else {
          // reached number of tries before we pretend to succeed
          return bulkOnboardSuccessResponse.apply(_this, [uploadedData, successCode]);
        }
      };
    };


    this.bulkOnboardUsersResponseUpperCaseEmailMock = function (statusCode) {
      var _this = this;
      return function (uploadedData) {
        _this.uploadedDataCapture = uploadedData;
        return bulkOnboardSuccessResponseUpperCaseEmail.apply(_this, [uploadedData, statusCode]);
      };
    };

    /**
     * Mock the response for the this.Userservice.bulkOnboardUsers function.
     * If additionalCodes object supplied, randomly assigns these codes to users up to
     * the specified number for each code.  Then uses StatusCode for the rest.
     */

    function bulkOnboardSuccessResponse(uploadedData, defaultStatusCode, statusCodes) {
      statusCodes = statusCodes || [];
      var response = {
        data: {
          userResponse: [],
        },
      };

      // set up the status codes to return
      function pickRandomStatusCode() {
        var status = defaultStatusCode;
        if (statusCodes.length > 0) {
          var idx = _.random(0, statusCodes.length - 1);
          status = statusCodes[idx].status;
          statusCodes[idx].users--;
          if (statusCodes[idx].users === 0) {
            statusCodes.splice(idx, 1);
          }
        }
        return status;
      }

      _.forEach(uploadedData, function (user) {
        var status = pickRandomStatusCode();
        response.data.userResponse.push({
          status: status,
          httpStatus: status,
          email: user.address,
          uuid: 'b345abe1-5b9d-43b2-9a89-1e4e64ad478c',
        });
      });
      return this.$q.resolve(response);
    }

    function bulkOnboardSuccessResponseUpperCaseEmail(uploadedData, defaultStatusCode) {
      this.uploadedDataCapture = uploadedData;
      var response = {
        data: {
          userResponse: [],
        },
      };

      _.forEach(uploadedData, function (user) {
        response.data.userResponse.push({
          status: defaultStatusCode,
          httpStatus: defaultStatusCode,
          email: _.toUpper(user.address),
          uuid: 'b345abe1-5b9d-43b2-9a89-1e4e64ad478c',
        });
      });
      return this.$q.resolve(response);
    }
  }

  function initController() {
    this.controller = this.$controller('UserCsvCtrl', {
      $scope: this.$scope,
      $state: this.$state,
    });

    this.$scope.$apply();
  }

  // generates a valid CSV with the specified number of users
  // 0: Headers
  // 1: user 1
  // 2: user 2
  // ...
  // <numUsers>: user <numUsers>
  function generateUsersCsv(numUsers, invalidUsers) {
    var header = ['First Name', 'Last Name', 'Display Name', 'User ID/Email (Required)', 'Directory Number', 'Direct Line', 'Calendar Service', 'Meeting 25 Party', 'Spark Call', 'Spark Message'];
    var csv = [header];
    for (var ii = 0; ii < numUsers; ii++) {
      var user = [
        'First' + ii, 'Last' + ii, 'First' + ii + ' Last' + ii, 'firstlast' + ii + '@example.com',
        5001 + ii, '',
        'true', 'true', 'true', 'true',
      ];
      if (_.includes(invalidUsers, csv.length + 1)) {
        // create an error in the CSV data for user
        if (_.random() % 2) {
          user[3] = '';
        } else {
          user[6] = 'ture';
        }
      }
      csv.push(user);
    }
    return $.csv.fromArrays(csv);
  }

  //////////////////////////////

  describe('Bulk Users CSV', function () {
    beforeEach(function () {
      this.mockCsvData = {
        oneColumnValidUser: 'User ID/Email (Required),\njohndoe@example.com,',
        oneColumnInvalidUser: 'First Name,\nJohn,',
        twoValidUsers: generateUsersCsv(2),
        oneInvalidEmailUser: 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,@example.com,5001,,true,true,true,true,true,true',
        twoInvalidUsers: 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,johndoe@example.com,5001,,TREU,true,true,true,true,true\nJane,Doe,Jane Doe,janedoe@example.com,5002,,FASLE,false,false,false',
        twoValidUsersWithSpaces: 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\n , , ,johndoe@example.com, , ,true,true,true,true\n , , ,janedoe@example.com, ,  ,f,f,f,f',
        threeUsersOneDuplicateEmail: 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nFirst0,Last0,First0 Last0,firstlast0@example.com,5001,,true,true,true,true\nFirst1,Last1,First1 Last1,firstlast1@example.com,5002,,true,true,true,true\nFirst2,Last2,First2 Last2,firstlast0@example.com,5002,,true,true,true,true',
        invalidHeaders: 'John,Doe,John Doe,johndoe@example.com,5001,12223335001,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE\nJane,Doe,Jane Doe,janedoe@example.com,,,FALSE,FALSE,FALSE,FALSE,FALSE,FALSE',
        badCsvFormat: 'fa;lskdhgqiwoep;klnandf',
        mismatchHeaderName: 'User ID/Email (Required),Meeting 2500 Party\njohn.doe@example.com,true',
        invalidCsvData: {},
        oneInvalidEmailUserTooManySparkCallLicenses: 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Spark Call,Spark Call 2\nJohn,Doe,John Doe,johndoe@example.com,5001,,true,true',
      };
      installPromiseMatchers.apply(this);
      initController.apply(this);
    });

    describe('Upload CSV', function () {
      describe('without file content', function () {
        it('should have 0 upload progress', function () {
          expect(this.controller.model.uploadProgress).toEqual(0);
        });
        it('should not go to the next step', function () {
          this.controller.csvUploadNext().catch(_.noop);
          this.$scope.$apply();
          expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvEmpty');
        });
      });
      describe('with file content', function () {
        beforeEach(function () {
          this.controller.model.file = this.mockCsvData.twoValidUsers;
          this.$scope.$apply();
          this.$timeout.flush();
        });
        it('should have 100 upload progress when the file model changes', function () {
          expect(this.controller.model.uploadProgress).toEqual(100);
        });
        it('should go to next step', function () {
          var promise = this.controller.csvUploadNext();
          this.$scope.$apply();
          expect(promise).toBeResolved();
        });
        it('should not allow to go next after resetting file', function () {
          this.controller.resetFile();
          this.$scope.$apply();
          this.$timeout.flush();
          this.controller.csvUploadNext().catch(_.noop);
          this.$scope.$apply();
          expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvEmpty');
        });
      });
      it('should notify error on file size error', function () {
        this.controller.onFileSizeError();
        this.$scope.$apply();
        expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvMaxSizeError');
      });
      it('should notify error on file type error', function () {
        this.controller.onFileTypeError();
        this.$scope.$apply();
        expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvFileTypeError');
      });

      it('should notify error missing required header', function () {
        this.controller.model.file = this.mockCsvData.invalidHeaders;
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvBadHeaders');
      });

      it('should notify error if bad CSV format', function () {
        this.controller.model.file = this.mockCsvData.badCsvFormat;
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvBadFormat');
      });

      it('should notify error if error parsing CSV data', function () {
        this.controller.model.file = this.mockCsvData.invalidCsvData;
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvBadFormat');
      });

      it('should notify error if any mismatch header name', function () {
        this.controller.model.file = this.mockCsvData.mismatchHeaderName;
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvHeaderNameMismatch', {
          name: 'Meeting 2500 Party',
        });
      });

      describe('valid one column file content', function () {
        beforeEach(function () {
          this.controller.model.file = this.mockCsvData.oneColumnValidUser;
          this.$scope.$apply();
          this.$timeout.flush();
        });
        it('should have 100 upload progress', function () {
          expect(this.controller.model.uploadProgress).toEqual(100);
        });
        it('should go to next step', function () {
          var promise = this.controller.csvUploadNext();
          this.$scope.$apply();
          expect(promise).toBeResolved();
        });
      });
      describe('invalid file content that does not have the required column', function () {
        beforeEach(function () {
          this.controller.model.file = this.mockCsvData.oneColumnInvalidUser;
          this.$scope.$apply();
          this.$timeout.flush();
        });
        it('should have 100 upload progress', function () {
          expect(this.controller.model.uploadProgress).toEqual(100);
        });
        it('should not go to the next step', function () {
          this.controller.csvUploadNext().catch(_.noop);
          this.$scope.$apply();
          expect(this.Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvEmpty');
        });
      });

      describe('licenseUnavailable is set to true', function () {
        it('should invoke modal to have been called', function () {
          this.controller.licenseBulkErrorModal();
          this.$scope.$apply();
          expect(this.$modal.open).toHaveBeenCalled();
        });
      });
    });

    describe('Process CSV and Save Users with an invalid user', function () {
      beforeEach(function () {
        var newHeaders = getJSONFixture('core/json/users/headers.json');
        newHeaders.columns.push({
          name: 'Spark Call 2',
          license: 'CO_spark_call_2',
          entitlements: [
            'ciscoUC',
          ],
        });
        this.CsvDownloadService.getCsv.and.callFake(function (type) {
          if (type === 'headers') {
            return this.$q.resolve(newHeaders);
          } else {
            return this.$q.resolve({});
          }
        });
        initController.apply(this);

        this.controller.model.file = this.mockCsvData.oneInvalidEmailUserTooManySparkCallLicenses;
        this.$scope.$apply();
        this.$timeout.flush();
      });

      it('should fail users that has more than 1 active Spark Call licenses', function () {
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(1);
        expect(this.controller.model.userErrorArray.length).toEqual(1);
      });
    });

    describe('Process CSV and Save Users', function () {
      beforeEach(function () {
        this.controller.isCancelledByUser = false;
        this.numCsvUsers = 13;
        this.controller.model.file = generateUsersCsv(this.numCsvUsers);
        this.$scope.$apply();
        this.$timeout.flush();
      });

      it('should emit an event to keep the user from logging out', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.$rootScope.$emit).toHaveBeenCalledWith('IDLE_TIMEOUT_KEEP_ALIVE'); //keep from logging out
      });

      it('should fail all users on server error', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersErrorResponseMock(403, {
          'tracking-id': 'UNIT-TEST',
        }));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
      });

      it('should report new users', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
        expect(this.controller.model.csvChunk).toEqual(2);
      });

      it('should report existing users', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(200));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(0);
        expect(this.controller.model.numExistingUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
      });

      it('should report error users', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(403));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(0);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
      });

      it('should report error users when API fails', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(500));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(0);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
      });

      it('should report error users when invalid CSV', function () {
        this.controller.model.file = this.mockCsvData.twoInvalidUsers;
        this.$scope.$apply();
        this.$timeout.flush();

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(2);
        expect(this.controller.model.numNewUsers).toEqual(0);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(2);
      });

      it('should report error users when invalid email address', function () {
        this.controller.model.file = this.mockCsvData.oneInvalidEmailUser;
        this.$scope.$apply();
        this.$timeout.flush();

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(1);
        expect(this.controller.model.numNewUsers).toEqual(0);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(1);
      });

      it('should report error for duplicate emails', function () {
        this.controller.model.file = this.mockCsvData.threeUsersOneDuplicateEmail;
        this.$scope.$apply();
        this.$timeout.flush();

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(3);
        expect(this.controller.model.numNewUsers).toEqual(2);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(1);
      });

      it('should report indices for invalid csv users', function () {
        this.controller.model.file = 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\n' +
          'Row2,Last0,No Error,firstlast0@example.com,5001,,true,true,true,true\n' +
          'Row3,Last1,Missing ID,,5002,,true,true,true,true\n' +
          '\n' +
          'Row5,Last2,Valid User,firstlast2@example.com,5003,,true,true,true,true\n' +
          'Row6,Last3,Invalid Flag,firstlast3@example.com,5004,,true,treu,true,true\n' +
          '';

        this.$scope.$apply();
        this.$timeout.flush();

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(5);
        expect(this.controller.model.numNewUsers).toEqual(2);
        expect(this.controller.model.numExistingUsers).toEqual(0);

        expect(this.controller.model.userErrorArray.length).toEqual(3);
        expect(this.controller.model.userErrorArray).toContain(jasmine.objectContaining({
          row: 3,
        }));
        expect(this.controller.model.userErrorArray).toContain(jasmine.objectContaining({
          row: 4,
        }));
        expect(this.controller.model.userErrorArray).toContain(jasmine.objectContaining({
          row: 6,
        }));

        expect(this.controller.model.userErrorArray).not.toContain(jasmine.objectContaining({
          row: 2,
        }));
        expect(this.controller.model.userErrorArray).not.toContain(jasmine.objectContaining({
          row: 5,
        }));
      });

      it('should stop processing when cancelled', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(-1));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(0);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
        expect(this.controller.isCancelledByUser).toEqual(false);
        this.controller.cancelProcessCsv();
        this.$scope.$apply();
        expect(this.$scope.$broadcast).toHaveBeenCalledWith('timer-stop');
        expect(this.controller.isCancelledByUser).toEqual(true);
      });

      it('should provide correct data in error array', function () {
        this.controller.model.file = this.mockCsvData.twoValidUsers;
        var csvData = $.csv.toObjects(this.controller.model.file);

        this.$scope.$apply();
        this.$timeout.flush();

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(-1));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();

        // download the CSV
        expect(this.controller.model.userErrorArray).toHaveLength(2);
        _.forEach(this.controller.model.userErrorArray, function (value) {
          expect(value.row).not.toBeEmpty();
          expect(value.error).not.toBeEmpty();

          var row = value.row - 2; // row counting begins at 1, and row 1 is the headers, so row 2 is the first object
          var expectedEmail = csvData[row]['User ID/Email (Required)'];
          expect(value.email).toEqual(expectedEmail);
        });
      });
    });

    describe('Process CSV with spaces and Save Users', function () {
      beforeEach(function () {
        this.controller.model.file = this.mockCsvData.twoValidUsersWithSpaces;
        this.$scope.$apply();
        this.$timeout.flush();
      });

      it('should report new users', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(2);
        expect(this.controller.model.numNewUsers).toEqual(2);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
      });
    });

    describe('Process CSV with difference email cases and Save Users', function () {
      beforeEach(function () {
        this.controller.model.file = this.mockCsvData.twoValidUsersWithSpaces;
        this.$scope.$apply();
        this.$timeout.flush();
      });

      it('should report new users', function () {
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseUpperCaseEmailMock(201));
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(2);
        expect(this.controller.model.numNewUsers).toEqual(2);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
      });
    });

    describe('Process CSV and handle retrying', function () {
      beforeEach(function () {
        this.numCsvUsers = 14;
        this.controller.model.file = generateUsersCsv(this.numCsvUsers);
        this.$scope.$apply();
        this.$timeout.flush();

        this.processRetries = function (retryAttempts) {
          for (var ii = retryAttempts; ii >= 0; ii--) {
            this.$scope.$apply();
            this.$timeout.flush();
            this.$interval.flush(1000);
          }
        };
      });

      it('should retry all users on a 429 Retry error', function () {
        var retryAttempts = 3;
        this.controller.model.numRetriesToAttempt = retryAttempts;
        this.$scope.$apply();

        // we want to force retrying, but then succeed after a few attempts
        // Since SparkCall is enabled in the test users, we have to take that into
        // account for how many times the mock will be called (ie, if chunk size is 2,
        // and we have 10 users, the mock will be called 5 times.
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersErrorResponseMock(429, {
          'tracking-id': 'UNIT-TEST',
          'retry-after': 200,
        }, retryAttempts * (this.numCsvUsers / this.UserCsvService.chunkSizeWithSparkCall), 201));
        this.controller.startUpload();

        // we need to run the process loop to exceed the number of retries
        this.processRetries(retryAttempts);

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
      });

      it('should retry all users on a 503 error', function () {
        var retryAttempts = 3;
        this.controller.model.numRetriesToAttempt = retryAttempts;
        this.$scope.$apply();

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersErrorResponseMock(503, {
          'tracking-id': 'UNIT-TEST',
          'retry-after': 200,
        }, retryAttempts * (this.numCsvUsers / this.UserCsvService.chunkSizeWithSparkCall), 201));
        this.controller.startUpload();

        // we need to run the process loop to exceed the number of retries
        this.processRetries(retryAttempts);

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numExistingUsers).toEqual(0);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
      });

      it('should retry individual users with 503 or 429 errors', function () {
        var retryAttempts = 1;

        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201, [{
          status: 503,
          users: 4,
        }, {
          status: 429,
          users: 2,
        }, {
          status: 200,
          users: 3,
        }]));

        this.controller.model.numRetriesToAttempt = retryAttempts;
        this.controller.model.retryAfterDefault = 200;
        this.$scope.$apply();

        this.controller.startUpload();

        // we need to run the process loop to exceed the number of retries
        this.processRetries(retryAttempts);

        expect(this.controller.model.processProgress).toEqual(100);
        expect(this.controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(this.controller.model.numNewUsers).toEqual(11);
        expect(this.controller.model.numExistingUsers).toEqual(3);
        expect(this.controller.model.userErrorArray.length).toEqual(0);
      });
    });
  });

  describe('Process CSV with Hybrid Service Resource Groups', function () {
    beforeEach(function () {
      var _this = this;
      this.FeatureToggleService.supports.and.callFake(function () {
        return _this.$q.resolve(true);
      });
      this.headers = getJSONFixture('core/json/users/headersForHybridServicesOld.json');

      initMocks.apply(this);
      initController.apply(this);
    });

    function initMocks() {
      this.setCsv = function (users, csvHeader) {
        var header = csvHeader || ['First Name', 'Last Name', 'Display Name', 'User ID/Email (Required)', 'Hybrid Calendar Service Resource Group', 'Hybrid Call Service Resource Group', 'Calendar Service', 'Call Service Aware'];
        var csv = [header];
        csv.push(users);
        this.controller.model.file = $.csv.fromArrays(csv);
        this.$scope.$apply();
        this.$timeout.flush();
      };

      this.initAndCaptureUpdatedUserProps = function (users, header) {
        var _this = this;
        this.setCsv(users, header);
        this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
        var updatedUserProps = [];
        this.USSService.updateBulkUserProps.and.callFake(function (props) {
          updatedUserProps = props;
          return _this.$q.resolve({});
        });
        this.controller.startUpload();
        this.$scope.$apply();
        this.$timeout.flush();
        return updatedUserProps;
      };
    }

    it('should not update USS when no resource group changes', function () {
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', '', '', 'true', 'true']);
      this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.handleHybridServicesResourceGroups).toBeTruthy();
      expect(this.controller.model.numTotalUsers).toEqual(1);
      expect(this.controller.model.userErrorArray.length).toEqual(0);
      expect(this.ResourceGroupService.getAll.calls.count()).toEqual(1);
      expect(this.USSService.getAllUserProps.calls.count()).toEqual(1);
      expect(this.USSService.updateBulkUserProps.calls.count()).toEqual(0);
    });

    it('should add an error if the calendar resource group does not exist in FMS', function () {
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'DoesNotExist', '', 'true', 'true']);
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.model.numTotalUsers).toEqual(1);
      expect(this.controller.model.userErrorArray.length).toEqual(1);
      expect(this.controller.model.userErrorArray[0].email).toEqual('tvasset@cisco.com');
      expect(this.controller.model.userErrorArray[0].error).toEqual('firstTimeWizard.invalidCalendarServiceResourceGroup');
      expect(this.ResourceGroupService.getAll.calls.count()).toEqual(1);
      expect(this.USSService.getAllUserProps.calls.count()).toEqual(1);
      expect(this.USSService.updateBulkUserProps.calls.count()).toEqual(0);
      expect(this.Userservice.bulkOnboardUsers.calls.count()).toEqual(0);
    });

    it('should add an error if the call resource group does not exist in FMS', function () {
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', '', 'DoesNotExist', 'true', 'true']);
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.model.numTotalUsers).toEqual(1);
      expect(this.controller.model.userErrorArray.length).toEqual(1);
      expect(this.controller.model.userErrorArray[0].email).toEqual('tvasset@cisco.com');
      expect(this.controller.model.userErrorArray[0].error).toEqual('firstTimeWizard.invalidCallServiceResourceGroup');
      expect(this.ResourceGroupService.getAll.calls.count()).toEqual(1);
      expect(this.USSService.getAllUserProps.calls.count()).toEqual(1);
      expect(this.USSService.updateBulkUserProps.calls.count()).toEqual(0);
      expect(this.Userservice.bulkOnboardUsers.calls.count()).toEqual(0);
    });

    it('should update USS with a new calendar resource group assignment', function () {
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'Resource Group A', '', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(1);
      expect(updatedUserProps[0].userId).toEqual('b345abe1-5b9d-43b2-9a89-1e4e64ad478c');
      expect(updatedUserProps[0].resourceGroups).toBeDefined();
      expect(updatedUserProps[0].resourceGroups['squared-fusion-cal']).toEqual('445a3f8e-06a3-476b-b6f1-215a7db09083');
      expect(updatedUserProps[0].resourceGroups['squared-fusion-uc']).toBeUndefined();
    });

    it('should update USS with a new call resource group assignment', function () {
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', '', 'Resource Group B', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(1);
      expect(updatedUserProps[0].userId).toEqual('b345abe1-5b9d-43b2-9a89-1e4e64ad478c');
      expect(updatedUserProps[0].resourceGroups).toBeDefined();
      expect(updatedUserProps[0].resourceGroups['squared-fusion-uc']).toEqual('be46e71f-c8ea-470b-ba13-2342d310a202');
      expect(updatedUserProps[0].resourceGroups['squared-fusion-cal']).toBeUndefined();
    });

    it('should not update USS when the current resource groups are the same', function () {
      this.USSService.getAllUserProps.and.returnValue(this.$q.resolve([
        {
          userId: 'b345abe1-5b9d-43b2-9a89-1e4e64ad478c',
          resourceGroups: {
            'squared-fusion-cal': 'be46e71f-c8ea-470b-ba13-2342d310a202',
            'squared-fusion-uc': 'be46e71f-c8ea-470b-ba13-2342d310a202',
          },
        },
      ]));
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'Resource Group B', 'Resource Group B', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(0);
      expect(this.USSService.updateBulkUserProps.calls.count()).toEqual(0);
    });

    it('should update USS when the current resource groups are different', function () {
      this.USSService.getAllUserProps.and.returnValue(this.$q.resolve([
        {
          userId: 'b345abe1-5b9d-43b2-9a89-1e4e64ad478c',
          resourceGroups: {
            'squared-fusion-cal': 'be46e71f-c8ea-470b-ba13-2342d310a202',
            'squared-fusion-uc': '445a3f8e-06a3-476b-b6f1-215a7db09083',
          },
        },
      ]));
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'Resource Group A', 'Resource Group B', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(1);
      expect(updatedUserProps[0].userId).toEqual('b345abe1-5b9d-43b2-9a89-1e4e64ad478c');
      expect(updatedUserProps[0].resourceGroups).toBeDefined();
      expect(updatedUserProps[0].resourceGroups['squared-fusion-uc']).toEqual('be46e71f-c8ea-470b-ba13-2342d310a202');
      expect(updatedUserProps[0].resourceGroups['squared-fusion-cal']).toEqual('445a3f8e-06a3-476b-b6f1-215a7db09083');
    });

    it('should update USS with empty resource groups when no longer in the CSV', function () {
      this.USSService.getAllUserProps.and.returnValue(this.$q.resolve([
        {
          userId: 'b345abe1-5b9d-43b2-9a89-1e4e64ad478c',
          resourceGroups: {
            'squared-fusion-cal': 'be46e71f-c8ea-470b-ba13-2342d310a202',
            'squared-fusion-uc': '445a3f8e-06a3-476b-b6f1-215a7db09083',
          },
        },
      ]));
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', '', '', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(1);
      expect(updatedUserProps[0].userId).toEqual('b345abe1-5b9d-43b2-9a89-1e4e64ad478c');
      expect(updatedUserProps[0].resourceGroups).toBeDefined();
      expect(updatedUserProps[0].resourceGroups['squared-fusion-uc']).toEqual('');
      expect(updatedUserProps[0].resourceGroups['squared-fusion-cal']).toEqual('');
    });

    it('should add an error of the USS update fails', function () {
      var _this = this;
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'Resource Group A', '', 'true', 'true']);
      this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
      this.USSService.updateBulkUserProps.and.callFake(function () {
        return _this.$q.reject();
      });
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.model.userErrorArray.length).toEqual(1);
      expect(this.controller.model.userErrorArray[0].email).toEqual('tvasset@cisco.com');
      expect(this.controller.model.userErrorArray[0].error).toEqual('firstTimeWizard.unableToUpdateResourceGroups');
    });

    it('should ignore resource group changes if unable to read groups from FMS', function () {
      var ngq = this.$q;
      this.ResourceGroupService.getAll.and.callFake(function () {
        return ngq.reject();
      });
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', '', 'Resource Group B', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(0);
      expect(this.USSService.updateBulkUserProps.calls.count()).toEqual(0);
      expect(this.controller.handleHybridServicesResourceGroups).toBeFalsy();
    });

    it('should ignore resource group changes if unable to read current props from USS', function () {
      var ngq = this.$q;
      this.USSService.getAllUserProps.and.callFake(function () {
        return ngq.reject();
      });
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', '', 'Resource Group B', 'true', 'true']);
      expect(updatedUserProps.length).toEqual(0);
      expect(this.USSService.updateBulkUserProps.calls.count()).toEqual(0);
      expect(this.controller.handleHybridServicesResourceGroups).toBeFalsy();
    });

    it('should not update USS if the CSV does not contain resource groups', function () {
      this.USSService.getAllUserProps.and.returnValue(this.$q.resolve([
        {
          userId: 'b345abe1-5b9d-43b2-9a89-1e4e64ad478c',
          resourceGroups: {
            'squared-fusion-cal': 'be46e71f-c8ea-470b-ba13-2342d310a202',
            'squared-fusion-uc': '445a3f8e-06a3-476b-b6f1-215a7db09083',
          },
        },
      ]));
      var updatedUserProps = this.initAndCaptureUpdatedUserProps(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'true', 'true'], ['First Name', 'Last Name', 'Display Name', 'User ID/Email (Required)', 'Calendar Service', 'Call Service Aware']);
      expect(updatedUserProps.length).toEqual(0);
    });
  });

  describe('Process CSV with new Hybrid Calendar Service entitlements', function () {
    beforeEach(function () {
      this.headers = getJSONFixture('core/json/users/headersForHybridServicesNew.json');

      initMocks.apply(this);
      initController.apply(this);
    });

    function initMocks() {
      this.setCsv = function (users, header) {
        var csv = [header || ['First Name', 'Last Name', 'Display Name', 'User ID/Email (Required)', 'Hybrid Calendar Service (Exchange)', 'Hybrid Calendar Service (Google)']];
        csv.push(users);
        this.controller.model.file = $.csv.fromArrays(csv);
        this.$scope.$apply();
        this.$timeout.flush();
      };
    }

    xit('should add an error if both calendar entitlements (Exchange and Google) are set', function () {
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'true', 'true']);
      this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.model.numTotalUsers).toEqual(1);
      expect(this.controller.model.userErrorArray.length).toEqual(1);
      expect(this.controller.model.userErrorArray[0].email).toEqual('tvasset@cisco.com');
      expect(this.controller.model.userErrorArray[0].error).toEqual('firstTimeWizard.mutuallyExclusiveCalendarEntitlements');
      expect(this.Userservice.bulkOnboardUsers.calls.count()).toEqual(0);
    });

    it('should allow setting the google calendar entitlement (squaredFusionGCal)', function () {
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'false', 'true']);
      this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.model.numTotalUsers).toEqual(1);
      expect(this.controller.model.userErrorArray.length).toEqual(0);
      expect(this.Userservice.bulkOnboardUsers.calls.count()).toEqual(1);
      expect(this.uploadedDataCapture.length).toEqual(1);
      expect(this.uploadedDataCapture[0].entitlements.length).toEqual(1);
      expect(_.some(this.uploadedDataCapture[0].entitlements, function (entitlement) {
        return entitlement.entitlementName === 'squaredFusionGCal' && entitlement.entitlementState === 'ACTIVE';
      })).toBeTruthy();
    });

    xit('should accept the old Calendar Service header after the backend rename to Hybrid Calendar Service (Exchange) is completed', function () {
      var oldHeaders = ['First Name', 'Last Name', 'Display Name', 'User ID/Email (Required)', 'Calendar Service'];
      this.setCsv(['Tom', 'Vasset', 'Tom Vasset', 'tvasset@cisco.com', 'true'], oldHeaders);
      this.Userservice.bulkOnboardUsers.and.callFake(this.bulkOnboardUsersResponseMock(201));
      this.controller.startUpload();
      this.$scope.$apply();
      this.$timeout.flush();
      expect(this.controller.model.numTotalUsers).toEqual(1);
      expect(this.controller.model.userErrorArray.length).toEqual(0);
      expect(this.Userservice.bulkOnboardUsers.calls.count()).toEqual(1);
      expect(this.uploadedDataCapture.length).toEqual(1);
      expect(this.uploadedDataCapture[0].entitlements.length).toEqual(1);
      expect(_.some(this.uploadedDataCapture[0].entitlements, function (entitlement) {
        return entitlement.entitlementName === 'squaredFusionCal' && entitlement.entitlementState === 'ACTIVE';
      })).toBeTruthy();
    });
  });

  describe('onBack', function () {
    beforeEach(function () {
      this.$previousState.get.and.returnValue({
        state: {
          name: 'users.manage.emailSuppress',
        },
      });
      installPromiseMatchers.apply(this);
      initController.apply(this);
    });

    it('should go to users.manage.picker when previous state is users.manage.emailSuppress', function () {
      this.controller.onBack();
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.picker');
    });
  });
});
