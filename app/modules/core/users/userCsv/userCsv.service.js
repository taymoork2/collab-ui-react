(function () {
  'use strict';

  angular
    .module('Core')
    .factory('UserCsvService', UserCsvService);

  /* @ngInject */
  function UserCsvService($translate, TrackingId) {
    var csvStat = {
      isProcessing: false,
      numMaxUsers: 0,
      processProgress: 0,
      numTotalUsers: 0,
      numNewUsers: 0,
      numExistingUsers: 0,
      userArray: [],
      userErrorArray: []
    };

    var service = {
      getCsvStat: getCsvStat,
      setCsvStat: setCsvStat,
      getBulkErrorResponse: getBulkErrorResponse,
      addErrorWithTrackingID: addErrorWithTrackingID
    };

    return service;

    ////////////////

    function getCsvStat() {
      return csvStat;
    }

    function setCsvStat(csvObject, resetArray) {
      _.assign(csvStat, csvObject, function (a, b) {
        if (_.isArray(a)) {
          if (resetArray) {
            return b;
          } else {
            return a.concat(b);
          }
        } else {
          return b;
        }
      });
    }

    function getBulkErrorResponse(status, messageCode, email) {
      var responseMessage;
      messageCode = messageCode || '';
      email = email || '';

      if (status === 400) {
        if (messageCode === '400087') {
          responseMessage = $translate.instant('usersPage.hybridServicesError');
        } else if (messageCode === '400094') {
          responseMessage = $translate.instant('usersPage.hybridServicesComboError');
        } else {
          responseMessage = $translate.instant('firstTimeWizard.bulk400Error');
        }
      } else if (status === 401) {
        responseMessage = $translate.instant('firstTimeWizard.bulk401And403Error');
      } else if (status === 403) {
        if (messageCode === '400081') {
          responseMessage = $translate.instant('usersPage.userExistsError', {
            email: email
          });
        } else if (messageCode === '400084' || messageCode === '400091') {
          responseMessage = $translate.instant('usersPage.claimedDomainError', {
            email: email,
            domain: email.split('@')[1]
          });
        } else if (messageCode === '400090') {
          responseMessage = $translate.instant('usersPage.userExistsInDiffOrgError', {
            email: email
          });
        } else if (messageCode === '400096') {
          responseMessage = $translate.instant('firstTimeWizard.bulk403AndNotSetupManUserAddError', {
            email: email
          });
        } else {
          responseMessage = $translate.instant('firstTimeWizard.bulk401And403Error');
        }
      } else if (status === 404) {
        responseMessage = $translate.instant('firstTimeWizard.bulk404Error');
      } else if (status === 408 || status == 504) {
        responseMessage = $translate.instant('firstTimeWizard.bulk408Error');
      } else if (status === 409) {
        responseMessage = $translate.instant('firstTimeWizard.bulk409Error');
      } else if (status === 500) {
        responseMessage = $translate.instant('firstTimeWizard.bulk500Error');
      } else if (status === 502 || status === 503) {
        responseMessage = $translate.instant('firstTimeWizard.bulk502And503Error');
      } else if (status === -1) {
        if (messageCode === -1) {
          responseMessage = $translate.instant('firstTimeWizard.bulkCancelledErrorByUser', {
            email: email
          });
        } else {
          responseMessage = $translate.instant('firstTimeWizard.bulkCancelledErrorByServer', {
            email: email
          });
        }
      } else {
        responseMessage = $translate.instant('firstTimeWizard.processBulkError');
      }
      return responseMessage;
    }

    function addErrorWithTrackingID(errorMsg, response, headers) {
      var headersFunc = (response && response.headers) ? response.headers : headers;
      if (_.isFunction(headersFunc)) {
        if (errorMsg.length > 0 && !_.endsWith(errorMsg, '.')) {
          errorMsg += '.';
        }
        var trackingId = headersFunc('TrackingID');
        if (!trackingId || trackingId === 'null') {
          // If TrackingID is not allowed by CORS, fallback to TrackingId service
          errorMsg += ' TrackingID: ' + TrackingId.getWithoutSequence();
        } else {
          errorMsg += ' TrackingID: ' + trackingId;
        }
      }
      return errorMsg;
    }

  }
})();
