
(function () {
  'use strict';

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  module.exports = EdiscoverySearchController;
  /* @ngInject */
  function EdiscoverySearchController($q, $scope, $stateParams, $translate, $timeout, $window, Analytics, Authinfo, EdiscoveryService, EdiscoveryNotificationService,
    FeatureToggleService, ProPackService, Notification) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant('ediscovery.browserTabHeaderTitle');
    });
    var vm = this;
    var spark;
    var avalonPoller;

    /* Search Page Functions */
    vm.showHover = showHover;
    vm.getProPackTooltip = getProPackTooltip;
    vm.searchByLimit = searchByLimit;
    vm.searchByParameters = searchByParameters;
    vm.advancedSearch = advancedSearch;
    vm.dateErrors = dateErrors;
    vm.validateDate = validateDate;
    vm.splitWords = splitWords;
    vm.firstEnabledDate = null;
    vm.lastEnabledDate = moment().format('YYYY-MM-DD');

    /* Report Generation Functions */
    vm.createReport = createReport;
    vm.generateReport = generateReport;
    vm.reportProgress = reportProgress;
    vm.downloadReport = downloadReport;
    vm.cancelReport = cancelReport;
    vm.keyPressHandler = keyPressHandler;
    vm.searchButtonDisabled = searchButtonDisabled;
    vm.retrySearch = retrySearch;
    vm.resetSearchPageToInitialState = resetSearchPageToInitialState;
    vm.createReportInProgress = false;
    vm.searchingForRoom = false;
    vm.searchInProgress = false;
    vm.currentReportId = null;
    vm.ongoingSearch = false;
    vm.proPackPurchased = false;
    vm.proPackEnabled = false;

    /* initial search variables page */
    vm.searchPlaceholder = $translate.instant('ediscovery.searchParameters.searchEmailPlaceholder');
    vm.searchHelpText = $translate.instant('ediscovery.searchParameters.searchEmailHelpText');
    vm.searchByOptions = ['Email Address', 'Space ID'];
    vm.searchBySelected = '' || vm.searchByOptions[0];
    vm.searchModel = null;
    vm.queryModel = null;
    vm.limitErrorMessage = null;
    vm.searchLimit = 5;
    vm.searchCriteria = {};

    vm.searchResults = {
      keywords: [],
      queries: [],
      numFiles: null,
      numMessages: null,
      totalSize: null,
    };

    /* Encrypted Search Variables */
    vm.encryptionKeyUrl = '';
    vm.encryptedEmails = null;
    vm.unencryptedRoomIds = null;
    vm.encryptedQuery = null;

    /* generate report status pages */
    vm.isReport = true;
    vm.isReportGenerating = false;
    vm.isReportComplete = false;
    vm.isReportTooBig = false;
    vm.isReportMaxRooms = false;
    vm.report = null;

    vm.generateDescription = null;
    vm.exportOptions = ['JSON'];
    vm.exportSelected = '' || vm.exportOptions[0];

    init($stateParams.report, $stateParams.reRun);

    $scope.$on('$destroy', function () {
      disableAvalonPolling();
    });

    function init(report, reRun) {
      vm.report = null;
      vm.error = null;
      vm.warning = null;

      $q.all({
        proPackEnabled: ProPackService.hasProPackEnabled(),
        proPackPurchased: ProPackService.hasProPackPurchased(),
        searchLimit: FeatureToggleService.atlasF3346EdiscoverySearchLimitGetStatus(),
      }
      ).then(function (toggles) {
        vm.proPackEnabled = toggles.proPackEnabled;
        vm.proPackPurchased = toggles.proPackPurchased;
        if (!vm.proPackPurchased) {
          vm.firstEnabledDate = moment().subtract(90, 'days').format('YYYY-MM-DD');
        }
        if (!_.isNaN(parseInt(toggles.searchLimit, 10))) {
          vm.searchLimit = toggles.searchLimit;
        }
      });

      if (report) {
        vm.roomInfo = {
          id: report.roomQuery.roomId,
          displayName: report.displayName,
        };
        vm.searchCriteria = {
          roomId: report.roomQuery.roomId,
          startDate: report.roomQuery.startDate,
          endDate: report.roomQuery.endDate,
          displayName: report.displayName,
        };
        if (!reRun) {
          vm.report = report;
          vm.currentReportId = report.id;
          enableAvalonPolling();
        }
      } else {
        vm.searchCriteria = {
          startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
          endDate: moment().endOf('day').format('YYYY-MM-DD'),
        };
        vm.roomInfo = null;
      }
    }

    /* Date Section */
    function getStartDate() {
      return vm.searchCriteria.startDate;
    }

    function getEndDate() {
      return vm.searchCriteria.endDate;
    }

    function formatDate(reason, date, isEndOfDay) {
      var regex = new RegExp('-', 'g');
      var replace = '/';
      if (reason === 'display') {
        return _.replace(date, regex, replace).split('T')[0];
      }
      if (reason === 'api') {
        if (isEndOfDay) {
          return moment(date).endOf('day').toISOString();
        } else {
          return moment(date).toISOString();
        }
      }
    }

    function dateErrors(start, end) {
      var errors = [];
      var ninetyDayLimit = moment(end).subtract(90, 'days');

      if (moment(start).isAfter(moment(end))) {
        errors.push($translate.instant('ediscovery.dateError.StartDateMustBeforeEndDate'));
      }
      if (moment(start).isAfter(moment())) {
        errors.push($translate.instant('ediscovery.dateError.StartDateCannotBeInTheFuture'));
      }

      if (moment(start).isBefore(ninetyDayLimit) && !vm.proPackPurchased) {
        errors.push($translate.instant('ediscovery.dateError.InvalidDateRange'));
      }

      return errors;
    }

    function validateDate() {
      vm.dateValidationError = null;
      var errors = dateErrors(getStartDate(), getEndDate());
      if (errors.length > 0) {
        vm.dateValidationError = {
          errors: errors,
        };
        return false;
      } else {
        return true;
      }
    }

    $scope.$on('$destroy', function () {
      $timeout.cancel(avalonPoller);
    });

    $scope.$watch(getStartDate, function () {
      validateDate();
    });

    $scope.$watch(getEndDate, function () {
      validateDate();
    });

    /* Search Page Functions */
    function showHover() {
      return vm.proPackEnabled && !vm.proPackPurchased && Authinfo.isEnterpriseCustomer();
    }

    function getProPackTooltip() {
      return (showHover()) ? $translate.instant('ediscovery.searchParameters.dateRangeTooltip') : '';
    }

    function searchByLimit() {
      var limit = !_.isNull(vm.searchModel) ? splitWords(vm.searchModel) : null;
      if (_.size(limit) > vm.searchLimit) {
        var l10nErrorKey = vm.searchByOptions[0] === vm.searchBySelected ? 'ediscovery.searchErrors.invalidEmailLimit' : 'ediscovery.searchErrors.invalidSpaceIdLimit';
        vm.limitErrorMessage = $translate.instant(l10nErrorKey, { limit: vm.searchLimit });
      } else {
        vm.advancedSearch();
      }
    }

    function searchByParameters() {
      if (_.eq(vm.searchByOptions[0], vm.searchBySelected)) {
        vm.searchPlaceholder = $translate.instant('ediscovery.searchParameters.searchEmailPlaceholder');
        vm.searchHelpText = $translate.instant('ediscovery.searchParameters.searchEmailHelpText');
      } else if (_.eq(vm.searchByOptions[1], vm.searchBySelected)) {
        vm.searchPlaceholder = $translate.instant('ediscovery.searchParameters.searchRoomPlaceholder');
        vm.searchHelpText = $translate.instant('ediscovery.searchParameters.searchRoomHelpText');
      }
    }

    function advancedSearch() {
      searchSetup();
      spark = EdiscoveryService.setupSpark();
      vm.encryptedResult = [];
      vm.encryptedEmails = null;
      vm.unencryptedRoomIds = null;
      vm.emailSelected = _.eq(vm.searchByOptions[0], vm.searchBySelected);
      vm.roomIdSelected = _.eq(vm.searchByOptions[1], vm.searchBySelected);

      Analytics.trackEdiscoverySteps(Analytics.sections.EDISCOVERY.eventNames.INITIAL_SEARCH, {
        trackingId: 'N/A',
        emailSelected: vm.emailSelected && vm.searchModel,
        spaceSelected: vm.roomIdSelected && vm.searchModel,
        searchedWithKeyword: vm.queryModel,
      });

      spark.internal.mercury.connect()
        .then(function () {
          return spark.internal.encryption.kms.createUnboundKeys({
            count: 1,
          });
        })
        .then(function (unboundKeys) {
          vm.encryptedResult = unboundKeys[0];
          vm.encryptionKeyUrl = unboundKeys[0].uri;
          vm.unencryptedEmails = splitWords(vm.searchModel);
          return vm.emailSelected ? createEncryptedEmails(vm.searchModel) : vm.searchModel;
        })
        .then(function (keyword) {
          vm.encryptedEmails = vm.emailSelected ? keyword : null;
          vm.unencryptedRoomIds = vm.roomIdSelected ? splitWords(keyword) : null;
          return _.isNull(vm.queryModel) ? null : spark.internal.encryption.encryptText(vm.encryptedResult, vm.queryModel);
        })
        .then(function (query) {
          vm.encryptedQuery = query;
        })
        .then(function () {
          var start = formatDate('api', getStartDate());
          var end = formatDate('api', getEndDate(), true);
          var argonautParam = {
            roomIds: vm.unencryptedRoomIds,
            emailAddresses: vm.encryptedEmails,
            encryptionKeyUrl: vm.encryptionKeyUrl,
            startDate: start,
            endDate: end,
            query: vm.encryptedQuery,
          };
          return EdiscoveryService.getArgonautServiceUrl(argonautParam)
            .then(function (result) {
              if (result.data.numFiles === 0 && result.data.numMessages === 0) {
                vm.warning = $translate.instant('ediscovery.searchErrors.noMatchesFound');
                resetSearchPageToInitialState();
              } else {
                searchResults(result);
                var convertedSize = bytesToSize(result.data.totalSizeInBytes);
                var splitConvertedSize = convertedSize.split(' ');
                var reportSize = parseInt(splitConvertedSize[0], 10);
                var sizeInUnits = splitConvertedSize[1];
                if (result.data.numRooms > 2500) {
                  vm.isReportMaxRooms = true;
                  vm.isReport = false;
                } else if (reportSize >= 5 && sizeInUnits === 'GB') {
                  vm.isReportTooBig = true;
                }
              }
            })
            .catch(function (err) {
              var timeoutError = $translate.instant('ediscovery.searchErrors.504RequestFailed', {
                trackingId: err.data.trackingId,
              });
              var requestError = $translate.instant('ediscovery.searchErrors.requestFailed', {
                trackingId: err.data.trackingId,
              });
              vm.error = err.status === 504 ? timeoutError : requestError;
              Analytics.trackEdiscoverySteps(Analytics.sections.EDISCOVERY.eventNames.SEARCH_ERROR, {
                trackingId: err.data.trackingId,
                emailSelected: vm.emailSelected && vm.searchModel,
                spaceSelected: vm.roomIdSelected && vm.searchModel,
                searchedWithKeyword: vm.queryModel,
              });
              resetSearchPageToInitialState();
            })
            .finally(function () {
              vm.searchingForRoom = false;
            });
        });
    }

    /* Report Generation Functions */
    function createReport() {
      vm.isReport = false;
      vm.isReportGenerating = true;
      disableAvalonPolling();
      Analytics.trackEdiscoverySteps(Analytics.sections.EDISCOVERY.eventNames.GENERATE_REPORT, {});
      vm.report = {
        displayName: vm.searchCriteria.displayName,
        state: 'INIT',
        progress: 0,
      };
      vm.createReportParams = {
        displayName: vm.searchCriteria.displayName,
        startDate: getStartDate(),
        endDate: getEndDate(),
        keyword: vm.encryptedQuery,
        emailAddresses: vm.encryptedEmails,
        roomIds: vm.unencryptedRoomIds,
      };
      EdiscoveryService.createReport(vm.createReportParams)
        .then(function (res) {
          vm.currentReportId = res.id;
          var reportParams = {
            emailAddresses: vm.encryptedEmails,
            query: vm.encryptedQuery,
            roomIds: vm.unencryptedRoomIds,
            encryptionKeyUrl: vm.encryptionKeyUrl,
            responseUri: res.url,
            startDate: formatDate('api', getStartDate()),
            endDate: formatDate('api', getEndDate(), true),
          };
          generateReport(reportParams);
        })
        .catch(function (err) {
          Notification.errorWithTrackingId(err, 'ediscovery.searchResults.createReportFailed');
          vm.report = null;
          vm.createReportInProgress = false;
        });
    }

    function generateReport(postParams) {
      EdiscoveryService.generateReport(postParams)
        .catch(function (err) {
          Notification.errorWithTrackingId(err, 'ediscovery.searchResults.runFailed');
          EdiscoveryService.patchReport(vm.currentReportId, {
            state: 'FAILED',
            failureReason: 'UNEXPECTED_FAILURE',
          });
        }).finally(function () {
          enableAvalonPolling();
        });
    }

    function enableAvalonPolling() {
      $timeout.cancel(avalonPoller);
      pollAvalonReport();
    }

    function disableAvalonPolling() {
      $timeout.cancel(avalonPoller);
    }

    function pollAvalonReport() {
      EdiscoveryService.getReport(vm.currentReportId).then(function (report) {
        vm.report = report;
        vm.createReportInProgress = false;
        if (report.state != 'COMPLETED' && report.state != 'FAILED' && report.state != 'ABORTED') {
          avalonPoller = $timeout(pollAvalonReport, 5000);
        } else {
          disableAvalonPolling();
          var keyPromise;
          if (report.state === 'COMPLETED' && vm.report.encryptionKeyUrl) {
            keyPromise = EdiscoveryService.getReportKey(vm.report.encryptionKeyUrl, spark);
          } else {
            keyPromise = $q.resolve();
          }
          keyPromise.then(function (key) {
            if (key) {
              vm.report.reportKey = key;
            }
            EdiscoveryNotificationService.notify(report);
            vm.isReportComplete = true;
          })
            .catch(function () {
              Notification.error('ediscovery.encryption.unableGetPassword');
            })
            .finally(function () {
              vm.isReportComplete = true;
            });
        }
      });
    }

    function reportProgress() {
      if (vm.report && (vm.report.state === 'RUNNING' || vm.report.state === 'COMPLETED')) {
        return vm.report.progress || 0;
      } else {
        return 0;
      }
    }

    function downloadReport(report) {
      vm.downloadingReport = true;
      EdiscoveryService.downloadReport(report)
        .catch(function (err) {
          Notification.errorWithTrackingId(err, 'ediscovery.unableToDownloadFile');
        })
        .finally(function () {
          vm.downloadingReport = false;
        });
    }

    function cancelReport(id) {
      vm.cancellingReport = true;
      EdiscoveryService.patchReport(id, {
        state: 'ABORTED',
      }).then(function () {
        if (!EdiscoveryNotificationService.notificationsEnabled()) {
          Notification.success('ediscovery.searchResults.reportCancelled');
        }
        pollAvalonReport();
      }, function (err) {
        if (err.status !== 410) {
          Notification.error('ediscovery.searchResults.reportCancelFailed');
        }
      }).finally(function () {
        vm.cancellingReport = false;
      });
    }

    function keyPressHandler(event) {
      var activeElement = angular.element($window.document.activeElement);
      var searchInput = activeElement[0]['id'] === 'searchInput';
      var searchModel = activeElement[0].getAttribute('ng-model') === 'ediscoverySearchCtrl.searchModel';
      var queryModel = activeElement[0].getAttribute('ng-model') === 'ediscoverySearchCtrl.queryModel';
      var inputFieldHasFocus = searchInput || searchModel || queryModel;
      if (!inputFieldHasFocus || !(event.keyCode === KeyCodes.ESCAPE || event.keyCode === KeyCodes.ENTER)) {
        return; // if not escape and enter, nothing to do
      }
      switch (event.keyCode) {
        case KeyCodes.ESCAPE:
          init();
          break;

        case KeyCodes.ENTER:
          $timeout(function () {
            angular.element('#ediscoverySearchButton').trigger('click');
          });
          break;
      }
    }

    function searchButtonDisabled(_error) {
      var error = !_.isUndefined(_error) ? _error : false;
      return (error || vm.dateValidationError || !vm.searchModel);
    }

    function retrySearch() {
      vm.report = null;
    }

    function resetSearchPageToInitialState() {
      vm.roomInfo = false;
      vm.limitErrorMessage = null;
      vm.queryModel = null;
      vm.generateDescription = null;
      vm.isReport = true;
      vm.isReportGenerating = false;
      vm.isReportComplete = false;
      vm.isReportTooBig = false;
      vm.isReportMaxRooms = false;
    }

    /* Helper Functions */
    function splitWords(_words) {
      if (!_words) {
        return null;
      }
      return (_words)
        .split(',')
        .map(
          function (m) {
            return m.trim();
          })
        .filter(function (f) {
          return f !== '';
        });
    }

    function bytesToSize(bytes) {
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
      return _.isNaN(i) ? '0 Bytes' : Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    function searchSetup() {
      disableAvalonPolling();
      vm.ongoingSearch = true;
      vm.roomInfo = null;
      vm.report = null;
      vm.error = null;
      vm.warning = null;
      vm.searchingForRoom = true;
      vm.searchResults.keywords = [];
    }

    function searchResults(result) {
      var keywords = _.eq(vm.searchByOptions[0], vm.searchBySelected) ? vm.unencryptedEmails : vm.unencryptedRoomIds;
      keywords = keywords || [$translate.instant('ediscovery.searchResults.notApplicable')];
      var queries = vm.queryModel ? splitWords(vm.queryModel) : [$translate.instant('ediscovery.searchResults.notApplicable')];
      vm.roomInfo = result;
      vm.searchCriteria = {
        startDate: formatDate('display', getStartDate()),
        endDate: formatDate('display', getEndDate()),
      };
      vm.searchResults = {
        keywords: keywords,
        queries: queries,
        numRooms: result.data.numRooms,
        numFiles: result.data.numFiles,
        numMessages: result.data.numMessages,
        totalSize: bytesToSize(result.data.totalSizeInBytes),
      };
      vm.searchResultsHeader = _.eq(vm.searchByOptions[0], vm.searchBySelected) ? $translate.instant('ediscovery.searchResults.emailAddress') : $translate.instant('ediscovery.searchResults.spaceId');
    }

    function createEncryptedEmails(_emails) {
      var emails = splitWords(_emails);
      if (emails) {
        var promises = emails.map(function (s) {
          return spark.internal.encryption.encryptText(vm.encryptedResult, s);
        });
        return $q.all(promises);
      }
      return null;
    }
  }
}());
