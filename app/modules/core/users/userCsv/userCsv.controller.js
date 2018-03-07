require('./_user-csv.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserCsvCtrl', UserCsvCtrl);

  /* @ngInject */
  function UserCsvCtrl($interval, $modal, $q, $rootScope, $scope, $state, $timeout, $translate, $previousState,
    Analytics, Authinfo, Config, CsvDownloadService, HuronCustomer, LogMetricsService, NAME_DELIMITER, OnboardService,
    Notification, ServiceDescriptorService, PhoneNumberService, UserCsvService, Userservice, ResourceGroupService, USSService, DirSyncService,
    FeatureToggleService) {
    // variables
    var vm = this;
    vm.licenseUnavailable = false;
    vm.isCancelledByUser = false;
    vm.isExporting = false;
    vm.isCsvValid = false;
    vm.handleHybridServicesResourceGroups = false;
    vm.hybridServicesUserProps = [];
    vm.isLoading = true;

    var maxUsers = UserCsvService.maxUsersInCSV;
    var csvUsersArray = [];
    var cancelDeferred;
    var saveDeferred;
    var csvHeaders = null;
    var orgHeaders;
    var renamedHeaders = {
      'Calendar Service': 'Hybrid Calendar Service (Exchange)',
    };
    var mutuallyExclusiveCalendarEntitlements = {
      squaredFusionCal: 'squaredFusionGCal',
      squaredFusionGCal: 'squaredFusionCal',
    };
    var USER_ID_EMAIL_HEADER = 'User ID/Email (Required)';
    var NO_RESOURCE_GROUP = '**no resource group**';

    var isAtlasCsvImportTaskManagerToggled = false;
    var isAtlasUserCsvSubscriptionEnabled = false;
    $q.all({
      isAtlasCsvImportTaskManagerToggled: FeatureToggleService.atlasCsvImportTaskManagerGetStatus(),
      isAtlasUserCsvSubscriptionEnabled: FeatureToggleService.atlasUserCsvSubscriptionEnableGetStatus(),
      headers: CsvDownloadService.getCsv('headers'),
    }).then(function (promiseData) {
      isAtlasCsvImportTaskManagerToggled = promiseData.isAtlasCsvImportTaskManagerToggled;
      isAtlasUserCsvSubscriptionEnabled = promiseData.isAtlasUserCsvSubscriptionEnabled;
      orgHeaders = _.cloneDeep(promiseData.headers.columns || []);
    }).finally(function () {
      vm.isLoading = false;
    });

    vm.isDirSyncEnabled = DirSyncService.isDirSyncEnabled();
    if (DirSyncService.requiresRefresh()) {
      DirSyncService.refreshStatus().then(function () {
        vm.isDirSyncEnabled = DirSyncService.isDirSyncEnabled();
      });
    }

    var csvPromiseChain = $q.resolve();
    var uniqueEmails = [];
    var processingError;
    var headers;
    var idIndex;
    var isCalendarServiceEnabled = false;
    var isCalendarOrCallServiceEntitled = false;

    ServiceDescriptorService.getServices()
      .then(function (services) {
        _.forEach(services, function (service) {
          if (service.id === Config.entitlements.fusion_cal) {
            isCalendarServiceEnabled = service.enabled;
            isCalendarOrCallServiceEntitled = true;
          } else if (service.id === Config.entitlements.fusion_uc) {
            isCalendarOrCallServiceEntitled = true;
          }
        });
        vm.handleHybridServicesResourceGroups = isCalendarOrCallServiceEntitled;
      });

    var bulkStartLog = null;
    var hasVoicemailService = false;
    vm.model = {
      file: null,
      desc: null,
      templateAnchorText: null,
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
      csvChunk: 0,
    };
    vm.model.templateAnchorText = $translate.instant('firstTimeWizard.downloadStep');

    // watches
    $scope.$watch(function () {
      return vm.model.file;
    }, function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $timeout(vm.validateCsv);
      }
    });

    // see if there is already a download started. if so, continue with that download
    if (CsvDownloadService.downloadInProgress) {
      $timeout(function () {
        $rootScope.$emit('csv-download-request-started');
      });
    }

    // controller functions
    vm.onExportDownloadStatus = onExportDownloadStatus;

    vm.onFileSizeError = function () {
      Notification.error('firstTimeWizard.csvMaxSizeError');
    };

    vm.onFileTypeError = function () {
      Notification.error('firstTimeWizard.csvFileTypeError');
    };

    vm.resetFile = function () {
      vm.model.file = null;
    };

    vm.validateCsv = function () {
      setUploadProgress(0);
      vm.isCsvValid = false;

      try {
        if (!vm.model.file) {
          return;
        }
        csvUsersArray = $.csv.toArrays(vm.model.file);
        if (!_.isArray(csvUsersArray) || _.isEmpty(csvUsersArray) || !_.isArray(csvUsersArray[0])) {
          Notification.error('firstTimeWizard.uploadCsvBadFormat');
          vm.resetFile();
        } else if (_.indexOf(csvUsersArray[0], USER_ID_EMAIL_HEADER) === -1) {
          Notification.error('firstTimeWizard.uploadCsvBadHeaders');
          vm.resetFile();
        } else {
          csvHeaders = csvUsersArray.shift();
          if (_.isEmpty(csvUsersArray) || _.size(csvUsersArray) > maxUsers) {
            warnCsvUserCount();
            vm.resetFile();
          } else {
            // check if header names don't match in multiple subscriptions
            var mismatchHeaderName = findMismatchHeader(orgHeaders, csvHeaders);
            if (mismatchHeaderName) {
              Notification.error('firstTimeWizard.csvHeaderNameMismatch', {
                name: mismatchHeaderName,
              });
              vm.resetFile();
            } else {
              vm.isCsvValid = true;
            }
          }
        }
      } catch (e) {
        Notification.error('firstTimeWizard.uploadCsvBadFormat');
        vm.resetFile();
      } finally {
        setUploadProgress(100);
      }
    };

    var rootState = $previousState.get().state.name;
    if (rootState === 'users.manage.emailSuppress') {
      rootState = 'users.manage.picker';
    }
    vm.onBack = function () {
      Analytics.trackAddUsers(Analytics.eventNames.BACK);
      $state.go(rootState);
    };

    vm.startUpload = function () {
      if (isAtlasCsvImportTaskManagerToggled) {
        $state.go('users.csv.task-manager', {
          job: {
            fileName: vm.model.fileName,
            fileData: vm.model.file,
            exactMatchCsv: vm.model.enableRemove,
          },
        });
      } else {
        Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD);
        beforeSubmitCsv().then(function () {
          bulkSaveWithIndividualLicenses();
          $state.go('users.csv.results');
        });
      }
    };

    $scope.$on('modal.closing', function (ev) {
      if (vm.model.isProcessing) {
        vm.onCancelImport();
        ev.preventDefault();
      }
    });

    vm.onCancelImport = function () {
      if (vm.model.isProcessing) {
        $modal.open({
          type: 'dialog',
          template: require('modules/core/users/userCsv/userCsvStopImportConfirm.tpl.html'),
        }).result.then(function () {
          // cancel the current import
          vm.cancelProcessCsv();
        });
      } else {
        Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
        $scope.$dismiss();
      }
    };

    vm.onDoneImport = function () {
      var analyticsData = {
        numberOfErrors: vm.model.userErrorArray.length,
        usersAdded: vm.model.numNewUsers,
        usersUpdated: vm.model.numExistingUsers,
      };
      Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.FINISH, null, analyticsData);
      $state.modal.dismiss();
    };

    vm.cancelProcessCsv = function () {
      vm.isCancelledByUser = true;
      cancelDeferred.resolve();
      saveDeferred.resolve();
      $scope.$broadcast('timer-stop');
    };

    vm.onCancelModal = function () {
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
      $state.modal.dismiss();
    };

    vm.licenseBulkErrorModal = function () {
      if (Authinfo.isOnline()) {
        $modal.open({
          type: 'dialog',
          template: require('modules/core/users/userCsv/licenseUnavailabilityModal.tpl.html'),
        }).result.then(function () {
          $state.go('my-company.subscriptions');
        });
      }
    };

    /////////////////////////////
    function onExportDownloadStatus(isExporting) {
      vm.isExporting = isExporting;
    }

    function warnCsvUserCount() {
      if (csvUsersArray.length > maxUsers) {
        Notification.error('firstTimeWizard.csvMaxLinesError', {
          max: String(maxUsers),
        });
      } else {
        Notification.error('firstTimeWizard.uploadCsvEmpty');
      }
    }

    // functions
    function beforeSubmitCsv() {
      return $q(function (resolve, reject) {
        if (vm.isCsvValid) {
          resolve();
        } else {
          warnCsvUserCount();
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
        newUsersCount: vm.model.numNewUsers || 0,
        updatedUsersCount: vm.model.numExistingUsers || 0,
        errorUsersCount: _.isArray(vm.model.userErrorArray) ? vm.model.userErrorArray.length : 0,
      };
      LogMetricsService.logMetrics('Finished bulk processing', eType, LogMetricsService.getEventAction('buttonClick'), 200, bulkStartLog, 1, data);
    }

    function Feature(name, state) {
      return {
        entitlementName: name,
        entitlementState: state ? 'ACTIVE' : 'INACTIVE',
        properties: {},
      };
    }

    function LicenseFeature(name, bAdd) {
      return {
        id: name.toString(),
        idOperation: bAdd ? 'ADD' : 'REMOVE',
        properties: {},
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
        .catch(function () {
          hasVoicemailService = false;
        });
    }

    function addUserError(row, email, errorMsg) {
      $timeout(function () {
        vm.model.userErrorArray.push({
          row: row,
          email: email,
          error: errorMsg,
        });
        UserCsvService.setCsvStat({
          userErrorArray: [{
            row: row,
            email: email,
            error: errorMsg,
          }],
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
        vm.model.processProgress = Math.round((vm.model.numTotalUsers / csvUsersArray.length) * 100);
        vm.model.importCompletedAt = Date.now();
        UserCsvService.setCsvStat({
          numTotalUsers: vm.model.numTotalUsers,
          processProgress: vm.model.processProgress,
        });

        if (vm.model.numTotalUsers >= csvUsersArray.length) {
          vm.model.userErrorArray.sort(function (a, b) {
            return a.row - b.row;
          });
          $rootScope.$broadcast('USER_LIST_UPDATED');
          vm.resetFile();
          vm.model.isProcessing = false;
          UserCsvService.setCsvStat({
            isProcessing: false,
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
          return PhoneNumberService.validateDID(value);
        } catch (e) {
          return false;
        }
      }
      return true;
    }

    function findHeaderIndex(name) {
      var index = _.findIndex(headers, function (h) {
        return h.name === name;
      });
      if (index !== -1) {
        return headers[index].csvColIndex;
      } else {
        return -1;
      }
    }

    function findMismatchHeader(serverHeaders, userHeaders) {
      if (!isAtlasUserCsvSubscriptionEnabled || !serverHeaders || !userHeaders) {
        return undefined;
      }

      // Find if there's any mis-matched header names
      return _.find(userHeaders, function (uHeader) {
        return !_.some(serverHeaders, function (sHeader) {
          return sHeader.name === uHeader || sHeader.name === renamedHeaders[uHeader];
        });
      });
    }

    function generateHeaders(serverHeaders, userHeaders) {
      var returnHeaders = [];
      var index = -1;
      if (!serverHeaders || !userHeaders) {
        return [];
      } else {
        _.forEach(userHeaders, function (uHeader, k) {
          index = _.findIndex(serverHeaders, function (sHeader) {
            return sHeader.name === uHeader || sHeader.name === renamedHeaders[uHeader];
          });
          if (index !== -1) {
            var h = serverHeaders[index];
            h.csvColIndex = k;
            returnHeaders.push(h);
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
          return _.find(onboardedUsers, function (user) {
            return _.toLower(user.address) === _.toLower(email);
          });
        }

        if (_.isArray(response.data.userResponse)) {
          var addedUsersList = [];
          var onboardUser = null;
          var onboardSuccessUsers = [];

          _.forEach(response.data.userResponse, function (user) {
            onboardUser = onboardedUserWithEmail(user.email);

            if (user.httpStatus === 200 || user.httpStatus === 201) {
              onboardUser.uuid = user.uuid;
              onboardSuccessUsers.push(onboardUser);
              if (user.message === '700000') {
                vm.licenseUnavailable = true;
              }
              if (user.httpStatus === 200) {
                $timeout(function () {
                  vm.model.numExistingUsers++;
                  UserCsvService.setCsvStat({
                    numExistingUsers: vm.model.numExistingUsers,
                  });
                });
              } else {
                $timeout(function () {
                  vm.model.numNewUsers++;
                  UserCsvService.setCsvStat({
                    numNewUsers: vm.model.numNewUsers,
                  });
                });
              }
              // Build list of successful onboards and patches
              var addItem = {
                address: user.email,
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
              addUserErrorWithTrackingID(onboardUser.csvRow, user.email, UserCsvService.getBulkErrorResponse(user.httpStatus, user.message, user.email), response);
            }
          });

          if (vm.handleHybridServicesResourceGroups) {
            updateResourceGroupsInUss(onboardSuccessUsers);
          }
        } else {
          // for some reason the userResponse is incorrect.  We need to error every user.
          _.forEach(onboardedUsers, function (user) {
            addUserErrorWithTrackingID(user.csvRow, user.email, $translate.instant('firstTimeWizard.processBulkResponseError'), response);
          });
        }
      }

      // Error in the call to Userservice.bulkOnboardUsers
      // if 429 or 503, we need to retry the whole set of users
      function errorCallback(response, onboardedUsers) {
        if ((response.status === 503 || response.status === 429) && vm.model.numRetriesToAttempt > 0) {
          // need to retry this set of users
          vm.model.retryAfter = response.headers('retry-after') || vm.model.retryAfterDefault;

          _.forEach(onboardedUsers, function (user) {
            vm.model.usersToRetry.push(user);
          });
        } else {
          // fatal error.  flag all users as having an error
          _.forEach(onboardedUsers, function (user) {
            var email = (user.email ? user.email : user.address);
            addUserErrorWithTrackingID(
              user.csvRow,
              email,
              UserCsvService.getBulkErrorResponse(
                response.status,
                vm.isCancelledByUser ? '0' : '1',
                email
              ),
              response
            );
          });
        }
      }

      function updateResourceGroupsInUss(users) {
        var updatedUserProps = [];
        _.forEach(users, function (user) {
          var currentProps = _.find(vm.hybridServicesUserProps, function (prop) {
            return prop.userId === user.uuid;
          });
          var calResourceGroupChanged = tweakResourceGroups(user, 'squared-fusion-cal', currentProps);
          var ucResourceGroupChanged = tweakResourceGroups(user, 'squared-fusion-uc', currentProps);
          if (calResourceGroupChanged || ucResourceGroupChanged) {
            updatedUserProps.push({ userId: user.uuid, resourceGroups: user.resourceGroups });
          }
        });
        if (updatedUserProps.length > 0) {
          USSService.updateBulkUserProps(updatedUserProps).catch(function (response) {
            _.forEach(users, function (user) {
              var email = (user.email ? user.email : user.address);
              addUserErrorWithTrackingID(user.csvRow, email, $translate.instant('firstTimeWizard.unableToUpdateResourceGroups'), response);
            });
          });
        }
      }

      function tweakResourceGroups(user, entitlement, currentProps) {
        var resourceGroupChanged = false;
        var newProps = user.resourceGroups[entitlement];
        if (newProps) {
          var oldProps = currentProps ? (currentProps.resourceGroups[entitlement] || NO_RESOURCE_GROUP) : NO_RESOURCE_GROUP;
          resourceGroupChanged = oldProps !== newProps;
          if (newProps === NO_RESOURCE_GROUP) {
            if (resourceGroupChanged) {
              user.resourceGroups[entitlement] = '';
            } else {
              delete user.resourceGroups[entitlement];
            }
          }
        }
        return resourceGroupChanged;
      }

      function getResourceGroup(name) {
        return _.find(vm.resourceGroups, function (group) {
          // Remove commas from the name as the CSV export will have stripped these
          return group.name && group.name.replace(/,/g, '') === name;
        });
      }

      /**
       * Schedules bulk onboarding of users after the passed promise has resolved.
       * Returns a new promise that resolves once these users have been onboarded (or error)
       */
      function onboardCsvUsers(usersToOnboard, csvPromise) {
        return csvPromise.then(function () {
          return $q(function (resolve) {
            if (usersToOnboard.length > 0) {
              Userservice.bulkOnboardUsers(usersToOnboard, cancelDeferred.promise).then(function (response) {
                successCallback(response, usersToOnboard);
              }).catch(function (response) {
                errorCallback(response, usersToOnboard);
              }).finally(function () {
                calculateProcessProgress();
                if (vm.licenseUnavailable) {
                  vm.licenseBulkErrorModal();
                }
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
        var firstName, lastName, displayName, id;
        var directoryNumber = '', directLine = '';
        var licenseList = [];
        var entitleList = [];
        var numOfActiveCallLicenses = 0;
        var isWrongLicenseFormat = false;
        var calendarServiceResourceGroup = null;
        var callServiceResourceGroup = null;

        // Basic data
        firstName = _.trim(userRow[findHeaderIndex('First Name')]);
        lastName = _.trim(userRow[findHeaderIndex('Last Name')]);
        displayName = _.trim(userRow[findHeaderIndex('Display Name')]);
        id = _.trim(userRow[idIndex]);
        var index = findHeaderIndex('Directory Number');
        if (index !== -1) {
          directoryNumber = _.trim(userRow[index]);
        }
        index = findHeaderIndex('Direct Line');
        if (index !== -1) {
          directLine = _.trim(userRow[index]);
        }
        if (vm.handleHybridServicesResourceGroups) {
          index = findHeaderIndex('Hybrid Calendar Service Resource Group');
          var resourceGroup;
          if (index !== -1) {
            calendarServiceResourceGroup = _.trim(userRow[index]);
            if (calendarServiceResourceGroup) {
              resourceGroup = getResourceGroup(calendarServiceResourceGroup);
              if (!resourceGroup) {
                processingError = true;
                addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.invalidCalendarServiceResourceGroup', {
                  group: calendarServiceResourceGroup,
                }));
              } else {
                calendarServiceResourceGroup = resourceGroup.id;
              }
            } else {
              calendarServiceResourceGroup = NO_RESOURCE_GROUP;
            }
          }
          index = findHeaderIndex('Hybrid Call Service Resource Group');
          if (index !== -1) {
            callServiceResourceGroup = _.trim(userRow[index]);
            if (callServiceResourceGroup) {
              resourceGroup = getResourceGroup(callServiceResourceGroup);
              if (!resourceGroup) {
                processingError = true;
                addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.invalidCallServiceResourceGroup', {
                  group: callServiceResourceGroup,
                }));
              } else {
                callServiceResourceGroup = resourceGroup.id;
              }
            } else {
              callServiceResourceGroup = NO_RESOURCE_GROUP;
            }
          }
        }
        licenseList = [];
        entitleList = [];

        // validations
        if (!id) {
          // Report required field is missing
          processingError = true;
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.csvRequiredEmail'));
        } else if (!OnboardService.validateEmail(id)) {
          // Report email field is invalid
          processingError = true;
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.invalidEmailAddress'));
        } else if (_.includes(uniqueEmails, id)) {
          // Report a duplicate email
          processingError = true;
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.csvDuplicateEmail'));
        } else if (directLine && !isValidDID(directLine)) {
          // Report an invalid DID format
          processingError = true;
          addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.bulkInvalidDID'));
        } else {
          // get license and entitlements
          _.forEach(headers, function (header) {
            var input = _.trim(userRow[header.csvColIndex]);
            if (header.license) { // if this is a license column
              if (isTrue(input)) {
                licenseList.push(new LicenseFeature(header.license, true));
                // Check Active Spark Call
                if (header.name.toUpperCase().indexOf('SPARK CALL') !== -1) {
                  numOfActiveCallLicenses++;
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
                      if (hasMutuallyExclusiveCalendarEntitlements(entitlement, entitleList)) {
                        processingError = true;
                        addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.mutuallyExclusiveCalendarEntitlements'));
                      } else {
                        entitleList.push(new Feature(entitlement, true));
                      }
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
          } else if (numOfActiveCallLicenses > 1) {
            processingError = true;
            addUserError(csvRowIndex, id, $translate.instant('firstTimeWizard.tooManyActiveSparkCallLicenses'));
          } else {
            uniqueEmails.push(id);
            // Do not send name and displayName if it's a DirSync org
            if (vm.isDirSyncEnabled) {
              firstName = '';
              lastName = '';
              displayName = '';
            }
          }

          if (!processingError) {
            var user = {
              csvRow: csvRowIndex,
              address: id,
              name: firstName + NAME_DELIMITER + lastName,
              displayName: displayName,
              internalExtension: directoryNumber,
              directLine: directLine,
              licenses: licenseList,
              entitlements: entitleList,
              onboardMethod: 'CSV',
            };
            if (vm.handleHybridServicesResourceGroups) {
              user.resourceGroups = {};
              if (calendarServiceResourceGroup) {
                user.resourceGroups['squared-fusion-cal'] = calendarServiceResourceGroup;
              }
              if (callServiceResourceGroup) {
                user.resourceGroups['squared-fusion-uc'] = callServiceResourceGroup;
              }
            }
            return user;
          } else {
            return null;
          }
        }
      }

      /**
       * We only allow squared-fusion-cal OR squared-fusion-gcal entitlement to be set per user
       */
      function hasMutuallyExclusiveCalendarEntitlements(entitlement, currentFeatureList) {
        var badEntitlement = mutuallyExclusiveCalendarEntitlements[entitlement];
        if (!badEntitlement) {
          return false;
        }
        return _.some(currentFeatureList, function (feature) {
          return feature.entitlementName === badEntitlement && feature.entitlementState === 'ACTIVE';
        });
      }

      /**
       * Process all of the pending csv rows in userArray and onboard all of the
       * users that are correctly defined.
       */
      function processCsvRows() {
        vm.isCancelledByUser = false;

        headers = generateHeaders(orgHeaders || null, csvHeaders || null);
        idIndex = findHeaderIndex(USER_ID_EMAIL_HEADER);

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
            // this event is picked up by idleTimeoutService to keep the user logged in
            $rootScope.$emit(Config.idleTabKeepAliveEvent);
            tempUserArray = [];
          }

          calculateProcessProgress();
        });

        csvPromiseChain.then(processRetryUsers);
      }

      function msToTime(millisec) {
        return {
          seconds: (millisec / 1e3) % 60 | 0,
          minutes: (millisec / 6e4) % 60 | 0,
          hours: (millisec / 36e5) % 24 | 0,
        };
      }

      /**
       * Process all of the users that need onboarding retried
       */
      function processRetryUsers() {
        return $q(function (resolve) {
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

                var retryPromises = $q.resolve();
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
      csvPromiseChain = $q.resolve();
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
        userErrorArray: [],
      }, true);

      initBulkMetric();
      hasSparkCallVoicemailService().then(function () {
        vm.model.csvChunk = hasVoicemailService ? UserCsvService.chunkSizeWithSparkCall : UserCsvService.chunkSizeWithoutSparkCall; // Rate limit for Huron
        if (vm.handleHybridServicesResourceGroups) {
          USSService.getAllUserProps().then(function (userProps) {
            vm.hybridServicesUserProps = userProps;
            ResourceGroupService.getAll().then(function (resourceGroups) {
              vm.resourceGroups = resourceGroups;
            }).catch(function (response) {
              vm.handleHybridServicesResourceGroups = false;
              Notification.errorResponse(response, 'firstTimeWizard.fmsResourceGroupsLoadFailed');
            }).finally(function () {
              processCsvRows();
            });
          }).catch(function (response) {
            vm.handleHybridServicesResourceGroups = false;
            Notification.errorResponse(response, 'firstTimeWizard.ussUserPropsLoadFailed');
            processCsvRows();
          });
        } else {
          processCsvRows();
        }
      });

      return saveDeferred.promise;
    }

    // wizard hooks
    vm.csvUploadNext = beforeSubmitCsv;
    vm.csvProcessingNext = bulkSaveWithIndividualLicenses;
  }
})();
