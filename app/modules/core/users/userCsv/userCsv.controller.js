(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserCsvCtrl', UserCsvCtrl);

  /* @ngInject */
  function UserCsvCtrl($rootScope, $scope, $q, $translate, $timeout, $interval, $state, Config, UserCsvService, Notification, FeatureToggleService, Userservice, Orgservice, CsvDownloadService, LogMetricsService, NAME_DELIMITER, TelephoneNumberService, HuronCustomer) {
    // variables
    var vm = this;

    vm.isCancelledByUser = false;

    var maxUsers = 1100;
    var csvUsersArray = [];
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
    var csvPromiseChain = $q.when();
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
    var hasVoicemailService = false;
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

      numRetriesToAttempt: 3,
      retryAfter: null,
      retryAfterDefault: 60 * 1000,
      retryTimer: 0,
      usersToRetry: [],
      isRetrying: false,

      userArray: [],
      userErrorArray: [],
      csvChunk: 0
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
        csvUsersArray = $.csv.toArrays(vm.model.file);
        if (_.isArray(csvUsersArray) && csvUsersArray.length > 0 && _.isArray(csvUsersArray[0])) {
          if (_.indexOf(csvUsersArray[0], 'User ID/Email (Required)') > -1) {
            csvHeaders = csvUsersArray.shift();
            if (csvUsersArray.length > 0 && csvUsersArray.length <= maxUsers) {
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
          if (csvUsersArray.length > maxUsers) {
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

    function hasSparkCallVoicemailService() {
      hasVoicemailService = false;
      return HuronCustomer.get().then(function (customer) {
          _.forEach(customer.links, function (service) {
            if (service.rel === 'voicemail') {
              hasVoicemailService = true;
            }
          });
        })
        .catch(function (response) {
          hasVoicemailService = false;
        });
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
        vm.model.processProgress = Math.round(vm.model.numTotalUsers / csvUsersArray.length * 100);
        UserCsvService.setCsvStat({
          numTotalUsers: vm.model.numTotalUsers,
          processProgress: vm.model.processProgress
        });

        if (vm.model.numTotalUsers >= csvUsersArray.length) {
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

      // received successful result from Userservice.bulkOnboardUsers
      // NOTE: must check httpStatus to see if onboard succeeded for each user)
      function successCallback(response, onboardedUsers) {

        function onboardedUserWithEmail(email) {
          return _.find(onboardedUsers, {
            'address': email
          });
        }

        if (_.isArray(response.data.userResponse)) {
          var addedUsersList = [];
          var onboardUser = null;

          _.forEach(response.data.userResponse, function (user, index) {
            onboardUser = onboardedUserWithEmail(user.email);

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
            } else if ((user.httpStatus === 503 || user.httpStatus === 429) && vm.model.numRetriesToAttempt > 0) {
              // service unavailable or we tried to add too many users too quickly.  Add this
              // user to a retry list so we can retry adding again later
              vm.model.retryAfter = vm.model.retryAfterDefault;

              if (onboardUser) {
                vm.model.usersToRetry.push(onboardUser);
              } else {
                // can't find this user in the original list, so error
                addUserErrorWithTrackingID(-1, user.email, UserCsvService.getBulkErrorResponse(user.httpStatus, user.message, user.email), response);
              }
            } else {
              addUserErrorWithTrackingID(onboardUser.csvRow, onboardUser.email, UserCsvService.getBulkErrorResponse(user.httpStatus, user.message, user.email), response);
            }
          });
        } else {
          // for some reason the userResponse is incorrect.  We need to error every user.
          _.forEach(onboardedUsers, function (user, idx) {
            addUserErrorWithTrackingID(user.csvRow, user.email, $translate.instant('firstTimeWizard.processBulkResponseError'), response);
          });
        }
      }

      // Error in the call to Userservice.bulkOnboardUsers
      // if 429 or 503, we need to retry the whole set of users
      function errorCallback(response, onboardedUsers) {

        if (response.status === 503 || response.status === 429 && vm.model.numRetriesToAttempt > 0) {
          // need to retry this set of users
          vm.model.retryAfter = response.headers('retry-after') || vm.model.retryAfterDefault;

          _.forEach(onboardedUsers, function (user, index) {
            vm.model.usersToRetry.push(user);
          });
        } else {
          // fatal error.  flag all users as having an error
          _.forEach(onboardedUsers, function (user, index) {
            addUserErrorWithTrackingID(
              user.csvRow,
              user.email,
              UserCsvService.getBulkErrorResponse(
                response.status,
                vm.isCancelledByUser ? '0' : '1',
                user.email
              ),
              response
            );
          });
        }
      }

      /**
       * Schedules bulk onboarding of users after the passed promise has resolved.
       * Returns a new promise that resolves once these users have been onboarded (or error)
       */
      function onboardCsvUsers(usersToOnboard, csvPromise) {
        return csvPromise.then(function () {
          return $q(function (resolve, reject) {
            if (usersToOnboard.length > 0) {
              Userservice.bulkOnboardUsers(usersToOnboard, cancelDeferred.promise).then(function (response) {
                successCallback(response, usersToOnboard);
              }).catch(function (response) {
                errorCallback(response, usersToOnboard);
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

      function processCsvRow(userRow, csvRowIndex) {
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
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.csvRequiredEmail'));
        } else if (_.contains(uniqueEmails, id)) {
          // Report a duplicate email
          processingError = true;
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.csvDuplicateEmail'));
        } else if (directLine && !isValidDID(directLine)) {
          // Report an invalid DID format
          processingError = true;
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.bulkInvalidDID'));
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
              } else if (input !== '') {
                isWrongLicenseFormat = true;
              }
            }
          });

          if (isWrongLicenseFormat) {
            processingError = true;
            addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.csvWrongLicenseFormat'));
          } else if (numOfActiveMessageLicenses > 1) {
            processingError = true;
            addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.tooManyActiveMessageLicenses'));
          } else {
            uniqueEmails.push(id);
            // Do not send name and displayName if it's a DirSync org
            if (isDirSync) {
              firstName = '';
              lastName = '';
              displayName = '';
            }
          }

          if (!processingError) {
            return {
              'csvRow': csvRowIndex,
              'address': id,
              'name': firstName + NAME_DELIMITER + lastName,
              'displayName': displayName,
              'internalExtension': directoryNumber,
              'directLine': directLine,
              'licenses': licenseList,
              'entitlements': entitleList
            };
          } else {
            return null;
          }
        }

      }

      /**
       * Process all of the pending csv rows in userArray and onboard all of the
       * users that are correctly defined.
       */
      function processCsvRows() {

        vm.isCancelledByUser = false;

        headers = generateHeaders(orgHeaders || null, csvHeaders || null);
        idIndex = findHeaderIndex('User ID/Email (Required)');

        var tempUserArray = [];

        // TODO
        // deal with AUDP -- only one column - Phone Number

        _.forEach(csvUsersArray, function (userRow, idx) {

          // note: the idx is 0-based, and the first row in the csv is the header, so we need
          // to add 2 to the array index to get the csv row.
          var userData = processCsvRow(userRow, idx + 2);
          if (userData) {
            // parsed CSV data successfully.  Add to array of users to bulk-add
            tempUserArray.push(userData);
          }

          if (tempUserArray.length === vm.model.csvChunk || idx === (csvUsersArray.length - 1)) {
            // We filled out chunk or this is the last user. Process the bulk onboard
            // we pass idx since this is used for reference to original CSV in error reporting
            csvPromiseChain = onboardCsvUsers(tempUserArray, csvPromiseChain);
            tempUserArray = [];
          }

          calculateProcessProgress();
        });

        csvPromiseChain.then(processRetryUsers);
      }

      function msToTime(millisec) {
        return {
          seconds: millisec / 1e3 % 60 | 0,
          minutes: millisec / 6e4 % 60 | 0,
          hours: millisec / 36e5 % 24 | 0
        };
      }

      /**
       * Process all of the users that need onboarding retried
       */
      function processRetryUsers() {
        return $q(function (resolve, reject) {

          vm.model.numRetriesToAttempt--;

          if (vm.model.usersToRetry.length === 0) {
            resolve();
          } else {
            vm.model.retryTimer = vm.model.retryAfter;
            vm.model.isRetrying = true;
            vm.model.retryTimerParts = msToTime(vm.model.retryTimer);

            var ip = $interval(function () {

              vm.model.retryTimer -= 1000;
              vm.model.retryTimerParts = msToTime(vm.model.retryTimer);

              if (vm.model.retryTimer <= 0) {

                vm.model.isRetrying = false;
                $interval.cancel(ip);

                var retryPromises = $q.when();
                var tempUserArray = [];
                var users = vm.model.usersToRetry;
                vm.model.usersToRetry = [];
                _.forEach(users, function (userData, idx) {
                  tempUserArray.push(userData);

                  if (tempUserArray.length === vm.model.csvChunk || idx === (users.length - 1)) {
                    retryPromises = onboardCsvUsers(tempUserArray, retryPromises);
                    tempUserArray = [];
                  }

                  calculateProcessProgress();
                });

                retryPromises.then(function () {
                  processRetryUsers().then(resolve);
                });
              }
              calculateProcessProgress();
            }, 1000);
          }
        });
      }

      vm.model.csvChunk = 0;
      csvPromiseChain = $q.when();
      uniqueEmails = [];

      saveDeferred = $q.defer();
      cancelDeferred = $q.defer();
      vm.model.isProcessing = true;
      vm.model.userErrorArray = [];
      vm.model.numMaxUsers = csvUsersArray.length;
      vm.model.usersToRetry = [];
      vm.model.isRetrying = false;

      vm.model.processProgress = vm.model.numTotalUsers = vm.model.numNewUsers = vm.model.numExistingUsers = 0;
      UserCsvService.setCsvStat({
        isProcessing: true,
        numMaxUsers: csvUsersArray.length,
        processProgress: 0,
        numTotalUsers: 0,
        numNewUsers: 0,
        numExistingUsers: 0,
        userArray: csvUsersArray,
        userErrorArray: []
      }, true);

      initBulkMetric();
      hasSparkCallVoicemailService().then(function () {
        vm.model.csvChunk = hasVoicemailService ? UserCsvService.chunkSizeWithSparkCall : UserCsvService.chunkSizeWithoutSparkCall; // Rate limit for Huron
        processCsvRows();
      });

      return saveDeferred.promise;
    }

    // wizard hooks
    vm.csvUploadNext = beforeSubmitCsv;
    vm.csvProcessingNext = bulkSaveWithIndividualLicenses;

  }
})();
