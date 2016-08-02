'use strict';

describe('OnboardCtrl: Ctrl', function () {
  var controller, $controller, $modal, $scope, $timeout, $q, $state, $stateParams, modalDefer, $interval, Notification, Userservice, TelephonyInfoService, Orgservice, FeatureToggleService, Authinfo, CsvDownloadService, HuronCustomer, UserCsvService;
  var getUserMe, getMigrateUsers, getMyFeatureToggles, sites;
  var fusionServices, headers, getLicensesUsage;
  var getLicensesUsageSpy, customer;
  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function (_$controller_, _$interval_, _$modal_, _$q_, $rootScope, _$state_, _$stateParams_, _$timeout_, _Authinfo_, _CsvDownloadService_, _FeatureToggleService_, _HuronCustomer_, _Notification_, _Orgservice_, _UserCsvService_, _Userservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;
    $interval = _$interval_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $modal = _$modal_;
    Notification = _Notification_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
    CsvDownloadService = _CsvDownloadService_;
    HuronCustomer = _HuronCustomer_;
    UserCsvService = _UserCsvService_;

    spyOn($state, 'go').and.returnValue($q.when());
    spyOn(Authinfo, 'isOnline').and.returnValue(true);
    modalDefer = $q.defer();
    spyOn($modal, 'open').and.returnValue({
      result: modalDefer.promise
    });

    getUserMe = getJSONFixture('core/json/users/me.json');
    getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    headers = getJSONFixture('core/json/users/headers.json');
    customer = getJSONFixture('huron/json/settings/customer.json');

    spyOn(Orgservice, 'getHybridServiceAcknowledged').and.returnValue($q.when(fusionServices));
    spyOn(CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.when(headers);
      } else {
        return $q.when({});
      }
    });

    spyOn(Notification, 'notify');
    spyOn(Notification, 'error');
    spyOn(Orgservice, 'getUnlicensedUsers');
    spyOn(FeatureToggleService, 'getFeaturesForUser').and.returnValue(getMyFeatureToggles);
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));
    spyOn(Userservice, 'onboardUsers');
    spyOn(Userservice, 'bulkOnboardUsers');
    spyOn(Userservice, 'getUser').and.returnValue(getUserMe);
    spyOn(Userservice, 'migrateUsers').and.returnValue(getMigrateUsers);
    spyOn(Userservice, 'updateUsers');
    spyOn($scope, '$broadcast').and.callThrough();
    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
  }));

  function initController() {
    controller = $controller('UserCsvCtrl', {
      $scope: $scope,
      $state: $state
    });

    $scope.$apply();
  }

  // generates a valid CSV with the specified number of users
  // 0: Headers
  // 1: user 1
  // 2: user 2
  // ...
  // <numUsers>: user <numUsers>
  function generateUsersCsv(numUsers, invalidUsers) {
    var invalidUsersToMake = invalidUsers || [];
    var header = ['First Name', 'Last Name', 'Display Name', 'User ID/Email (Required)', 'Directory Number', 'Direct Line', 'Calendar Service', 'Meeting 25 Party', 'Spark Call', 'Spark Message'];
    var csv = [header];
    for (var ii = 0; ii < numUsers; ii++) {
      var user = [
        'First' + ii, 'Last' + ii, 'First' + ii + ' Last' + ii, 'firstlast' + ii + '@example.com',
        5001 + ii, '',
        'true', 'true', 'true', 'true'
      ];
      if (_.contains(invalidUsers, csv.length + 1)) {
        // create an error in the CSV data for user
        invalidUsersToMake--;
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

  //
  // statusCode

  /**
   * Mock the response for the Userservice.bulkOnboardUsers function.
   * If additionalCodes object supplied, randomly assigns these codes to users up to
   * the specified number for each code.  Then uses StatusCode for the rest.
   */

  function bulkOnboardSuccessResponse(uploadedData, defaultStatusCode, statusCodes) {
    statusCodes = statusCodes || [];
    var response = {
      data: {
        userResponse: []
      }
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
        email: user.address
      });
    });
    return $q.resolve(response);
  }

  function bulkOnboardUsersResponseMock(statusCode, additionalCodes) {
    var statusCodes = additionalCodes || [];

    return function (uploadedData) {
      return bulkOnboardSuccessResponse(uploadedData, statusCode, statusCodes);
    };
  }

  function bulkOnboardUsersErrorResponseMock(statusCode, headers, successAfterTries, successCode) {
    var triesUntilSuccess = successAfterTries || Number.MAX_VALUE;

    return function (uploadedData) {
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
            userResponse: []
          }
        };
        return $q.reject(response);
      } else {
        // reached number of tries before we pretend to succeed
        return bulkOnboardSuccessResponse(uploadedData, successCode);
      }
    };
  }

  describe('Bulk Users CSV', function () {
    beforeEach(function () {
      initController();
    });
    var oneColumnValidUser = 'User ID/Email (Required),\njohndoe@example.com,';
    var oneColumnInvalidUser = 'First Name,\nJohn,';
    var twoValidUsers = generateUsersCsv(2);
    var twoInvalidUsers = 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,johndoe@example.com,5001,,TREU,true,true,true,true,true\nJane,Doe,Jane Doe,janedoe@example.com,5002,,FASLE,false,false,false';
    var twoValidUsersWithSpaces = 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\n , , ,johndoe@example.com, , ,true,true,true,true\n , , ,janedoe@example.com, ,  ,f,f,f,f';

    var threeUsersOneDuplicateEmail = 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nFirst0,Last0,First0 Last0,firstlast0@example.com,5001,,true,true,true,true\nFirst1,Last1,First1 Last1,firstlast1@example.com,5002,,true,true,true,true\nFirst2,Last2,First2 Last2,firstlast0@example.com,5002,,true,true,true,true';

    beforeEach(installPromiseMatchers);

    describe('Upload CSV', function () {
      describe('without file content', function () {
        it('should have 0 upload progress', function () {
          expect(controller.model.uploadProgress).toEqual(0);
        });
        it('should not go to the next step', function () {
          var promise = controller.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvEmpty');
        });
      });
      describe('with file content', function () {
        beforeEach(function () {
          controller.model.file = twoValidUsers;
          $scope.$apply();
          $timeout.flush();
        });
        it('should have 100 upload progress when the file model changes', function () {
          expect(controller.model.uploadProgress).toEqual(100);
        });
        it('should go to next step', function () {
          var promise = controller.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeResolved();
        });
        it('should not allow to go next after resetting file', function () {
          controller.resetFile();
          $scope.$apply();
          $timeout.flush();
          var promise = controller.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvEmpty');
        });
      });
      it('should notify error on file size error', function () {
        controller.onFileSizeError();
        $scope.$apply();
        expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvMaxSizeError');
      });
      it('should notify error on file type error', function () {
        controller.onFileTypeError();
        $scope.$apply();
        expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.csvFileTypeError');
      });
      describe('valid one column file content', function () {
        beforeEach(function () {
          controller.model.file = oneColumnValidUser;
          $scope.$apply();
          $timeout.flush();
        });
        it('should have 100 upload progress', function () {
          expect(controller.model.uploadProgress).toEqual(100);
        });
        it('should go to next step', function () {
          var promise = controller.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeResolved();
        });
      });
      describe('invalid file content that does not have the required column', function () {
        beforeEach(function () {
          controller.model.file = oneColumnInvalidUser;
          $scope.$apply();
          $timeout.flush();
        });
        it('should have 100 upload progress', function () {
          expect(controller.model.uploadProgress).toEqual(100);
        });
        it('should not go to the next step', function () {
          var promise = controller.csvUploadNext();
          $scope.$apply();
          expect(promise).toBeRejected();
          expect(Notification.error).toHaveBeenCalledWith('firstTimeWizard.uploadCsvEmpty');
        });
      });
      describe('licenseUnavailable is set to true', function () {
        it('should invoke modal to have been called', function () {
          controller.licenseBulkErrorModal();
          $scope.$apply();
          expect($modal.open).toHaveBeenCalled();
        });
      });
    });

    describe('Process CSV and Save Users', function () {
      beforeEach(function () {
        controller.isCancelledByUser = false;
        this.numCsvUsers = 13;
        controller.model.file = generateUsersCsv(this.numCsvUsers);
        $scope.$apply();
        $timeout.flush();
      });

      it('should fail all users on server error', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersErrorResponseMock(403, {
          'tracking-id': 'UNIT-TEST'
        }));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
      });

      it('should report new users', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(201));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(0);
        expect(controller.model.csvChunk).toEqual(2);
      });

      it('should report existing users', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(200));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(this.numCsvUsers);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });

      it('should report error users', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(403));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
      });

      it('should report error users when API fails', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(500));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
      });

      it('should report error users when invalid CSV', function () {
        controller.model.file = twoInvalidUsers;
        $scope.$apply();
        $timeout.flush();

        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(201));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();

        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(2);
      });

      it('should report error for duplicate emails', function () {
        controller.model.file = threeUsersOneDuplicateEmail;
        $scope.$apply();
        $timeout.flush();

        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(201));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();

        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(3);
        expect(controller.model.numNewUsers).toEqual(2);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(1);
      });

      it('should report indices for invalid csv users', function () {
        controller.model.file = 'First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\n' +
          'Row2,Last0,No Error,firstlast0@example.com,5001,,true,true,true,true\n' +
          'Row3,Last1,Missing ID,,5002,,true,true,true,true\n' +
          '\n' +
          'Row5,Last2,Valid User,firstlast2@example.com,5003,,true,true,true,true\n' +
          'Row6,Last3,Invalid Flag,firstlast3@example.com,5004,,true,treu,true,true\n' +
          '';

        $scope.$apply();
        $timeout.flush();

        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(201));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();

        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(5);
        expect(controller.model.numNewUsers).toEqual(2);
        expect(controller.model.numExistingUsers).toEqual(0);

        expect(controller.model.userErrorArray.length).toEqual(3);
        expect(controller.model.userErrorArray).toContain(jasmine.objectContaining({
          row: 3
        }));
        expect(controller.model.userErrorArray).toContain(jasmine.objectContaining({
          row: 4
        }));
        expect(controller.model.userErrorArray).toContain(jasmine.objectContaining({
          row: 6
        }));

        expect(controller.model.userErrorArray).not.toContain(jasmine.objectContaining({
          row: 2
        }));
        expect(controller.model.userErrorArray).not.toContain(jasmine.objectContaining({
          row: 5
        }));
      });

      it('should stop processing when cancelled', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(-1));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(this.numCsvUsers);
        expect(controller.isCancelledByUser).toEqual(false);
        controller.cancelProcessCsv();
        $scope.$apply();
        expect($scope.$broadcast).toHaveBeenCalledWith('timer-stop');
        expect(controller.isCancelledByUser).toEqual(true);
      });
    });

    describe('Process CSV with spaces and Save Users', function () {
      beforeEach(function () {
        controller.model.file = twoValidUsersWithSpaces;
        $scope.$apply();
        $timeout.flush();
      });

      it('should report new users', function () {
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(201));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(2);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });
    });

    describe('Process CSV and handle retrying', function () {
      beforeEach(function () {
        this.numCsvUsers = 14;
        controller.model.file = generateUsersCsv(this.numCsvUsers);
        $scope.$apply();
        $timeout.flush();

        this.processRetries = function (retryAttempts) {
          for (var ii = retryAttempts; ii >= 0; ii--) {
            $scope.$apply();
            $timeout.flush();
            $interval.flush(1000);
          }
        };
      });

      it('should retry all users on a 429 Retry error', function () {
        var retryAttempts = 3;
        controller.model.numRetriesToAttempt = retryAttempts;
        $scope.$apply();

        // we want to force retrying, but then succeed after a few attempts
        // Since SparkCall is enabled in the test users, we have to take that into
        // account for how many times the mock will be called (ie, if chunk size is 2,
        // and we have 10 users, the mock will be called 5 times.
        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersErrorResponseMock(429, {
          'tracking-id': 'UNIT-TEST',
          'retry-after': 200
        }, retryAttempts * (this.numCsvUsers / UserCsvService.chunkSizeWithSparkCall), 201));
        controller.startUpload();

        // we need to run the process loop to exceed the number of retries
        this.processRetries(retryAttempts);

        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });

      it('should retry all users on a 503 error', function () {
        var retryAttempts = 3;
        controller.model.numRetriesToAttempt = retryAttempts;
        $scope.$apply();

        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersErrorResponseMock(503, {
          'tracking-id': 'UNIT-TEST',
          'retry-after': 200
        }, retryAttempts * (this.numCsvUsers / UserCsvService.chunkSizeWithSparkCall), 201));
        controller.startUpload();

        // we need to run the process loop to exceed the number of retries
        this.processRetries(retryAttempts);

        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });

      it('should retry individual users with 503 or 429 errors', function () {
        var retryAttempts = 1;

        Userservice.bulkOnboardUsers.and.callFake(bulkOnboardUsersResponseMock(201, [{
          status: 503,
          users: 4
        }, {
          status: 429,
          users: 2
        }, {
          status: 200,
          users: 3
        }]));

        controller.model.numRetriesToAttempt = retryAttempts;
        controller.model.retryAfterDefault = 200;
        $scope.$apply();

        controller.startUpload();

        // we need to run the process loop to exceed the number of retries
        this.processRetries(retryAttempts);

        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(this.numCsvUsers);
        expect(controller.model.numNewUsers).toEqual(11);
        expect(controller.model.numExistingUsers).toEqual(3);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });
    });
  });
});
