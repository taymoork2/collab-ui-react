(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserCsvCtrl', UserCsvCtrl);

  /* @ngInject */
  function UserCsvCtrl($rootScope, $scope, $q, $translate, $timeout, $state, Config, UserCsvService, Notification, FeatureToggleService, Userservice, Orgservice, CsvDownloadService, LogMetricsService, NAME_DELIMITER, TelephoneNumberService) {
    // variables
    var vm = this;

    vm.isCancelledByUser = false;

    var maxUsers = 1100;
    var userArray = [];
    var isCsvValid = false;
    var cancelDeferred;
    var saveDeferred;
    var csvHeaders = null;
    var orgHeaders;
    CsvDownloadService.getCsv('headers').then(function (csvData) {
      orgHeaders = angular.copy(csvData.columns || []);
    }).catch(function (response) {
      Notification.errorResponse(response, 'firstTimeWizard.downloadHeadersError');
    });
    var isDirSync = false;
    FeatureToggleService.supportsDirSync().then(function (enabled) {
      isDirSync = enabled;
    });
    var csvChunk = 0; // Rate limit for Huron
    var csvPromise = $q.when();
    var tempUserArray = [];
    var uniqueEmails = [];
    var processingError;
    var headers;
    var idIndex;
    var isCalendarServiceEnabled = false;
    Orgservice.getHybridServiceAcknowledged().then(function (response) {
      if (response.status === 200) {
        _.forEach(response.data.items, function (item) {
          if (item.id === Config.entitlements.fusion_cal) {
            isCalendarServiceEnabled = item.enabled;
          }
        });
      }
    });
    var bulkStartLog = null;
    vm.model = {
      file: null,
      desc: null,
      templateAnchorText: null,
      exportErrorsAnchorText: null,
      enableRemove: false,
      uploadProgress: 0,
      isProcessing: false,
      numMaxUsers: 0,
      processProgress: 0,
      numTotalUsers: 0,
      numNewUsers: 0,
      numExistingUsers: 0,
      userArray: [],
      userErrorArray: []
    };
    vm.model.desc = $translate.instant("csvUpload.desc", {
      maxUsers: maxUsers
    });
    vm.model.templateAnchorText = $translate.instant("firstTimeWizard.downloadStep");
    vm.model.exportErrorsAnchorText = $translate.instant("csvUpload.exportErrors");

    // watches
    $scope.$watchCollection(function () {
      return vm.model.file;
    }, function () {
      $timeout(vm.validateCsv);
    });

    // scope functions
    vm.onFileSizeError = function () {
      Notification.error('firstTimeWizard.csvMaxSizeError');
      $scope.$digest();
    };

    vm.onFileTypeError = function () {
      Notification.error('firstTimeWizard.csvFileTypeError');
      $scope.$digest();
    };

    vm.resetFile = function () {
      vm.model.file = null;
    };

    vm.validateCsv = function () {
      setUploadProgress(0);
      isCsvValid = false;
      if (vm.model.file) {
        setUploadProgress(0);
        userArray = $.csv.toArrays(vm.model.file);
        if (_.isArray(userArray) && userArray.length > 0 && _.isArray(userArray[0])) {
          if (_.indexOf(userArray[0], 'User ID/Email (Required)') > -1) {
            csvHeaders = userArray.shift();
            if (userArray.length > 0 && userArray.length <= maxUsers) {
              isCsvValid = true;
            }
          }
        }
        setUploadProgress(100);
      }
    };

    vm.startUpload = function () {
      beforeSubmitCsv().then(function () {
        bulkSaveWithIndividualLicenses();
        $state.go('users.csv.results');
      });
    };

    vm.cancelProcessCsv = function () {
      vm.isCancelledByUser = true;
      cancelDeferred.resolve();
      saveDeferred.resolve();
      $scope.$broadcast('timer-stop');
    };

    // functions
    function beforeSubmitCsv() {
      return $q(function (resolve, reject) {
        if (isCsvValid) {
          resolve();
        } else {
          if (userArray.length > maxUsers) {
            Notification.error('firstTimeWizard.csvMaxLinesError', {
              max: String(maxUsers)
            });
          } else {
            Notification.error('firstTimeWizard.uploadCsvEmpty');
          }
          reject();
        }
      });
    }

    function setUploadProgress(percent) {
      vm.model.uploadProgress = percent;
      $scope.$digest();
    }

    function initBulkMetric() {
      bulkStartLog = moment();
    }

    function sendBulkMetric() {
      var eType = LogMetricsService.getEventType('bulkCsvUsers');
      var currentStepName = _.get($scope, 'wizard.current.step.name', 'csvResult');
      if (currentStepName === 'dirsyncResult') {
        eType = LogMetricsService.getEventType('bulkDirSyncUsers');
      }
      var data = {
        'newUsersCount': vm.model.numNewUsers || 0,
        'updatedUsersCount': vm.model.numExistingUsers || 0,
        'errorUsersCount': _.isArray(vm.model.userErrorArray) ? vm.model.userErrorArray.length : 0
      };
      LogMetricsService.logMetrics('Finished bulk processing', eType, LogMetricsService.getEventAction('buttonClick'), 200, bulkStartLog, 1, data);
    }

    function Feature(name, state) {
      return {
        entitlementName: name,
        entitlementState: state ? 'ACTIVE' : 'INACTIVE',
        properties: {}
      };
    }

    function LicenseFeature(name, bAdd) {
      return {
        id: name.toString(),
        idOperation: bAdd ? 'ADD' : 'REMOVE',
        properties: {}
      };
    }

    function isTrue(inputString) {
      var bTrue = false;
      if (_.isString(inputString)) {
        var inToUpper = inputString.toUpperCase();
        bTrue = (inToUpper === 'T' || inToUpper === 'TRUE');
      }
      return bTrue;
    }

    function isFalse(inputString) {
      var bFalse = false;
      if (_.isString(inputString)) {
        var inToUpper = inputString.toUpperCase();
        bFalse = (inToUpper === 'F' || inToUpper === 'FALSE');
      }
      return bFalse;
    }

    function hasSparkCallLicense(inHeaders) {
      var index = _.findIndex(inHeaders, function (h) {
        return h.name == 'Spark Call';
      });
      return index !== -1;
    }

    function addUserError(row, email, errorMsg) {
      $timeout(function () {
        vm.model.userErrorArray.push({
          row: row,
          email: email,
          error: errorMsg
        });
        UserCsvService.setCsvStat({
          userErrorArray: [{
            row: row,
            email: email,
            error: errorMsg
          }]
        });
      });
    }

    function addUserErrorWithTrackingID(row, email, errorMsg, response) {
      errorMsg = UserCsvService.addErrorWithTrackingID(errorMsg, response);
      addUserError(row, email, _.trim(errorMsg));
    }

    function calculateProcessProgress() {
      $timeout(function () {
        vm.model.numTotalUsers = vm.model.numNewUsers + vm.model.numExistingUsers + vm.model.userErrorArray.length;
        vm.model.processProgress = Math.round(vm.model.numTotalUsers / userArray.length * 100);
        UserCsvService.setCsvStat({
          numTotalUsers: vm.model.numTotalUsers,
          processProgress: vm.model.processProgress
        });

        if (vm.model.numTotalUsers >= userArray.length) {
          vm.model.userErrorArray.sort(function (a, b) {
            return a.row - b.row;
          });
          $rootScope.$broadcast('USER_LIST_UPDATED');
          vm.resetFile();
          vm.model.isProcessing = false;
          UserCsvService.setCsvStat({
            isProcessing: false
          });
          $scope.$broadcast('timer-stop');
          sendBulkMetric();
          saveDeferred.resolve();
        }
      });
    }

    function isValidDID(value) {
      if (value) {
        try {
          return TelephoneNumberService.validateDID(value);
        } catch (e) {
          return false;
        }
      }
      return true;
    }

    function findHeaderIndex(name) {
      return _.findIndex(headers, function (h) {
        return h.name == name;
      });
    }

    function generateHeaders(serverHeaders, userHeaders) {
      var returnHeaders = [];
      var index = -1;
      if (!serverHeaders || !userHeaders) {
        return [];
      } else {
        _.forEach(userHeaders, function (uHeader) {
          index = _.findIndex(serverHeaders, function (sHeader) {
            return sHeader.name == uHeader;
          });
          if (index !== -1) {
            returnHeaders.push(serverHeaders[index]);
          }
        });
      }
      return returnHeaders || [];
    }

    function bulkSaveWithIndividualLicenses() {
      function successCallback(response, startIndex, length) {
        if (_.isArray(response.data.userResponse)) {
          var addedUsersList = [];

          _.forEach(response.data.userResponse, function (user, index) {
            if (user.httpStatus === 200 || user.httpStatus === 201) {
              if (user.httpStatus === 200) {
                $timeout(function () {
                  vm.model.numExistingUsers++;
                  UserCsvService.setCsvStat({
                    numExistingUsers: vm.model.numExistingUsers
                  });
                });
              } else {
                $timeout(function () {
                  vm.model.numNewUsers++;
                  UserCsvService.setCsvStat({
                    numNewUsers: vm.model.numNewUsers
                  });
                });
              }
              // Build list of successful onboards and patches
              var addItem = {
                address: user.email
              };
              if (addItem.address.length > 0) {
                addedUsersList.push(addItem);
              }
            } else {
              addUserErrorWithTrackingID(startIndex + index + 1, userArray[startIndex + index][idIndex], UserCsvService.getBulkErrorResponse(user.httpStatus, user.message, user.email), response);
            }
          });
        } else {
          for (var i = 0; i < length; i++) {
            addUserErrorWithTrackingID(startIndex + i + 1, userArray[startIndex + i][idIndex], $translate.instant('firstTimeWizard.processBulkResponseError'), response);
          }
        }
      }

      function errorCallback(response, startIndex, length) {
        for (var k = 0; k < length; k++) {
          addUserErrorWithTrackingID(
            startIndex + k + 1,
            userArray[startIndex + k][idIndex],
            UserCsvService.getBulkErrorResponse(
              response.status,
              vm.isCancelledByUser ? '0' : '1',
              userArray[startIndex + k][idIndex]
            ),
            response
          );
        }
      }

      function onboardCsvUsers(startIndex, userArray, csvPromise) {
        return csvPromise.then(function () {
          return $q(function (resolve, reject) {
            if (userArray.length > 0) {
              Userservice.bulkOnboardUsers(userArray, cancelDeferred.promise).then(function (response) {
                successCallback(response, startIndex - userArray.length + 1, userArray.length);
              }).catch(function (response) {
                errorCallback(response, startIndex - userArray.length + 1, userArray.length);
              }).finally(function () {
                calculateProcessProgress();
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      }

      function processCsvRows() {
        vm.isCancelledByUser = false;
        headers = generateHeaders(orgHeaders || null, csvHeaders || null);
        idIndex = findHeaderIndex('User ID/Email (Required)');
        csvChunk = hasSparkCallLicense(headers) ? 2 : 10; // Rate limit for Huron

        // TODO
        // deal with AUDP -- only one column - Phone Number

        _.forEach(userArray, function (userRow, j) {
          processingError = false;
          var firstName = '',
            lastName = '',
            displayName = '',
            id = '';
          var directoryNumber = '',
            directLine = '';
          var idxDirectoryNumber = -1,
            idxDirectLine = -1;
          var licenseList = [];
          var entitleList = [];
          var numOfActiveMessageLicenses = 0;
          var isWrongLicenseFormat = false;

          // If we haven't met the chunk size, process the next user
          if (tempUserArray.length < csvChunk) {
            // Basic data
            firstName = _.trim(userRow[findHeaderIndex('First Name')]);
            lastName = _.trim(userRow[findHeaderIndex('Last Name')]);
            displayName = _.trim(userRow[findHeaderIndex('Display Name')]);
            id = _.trim(userRow[idIndex]);
            idxDirectoryNumber = findHeaderIndex('Directory Number');
            if (idxDirectoryNumber !== -1) {
              directoryNumber = _.trim(userRow[idxDirectoryNumber]);
            }
            idxDirectLine = findHeaderIndex('Direct Line');
            if (idxDirectLine !== -1) {
              directLine = _.trim(userRow[idxDirectLine]);
            }
            licenseList = [];
            entitleList = [];

            // validations
            if (!id) {
              // Report required field is missing
              processingError = true;
              addUserError(j + 1, id, $translate.instant('firstTimeWizard.csvRequiredEmail'));
            } else if (_.contains(uniqueEmails, id)) {
              // Report a duplicate email
              processingError = true;
              addUserError(j + 1, id, $translate.instant('firstTimeWizard.csvDuplicateEmail'));
            } else if (directLine && !isValidDID(directLine)) {
              // Report an invalid DID format
              processingError = true;
              addUserError(j + 1, id, $translate.instant('firstTimeWizard.bulkInvalidDID'));
            } else {
              // get license and entitlements
              _.forEach(headers, function (header, k) {
                var input = _.trim(userRow[k]);
                if (header.license) { // if this is a license column
                  if (isTrue(input)) {
                    licenseList.push(new LicenseFeature(header.license, true));
                    // Check Active Spark Message
                    if (header.name.toUpperCase().indexOf('SPARK MESSAGE') !== -1) {
                      numOfActiveMessageLicenses++;
                    }
                  } else if (isFalse(input)) {
                    if (vm.model.enableRemove) {
                      licenseList.push(new LicenseFeature(header.license, false));
                    }
                  } else if (input !== '') {
                    isWrongLicenseFormat = true;
                  }
                } else if (_.isArray(header.entitlements) && header.entitlements.length > 0) {
                  if (isTrue(input) || isFalse(input)) {
                    _.forEach(header.entitlements, function (entitlement) {
                      // if lincense is Calendar Service, only process if it is enabled
                      if (entitlement.toUpperCase().indexOf('SQUAREDFUSIONCAL') === -1 || isCalendarServiceEnabled) {
                        if (isTrue(input)) {
                          entitleList.push(new Feature(entitlement, true));
                        } else if (isFalse(input)) {
                          if (vm.model.enableRemove) {
                            entitleList.push(new Feature(entitlement, false));
                          }
                        }
                      }
                    });
                  } else if (input != '') {
                    isWrongLicenseFormat = true;
                  }
                }
              });

              if (isWrongLicenseFormat) {
                processingError = true;
                addUserError(j + 1, id, $translate.instant('firstTimeWizard.csvWrongLicenseFormat'));
              } else if (numOfActiveMessageLicenses > 1) {
                processingError = true;
                addUserError(j + 1, id, $translate.instant('firstTimeWizard.tooManyActiveMessageLicenses'));
              } else {
                uniqueEmails.push(id);
                // Do not send name and displayName if it's a DirSync org
                if (isDirSync) {
                  firstName = '';
                  lastName = '';
                  displayName = '';
                }
                tempUserArray.push({
                  'address': id,
                  'name': firstName + NAME_DELIMITER + lastName,
                  'displayName': displayName,
                  'internalExtension': directoryNumber,
                  'directLine': directLine,
                  'licenses': licenseList,
                  'entitlements': entitleList
                });
              }
            }
          }

          // Onboard all the previous users in the temp array if there was an error processing a row
          if (processingError) {
            csvPromise = onboardCsvUsers(j - 1, tempUserArray, csvPromise);
            tempUserArray = [];
          } else if (tempUserArray.length === csvChunk || j === (userArray.length - 1)) {
            // Onboard the current temp array if we've met the chunk size or is the last user in list
            csvPromise = onboardCsvUsers(j, tempUserArray, csvPromise);
            tempUserArray = [];
          }

          calculateProcessProgress();
        });
      }

      csvChunk = 0;
      csvPromise = $q.when();
      tempUserArray = [];
      uniqueEmails = [];

      saveDeferred = $q.defer();
      cancelDeferred = $q.defer();
      vm.model.isProcessing = true;
      vm.model.userErrorArray = [];
      vm.model.numMaxUsers = userArray.length;
      vm.model.processProgress = vm.model.numTotalUsers = vm.model.numNewUsers = vm.model.numExistingUsers = 0;
      UserCsvService.setCsvStat({
        isProcessing: true,
        numMaxUsers: userArray.length,
        processProgress: 0,
        numTotalUsers: 0,
        numNewUsers: 0,
        numExistingUsers: 0,
        userArray: userArray,
        userErrorArray: []
      }, true);

      initBulkMetric();
      processCsvRows();

      return saveDeferred.promise;
    }

    // wizard hooks
    vm.csvUploadNext = beforeSubmitCsv;
    vm.csvProcessingNext = bulkSaveWithIndividualLicenses;

  }
})();
