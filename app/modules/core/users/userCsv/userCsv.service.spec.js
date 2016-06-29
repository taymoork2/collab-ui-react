'use strict';

describe('Controller: UserCsvService', function () {
  var UserCsvService, Notification;

  var errorMsg = 'Error message.';
  var trackingId = ' TrackingID: ';
  var dummyId = 'TrackingID';
  var email = 'dummyEmail@fakeAccount.com';
  var headerFuncOne = function (id) {
    return null;
  };
  var headerFuncTwo = function (id) {
    return id;
  };

  var defaultCsvStat = {
    isProcessing: false,
    numMaxUsers: 0,
    processProgress: 0,
    numTotalUsers: 0,
    numNewUsers: 0,
    numExistingUsers: 0,
    userArray: [],
    userErrorArray: []
  };

  var updatedCsvStat = {
    isProcessing: false,
    numMaxUsers: 15,
    processProgress: 13,
    numTotalUsers: 14,
    numNewUsers: 7,
    numExistingUsers: 7,
    userArray: [],
    userErrorArray: []
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(function (_UserCsvService_, _Notification_) {
    UserCsvService = _UserCsvService_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');
  }));

  describe('UserCsvService', function () {
    it('getCsvStat should return csvStat', function () {
      expect(UserCsvService.getCsvStat()).toEqual(defaultCsvStat);
    });

    it('setCsvStat should update csvStat', function () {
      UserCsvService.setCsvStat(updatedCsvStat, defaultCsvStat);
      expect(UserCsvService.getCsvStat()).toEqual(updatedCsvStat);
    });

    it('getBulkErrorResponse should return expected response for status:400 messageCode:400087', function () {
      expect(UserCsvService.getBulkErrorResponse(400, '400087', email)).toEqual('usersPage.hybridServicesError');
    });

    it('getBulkErrorResponse should return expected response for status:400 messageCode:400094', function () {
      expect(UserCsvService.getBulkErrorResponse(400, '400094', email)).toEqual('usersPage.hybridServicesComboError');
    });

    it('getBulkErrorResponse should return expected response for status:400 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(400, null, email)).toEqual('firstTimeWizard.bulk400Error');
    });

    it('getBulkErrorResponse should return expected response for status:401 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(401, null, email)).toEqual('firstTimeWizard.bulk401And403Error');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400081', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400081', email)).toEqual('usersPage.userExistsError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400084', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400084', email)).toEqual('usersPage.claimedDomainError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400091', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400091', email)).toEqual('usersPage.claimedDomainError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400090', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400090', email)).toEqual('usersPage.userExistsInDiffOrgError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400096', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400096', email)).toEqual('usersPage.notSetupForManUserAddError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400110', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400110', email)).toEqual('usersPage.notSetupForManUserAddError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400108', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400108', email)).toEqual('usersPage.userExistsDomainClaimError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400109', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400109', email)).toEqual('usersPage.unableToMigrateError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:400111', function () {
      expect(UserCsvService.getBulkErrorResponse(403, '400111', email)).toEqual('usersPage.insufficientEntitlementsError');
    });

    it('getBulkErrorResponse should return expected response for status:403 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(403, null, email)).toEqual('firstTimeWizard.bulk401And403Error');
    });

    it('getBulkErrorResponse should return expected response for status:404 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(404, null, email)).toEqual('firstTimeWizard.bulk404Error');
    });

    it('getBulkErrorResponse should return expected response for status:408 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(408, null, email)).toEqual('firstTimeWizard.bulk408Error');
    });

    it('getBulkErrorResponse should return expected response for status:504 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(504, null, email)).toEqual('firstTimeWizard.bulk408Error');
    });

    it('getBulkErrorResponse should return expected response for status:409 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(409, null, email)).toEqual('firstTimeWizard.bulk409Error');
    });

    it('getBulkErrorResponse should return expected response for status:500 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(500, null, email)).toEqual('firstTimeWizard.bulk500Error');
    });

    it('getBulkErrorResponse should return expected response for status:502 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(502, null, email)).toEqual('firstTimeWizard.bulk502And503Error');
    });

    it('getBulkErrorResponse should return expected response for status:503 messageCode:any', function () {
      expect(UserCsvService.getBulkErrorResponse(503, null, email)).toEqual('firstTimeWizard.bulk502And503Error');
    });

    it('getBulkErrorResponse should return expected response for status:-1 messageCode:0', function () {
      expect(UserCsvService.getBulkErrorResponse(-1, '0', email)).toEqual('firstTimeWizard.bulkCancelledErrorByUser');
    });

    it('getBulkErrorResponse should return expected response for status:-1 messageCode:null', function () {
      expect(UserCsvService.getBulkErrorResponse(-1, null, email)).toEqual('firstTimeWizard.bulkCancelledErrorByServer');
    });

    it('getBulkErrorResponse should return expected response for status:null messageCode:null', function () {
      expect(UserCsvService.getBulkErrorResponse(null, null, email)).toEqual('firstTimeWizard.processBulkError');
    });

    it('addErrorWithTrackingID should add trackingId when there is none', function () {
      var responseWithHeader = UserCsvService.addErrorWithTrackingID(errorMsg, {
        headers: headerFuncOne
      });
      var noResponseAndHeader = UserCsvService.addErrorWithTrackingID(errorMsg, null, headerFuncOne);

      expect(responseWithHeader).toEqual(errorMsg + trackingId);
      expect(noResponseAndHeader).toEqual(errorMsg + trackingId);
    });

    it('addErrorWithTrackingID should use existing trackingId when there is one', function () {
      var responseWithHeader = UserCsvService.addErrorWithTrackingID(errorMsg, {
        headers: headerFuncTwo
      });
      var noResponseAndHeader = UserCsvService.addErrorWithTrackingID(errorMsg, null, headerFuncTwo);

      expect(responseWithHeader).toEqual(errorMsg + trackingId + dummyId);
      expect(noResponseAndHeader).toEqual(errorMsg + trackingId + dummyId);
    });
  });
});
