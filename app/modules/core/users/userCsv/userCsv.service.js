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
      addErrorWithTrackingID: addErrorWithTrackingID,
      chunkSizeWithSparkCall: 2,
      chunkSizeWithoutSparkCall: 10
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

      switch (status) {
      case 400:
        {
          switch (messageCode) {
          case ('400087'):
            {
              responseMessage = $translate.instant('usersPage.hybridServicesError');
              break;
            }
          case ('400094'):
            {
              responseMessage = $translate.instant('usersPage.hybridServicesComboError');
              break;
            }
          case ('400112'):
            {
              responseMessage = $translate.instant('usersPage.insufficientLicensesError');
              break;
            }
          default:
            {
              responseMessage = $translate.instant('firstTimeWizard.bulk400Error');
              break;
            }
          }
          break;
        }
      case 401:
        {
          responseMessage = $translate.instant('firstTimeWizard.bulk401And403Error');
          break;
        }
      case 403:
        {
          switch (messageCode) {
          case ('400081'):
            {
              responseMessage = $translate.instant('usersPage.userExistsError', {
                email: email
              });
              break;
            }
          case ('400084'):
          case ('400091'):
            {
              responseMessage = $translate.instant('usersPage.claimedDomainError', {
                email: email,
                domain: email.split('@')[1]
              });
              break;
            }
          case ('400090'):
            {
              responseMessage = $translate.instant('usersPage.userExistsInDiffOrgError', {
                email: email
              });
              break;
            }
          case ('400108'):
            {
              responseMessage = $translate.instant('usersPage.userExistsDomainClaimError', {
                email: email
              });
              break;
            }
          case ('400110'):
            {
              responseMessage = $translate.instant('usersPage.notSetupForManUserAddError', {
                email: email
              });
              break;
            }
          case ('400109'):
          case ('400096'):
            {
              responseMessage = $translate.instant('usersPage.unableToMigrateError', {
                email: email
              });
              break;
            }
          case ('400111'):
            {
              responseMessage = $translate.instant('usersPage.insufficientEntitlementsError', {
                email: email
              });
              break;
            }
          default:
            {
              responseMessage = $translate.instant('firstTimeWizard.bulk401And403Error');
              break;
            }
          }
          break;
        }
      case 404:
        {
          responseMessage = $translate.instant('firstTimeWizard.bulk404Error');
          break;
        }
      case 408:
      case 504:
        {
          responseMessage = $translate.instant('firstTimeWizard.bulk408Error');
          break;
        }
      case 409:
        {
          responseMessage = $translate.instant('firstTimeWizard.bulk409Error');
          break;
        }
      case 500:
        {
          responseMessage = $translate.instant('firstTimeWizard.bulk500Error');
          break;
        }
      case 502:
      case 503:
        {
          responseMessage = $translate.instant('firstTimeWizard.bulk502And503Error');
          break;
        }
      case -1:
        {
          if (messageCode === '0') {
            responseMessage = $translate.instant('firstTimeWizard.bulkCancelledErrorByUser', {
              email: email
            });
          } else {
            responseMessage = $translate.instant('firstTimeWizard.bulkCancelledErrorByServer', {
              email: email
            });
          }
          break;
        }
      default:
        {
          responseMessage = $translate.instant('firstTimeWizard.processBulkError');
          break;
        }
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
