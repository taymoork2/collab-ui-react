'use strict';

describe('OnboardCtrl: Ctrl', function () {
  var controller, $scope, $timeout, $q, $state, $stateParams, Notification, Userservice, TelephonyInfoService, Orgservice, FeatureToggleService, Authinfo, CsvDownloadService;
  var getUserMe;
  var getMigrateUsers;
  var getMyFeatureToggles;
  var sites;
  var fusionServices;
  var headers;
  var getMessageServices;
  var getLicensesUsage;
  var getLicensesUsageSpy;
  var $controller;
  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function (_$controller_, $rootScope, _$timeout_, _$q_, _$state_, _$stateParams_, _Notification_, _Userservice_, _Orgservice_, _FeatureToggleService_, _Authinfo_, _CsvDownloadService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    Notification = _Notification_;
    Userservice = _Userservice_;
    Orgservice = _Orgservice_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
    CsvDownloadService = _CsvDownloadService_;

    spyOn($state, 'go');

    getUserMe = getJSONFixture('core/json/users/me.json');
    getMigrateUsers = getJSONFixture('core/json/users/migrate.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    sites = getJSONFixture('huron/json/settings/sites.json');
    fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    headers = getJSONFixture('core/json/users/headers.json');
    getMessageServices = getJSONFixture('core/json/authInfo/messagingServices.json');

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
  }));

  function initController() {
    controller = $controller('UserCsvCtrl', {
      $scope: $scope,
      $state: $state
    });

    $scope.$apply();
  }

  function onboardUsersResponse(statusCode, responseMessage) {
    return {
      data: {
        userResponse: [{
          status: statusCode,
          httpStatus: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }, {
          status: statusCode,
          httpStatus: statusCode,
          message: responseMessage,
          email: 'blah@example.com'
        }]
      }
    };
  }

  describe('Bulk Users CSV', function () {
    beforeEach(function () {
      initController();
    });
    var oneColumnValidUser = "User ID/Email (Required),\njohndoe@example.com,";
    var oneColumnInvalidUser = "First Name,\nJohn,";
    var twoValidUsers = "First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,johndoe@example.com,5001,,true,true,true,true\nJane,Doe,Jane Doe,janedoe@example.com,5002,,f,f,f,f";
    var twoInvalidUsers = "First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\nJohn,Doe,John Doe,johndoe@example.com,5001,,TREU,true,true,true,true,true\nJane,Doe,Jane Doe,janedoe@example.com,5002,,FASLE,false,false,false";
    var twoValidUsersWithSpaces = "First Name,Last Name,Display Name,User ID/Email (Required),Directory Number,Direct Line,Calendar Service,Meeting 25 Party,Spark Call,Spark Message\n , , ,johndoe@example.com, , ,true,true,true,true\n , , ,janedoe@example.com, ,  ,f,f,f,f";

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
    });

    describe('Process CSV and Save Users', function () {
      beforeEach(function () {
        controller.model.file = twoValidUsers;
        $scope.$apply();
        $timeout.flush();
      });
      it('should report new users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onboardUsersResponse(201)));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(2);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });
      it('should report existing users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onboardUsersResponse(200)));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(2);
        expect(controller.model.userErrorArray.length).toEqual(0);
      });
      it('should report error users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onboardUsersResponse(403)));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(2);
      });
      it('should report error users when API fails', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.reject(onboardUsersResponse(500)));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(2);
      });
      it('should report error users when invalid CSV', function () {
        controller.model.file = twoInvalidUsers;
        $scope.$apply();
        $timeout.flush();
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onboardUsersResponse(201)));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(2);
      });
      it('should stop processing when cancelled', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onboardUsersResponse(-1)));
        controller.startUpload();
        $scope.$apply();
        $timeout.flush();
        expect(controller.model.processProgress).toEqual(100);
        expect(controller.model.numTotalUsers).toEqual(2);
        expect(controller.model.numNewUsers).toEqual(0);
        expect(controller.model.numExistingUsers).toEqual(0);
        expect(controller.model.userErrorArray.length).toEqual(2);
        controller.cancelProcessCsv();
        $scope.$apply();
        expect($scope.$broadcast).toHaveBeenCalledWith('timer-stop');
      });
    });

    describe('Process CSV with spaces and Save Users', function () {
      beforeEach(function () {
        controller.model.file = twoValidUsersWithSpaces;
        $scope.$apply();
        $timeout.flush();
      });
      it('should report new users', function () {
        Userservice.bulkOnboardUsers.and.returnValue($q.resolve(onboardUsersResponse(201)));
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
  });
});
