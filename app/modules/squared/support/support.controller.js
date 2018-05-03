require('./_support.scss');

(function () {
  'use strict';

  var HealthStatusType = require('modules/core/health-monitor').HealthStatusType;

  angular.module('Squared')
    .controller('SupportCtrl', SupportCtrl);

  /* @ngInject */
  function SupportCtrl($filter, $modal, $q, $scope, $translate, $state, $stateParams, $window, Authinfo, CallflowService, CardUtils, Config, FeatureToggleService, FeedbackService, hasAtlasHybridCallUserTestTool, HealthService, Log, LogService, ModalService, Notification, Orgservice, PageParam, ProPackService, UrlConfig, Userservice, Utils, WindowLocation) {
    $scope.showSupportDetails = false;
    $scope.showSystemDetails = false;
    $scope.problemHandler = $translate.instant('supportPage.byCisco');
    $scope.helpHandler = $translate.instant('supportPage.byCisco');
    $scope.reportingUrl = null;
    $scope.helpUrl = Config.helpUrl;
    $scope.statusPageUrl = UrlConfig.getStatusPageUrl();
    $scope.searchInput = 'none';
    $scope.showCdrCallFlowLink = false;
    $scope.showPartnerManagementLink = false;
    $scope.isCiscoDevRole = isCiscoDevRole;
    $scope.initializeShowLinks = initializeShowLinks;
    $scope.placeholder = $translate.instant('supportPage.inputPlaceholder');
    $scope.gridRefresh = false;
    $scope.gotoHelpdesk = gotoHelpdesk;
    $scope.gotoCdrSupport = gotoCdrSupport;
    $scope.gotoEdiscovery = gotoEdiscovery;
    $scope.gotoPartnerManagement = gotoPartnerManagement;
    $scope.gotoProvisioningConsole = gotoProvisioningConsole;
    $scope.hasAtlasHybridCallUserTestTool = hasAtlasHybridCallUserTestTool;
    $scope.showOrderProvisioningConsole = false;

    var vm = this;
    vm.masonryRefreshed = false;

    function gotoHelpdesk() {
      var url = $state.href('helpdesk.search');
      $window.open(url, '_blank');
    }

    function gotoCdrSupport() {
      var url = $state.href('cdrsupport');
      $window.open(url, '_self');
    }

    function gotoEdiscovery() {
      var url = $state.href('ediscovery.search');
      $window.open(url, '_blank');
    }

    function gotoPartnerManagement() {
      // Don't open new tab for this tool
      $state.go('partnerManagement.search');
    }

    function gotoProvisioningConsole() {
      var url = $state.href('provisioning.pending');
      $window.open(url, '_blank');
    }

    function initializeShowLinks() {
      FeatureToggleService.atlasOrderProvisioningConsoleGetStatus().then(function (result) {
        $scope.showOrderProvisioningConsole = Authinfo.isOrderAdminUser() && (!Config.isProd() || result);
      });
      Userservice.getUser('me', function (user, status) {
        if (user.success) {
          var bReinstate = false;
          if (isCiscoDevRole(user.roles)) {
            $scope.showCdrCallFlowLink = true;
            bReinstate = true;
          }
          if (isPartnerManagementRole(user.roles)) {
            $scope.showPartnerManagementLink = true;
            bReinstate = true;
          }

          if (bReinstate === true) {
            reInstantiateMasonry();
          }
        } else {
          Log.debug('Get current user failed. Status: ' + status);
        }
      });
    }

    function reInstantiateMasonry() {
      CardUtils.resize();
      vm.masonryRefreshed = true;
    }

    function isCiscoDevRole(roleArray) {
      if (Array.isArray(roleArray)) {
        if (Config.isProd()) {
          if ((roleArray.indexOf('ciscouc.devops') >= 0 || roleArray.indexOf('ciscouc.devsupport') >= 0) && Authinfo.isCisco()) {
            return true;
          }
        } else {
          if ((roleArray.indexOf('ciscouc.devops') >= 0 || roleArray.indexOf('ciscouc.devsupport') >= 0) && (Authinfo.isCisco() || Authinfo.isCiscoMock())) {
            return true;
          }
        }
      }
      return false;
    }

    function isPartnerManagementRole(roleArray) {
      return Array.isArray(roleArray) &&
        (roleArray.indexOf('atlas-portal.cisco.partnermgmt') >= 0);
    }

    $scope.showHelpdeskLink = function () {
      return Authinfo.isHelpDeskUser();
    };

    $scope.showHybridCallUserTestTool = function () {
      return $scope.hasAtlasHybridCallUserTestTool;
    };

    $scope.showToolsCard = function () {
      // Preliminary hack to fix rendering problem for small width screens.
      // Without it, small screens may initially render card(s) partly on top of each other
      if (!vm.masonryRefreshed) {
        reInstantiateMasonry();
      }
      return $scope.showCdrCallFlowLink || $scope.showHelpdeskLink() || $scope.showEdiscoveryLink() || $scope.showHybridCallUserTestTool();
    };

    $scope.showEdiscoveryLink = function () {
      return Authinfo.isComplianceUser();
    };

    $scope.tabs = [{
      title: $translate.instant('supportPage.tabs.status'),
      state: 'support.status',
    }];

    var promises = {
      isProPackEnabled: ProPackService.hasProPackEnabled(),
      isUX3: FeatureToggleService.diagnosticF8193UX3GetStatus(),
    };
    $q.all(promises).then(function (features) {
      if (features.isUX3 && features.isProPackEnabled) {
        $scope.showMeetingTab = true;
        $scope.tabs.splice(0, 0, {
          title: $translate.instant('troubleshootingPage.tabs.meeting'),
          state: 'support.meeting',
        });
      } else {
        if ($state.current.name === 'support.meeting') {
          $state.go('support.status');
        }
      }
    });

    if (Authinfo.isInDelegatedAdministrationOrg() && !Authinfo.isHelpDeskAndComplianceUserOnly()) {
      $scope.tabs.push({
        title: $translate.instant('supportPage.tabs.logs'),
        state: 'support.logs',
      });
    }

    $scope.toggleSystem = function () {
      $scope.showSystemDetails = !$scope.showSystemDetails;
    };

    $scope.toggleSupport = function () {
      $scope.showSupportDetails = !$scope.showSupportDetails;
    };

    $scope.sendFeedback = function () {
      var appType = 'Atlas_' + $window.navigator.userAgent;
      var feedbackId = Utils.getUUID();

      FeedbackService.getFeedbackUrl(appType, feedbackId).then(function (res) {
        $window.open(res.data.url, '_blank');
      });
    };

    var getHealthMetrics = function () {
      HealthService.getHealthCheck().then(function (data) {
        $scope.healthMetrics = data.components;

        // check Squared for error
        $scope.healthyStatus = _.every($scope.healthMetrics, function (healthMetric) {
          return healthMetric.status === HealthStatusType.OPERATIONAL;
        });
      }).catch(function (error) {
        Log.debug('Get health metrics failed. Status: ' + error.status);
      });
    };

    var getOrg = function () {
      var params = {
        basicInfo: true,
      };
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          var settings = data.orgSettings;

          if (!_.isEmpty(settings.reportingSiteUrl)) {
            $scope.reportingUrl = settings.reportingSiteUrl;
            $scope.problemHandler = $translate.instant('supportPage.externally');
          }
          if (!_.isEmpty(settings.helpUrl)) {
            $scope.helpUrl = settings.helpUrl;
            $scope.helpHandler = $translate.instant('supportPage.externally');
          }
        } else {
          Log.debug('Get org failed. Status: ' + status);
        }
      }, null, params);
    };

    //Retrieving logs for user
    $scope.getLogs = function () {
      $scope.gridRefresh = true;

      $scope.closeCallInfo();

      //$('#logsearchfield').typeahead('close');
      $scope.userLogs = [];
      $scope.logSearchBtnLoad = true;
      //check whether email address or uuid was enetered
      $scope.searchInput = $('#logsearchfield').val();
      if ($scope.searchInput) {
        searchLogs($scope.searchInput);
        $('#noResults').text([$filter('translate')('supportPage.searching')]);
      } else {
        $scope.gridRefresh = false;
        $('#noResults').text([$filter('translate')('supportPage.noResults')]);
        Log.debug('Search input cannot be empty.');
        Notification.notify([$filter('translate')('supportPage.errEmptyinput')], 'error');
        $scope.logSearchBtnLoad = false;
      }
    };

    var init = function () {
      getHealthMetrics();
      getOrg();
      initializeShowLinks();
    };

    init();

    $('#logsearchfield').attr('placeholder', $filter('translate')('supportPage.inputPlaceholder'));

    //initialize sort icons
    var sortIcons = ['sortIconEmailAddress', 'sortIconDate', 'sortIconLocusId', 'sortIconCallStart'];
    for (var sortIcon in sortIcons) {
      if (sortIcons[sortIcon] === 'sortIconDate') {
        $scope[sortIcons[sortIcon]] = 'icon-chevron-down';
      } else {
        $scope[sortIcons[sortIcon]] = 'icon-sort';
      }
    }

    $scope.logsSortBy = 'date';
    $scope.reverseLogs = true;
    $scope.callFlowActive = false;
    $scope.callFlowUrl = 'images/solid_white.png';

    var search;
    if (PageParam.getParam('search')) {
      search = PageParam.getParam('search');
      PageParam.clear();
    } else if ($stateParams.search) {
      search = $stateParams.search;
    }
    $scope.input = {
      search: search,
    };

    Log.debug('param search string: ' + $scope.input.search);

    $scope.toggleSort = function (type, icon) {
      $scope.reverseLogs = !$scope.reverseLogs;
      changeSortIcon(type, icon);
    };

    function changeSortIcon(logsSortBy, sortIcon) {
      $scope.logsSortBy = logsSortBy;
      if ($scope.reverseLogs === true) {
        $scope[sortIcon] = 'icon-chevron-down';
      } else {
        $scope[sortIcon] = 'icon-chevron-up';
      }

      for (var otherIcon in sortIcons) {
        if (sortIcons[otherIcon] !== sortIcon) {
          $scope[sortIcons[otherIcon]] = 'icon-sort';
        }
      }
    }

    //TODO: Fix $(...).typeahead is not a function console error
    //initializeTypeahead();

    $scope.$on('AuthinfoUpdated', function () {
      //Initializing typeahead engine when authinfo is ready
      //initializeTypeahead();
    });

    var validateLocusId = function (locusId) {
      var re = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
      return re.test(locusId);
    };

    var validateCallStartTime = function (callStart) {
      var re = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/;
      return re.test(callStart);
    };

    $scope.formatDate = function (date) {
      if (date !== '') {
        return moment.utc(date).local().format('MMM D \'YY H:mm ZZ');
      } else {
        return date;
      }
    };

    function searchLogs(searchInput) {
      $scope.closeCallInfo();
      // request most recent 300 logs (also backend default).  backend has a limit of 1000, so this is somewhat arbitrary.
      LogService.searchLogs(searchInput, {
        timeSortOrder: 'descending',
        limit: 300,
      }).then(function (data, status) {
        if (_.isObject(data)) {
          if (_.has(data, 'data')) {
            data = data.data;
          }
        } else {
          data = {};
        }
        data.success = true;
        data.status = status;
        return data;
      }).catch(function (data, status) {
        data = _.isObject(data) ? data : {};
        data.success = false;
        data.status = status;
        return data;
      }).then(function (data) {
        if (data.success) {
          //parse the data
          $scope.userLogs = [];
          if (data.metadataList && data.metadataList.length > 0) {
            for (var index in data.metadataList) {
              var fullFilename = data.metadataList[index].filename;
              var metadata = data.metadataList[index].meta;

              // retrieve locus and callstart from metadata
              var locus = '-NA-',
                callstart = '-NA-';
              if (metadata) {
                if (metadata.locusid) {
                  locus = metadata.locusid;
                }
                if (metadata.callstart) {
                  callstart = metadata.callstart;
                }
              } else {
                //no metadata, for backward compatibility get locus and callstart from log filename
                var filename = fullFilename.substr(fullFilename.lastIndexOf('/') + 1);
                var lastIndex = filename.indexOf('_');
                locus = filename.substr(0, lastIndex);

                var callStartEndIndex = filename.indexOf('Z', lastIndex + 1) + 1;
                callstart = filename.substring(lastIndex + 1, callStartEndIndex);

                locus = checkValidityOfLocus(locus);
                callstart = checkValidityOfCallStart(callstart);

                if ((locus === '-NA-') || (callstart === '-NA-')) {
                  callstart = '-NA-';
                  locus = '-NA-';
                }
              }

              var log = {
                fullFilename: fullFilename,
                emailAddress: data.metadataList[index].emailAddress,
                locusId: locus,
                callStart: callstart,
                date: data.metadataList[index].timestamp,
                userId: data.metadataList[index].userId,
                orgId: data.metadataList[index].orgId,
                feedbackId: data.metadataList[index].meta.feedbackid,
                correlationId: data.metadataList[index].meta.correlationid,
                metadata: data.metadataList[index],
              };
              $scope.userLogs.push(log);
              $scope.logSearchBtnLoad = false;
              $scope.gridRefresh = false;
              $('#logs-panel').show();
            }
          } else {
            $('#noResults').text([$filter('translate')('supportPage.noResults')]);
            $scope.logSearchBtnLoad = false;
            $scope.gridRefresh = false;
            $('#logs-panel').show();
          }
        } else {
          $('#noResults').text([$filter('translate')('supportPage.noResults')]);
          $('#logs-panel').show();
          $scope.logSearchBtnLoad = false;
          $scope.gridRefresh = false;
          Log.debug('Failed to retrieve user logs. Status: ' + data.status);
          Notification.error('supportPage.errLogQuery', {
            status: data.status,
          });
        }
      });
    }

    function checkValidityOfLocus(locus) {
      if (!validateLocusId(locus)) {
        locus = '-NA-';
      }
      return locus;
    }

    function checkValidityOfCallStart(callstart) {
      if (!validateCallStartTime(callstart)) {
        callstart = '-NA-';
      }
      return callstart;
    }

    $scope.downloadLog = function (filename) {
      LogService.downloadLog(filename, function (data, status) {
        if (data.success) {
          WindowLocation.set(data.tempURL);
        } else {
          Log.debug('Failed to download log: ' + filename + '. Status: ' + status);
          Notification.notify([$translate.instant('supportPage.downloadLogFailed') + ': ' + filename + '. ' + $translate.instant(
            'supportPage.status') + ': ' + status], 'error');
        }
      });
    };

    $scope.openExtendedMetadata = function (metadata) {
      var scope = $scope.$new();
      scope.metadata = metadata;

      $modal.open({
        template: '<logs-extended-metadata metadata="metadata" dismiss="$dismiss()"></logs-extended-metadata>',
        scope: scope,
      });
    };

    $scope.getCallflowCharts = function (orgId, userId, locusId, callStart, filename, isGetCallLogs) {
      CallflowService.getCallflowCharts(orgId, userId, locusId, callStart, filename, isGetCallLogs)
        .then(function (data) {
          WindowLocation.set(_.get(data, 'resultsUrl'));
        })
        .catch(function (response) {
          var status = _.get(response, 'status', 'Unknown');
          Log.debug('Failed to download the callflow results corresponding to logFile: ' + filename + '. Status: ' + status);
          Notification.notify([$translate.instant('supportPage.callflowResultsFailed') + ': ' + filename + '. Status: ' + status], 'error');
        });
    };

    $scope.downloadFlow = function (downloadUrl) {
      $scope.logPanelActive = false;
      $scope.callFlowActive = true;
      $scope.callFlowUrl = downloadUrl;
    };

    $scope.closeCallInfo = function () {
      $scope.logPanelActive = true;
      $scope.callFlowActive = false;
    };

    $scope.closeCallFlow = function () {
      $scope.callFlowUrl = 'images/solid_white.png';
      $scope.logPanelActive = false;
      $scope.callFlowActive = false;
    };

    if ($scope.input.search) {
      $('#logsearchfield').val($scope.input.search);

      setTimeout(function () {
        $scope.getLogs();
      }, 0); // setTimeout to allow label translation to resolve
    }

    $scope.getRowIndex = function (rowItem) {
      return $scope.userLogs.indexOf(rowItem);
    };

    $scope.openDownloadCallLogModal = function (rowEntity) {
      ModalService.open({
        title: $translate.instant('supportPage.callflowLogsAction'),
        message: $translate.instant('supportPage.downloading'),
        close: $translate.instant('common.ok'),
        dismiss: $translate.instant('common.cancel'),
        btnType: 'primary',
      }).result.then(function () {
        $scope.getCallflowCharts(rowEntity.orgId, rowEntity.userId, rowEntity.locusId, rowEntity.callStart, rowEntity.fullFilename, true);
      });
    };

    var clientLogTemplate = '<div class="grid-icon ui-grid-cell-contents"><a href ng-click="grid.appScope.downloadLog(row.entity.fullFilename)"><span><i class="icon icon-download"></i></a></div>';
    var metadataTemplate = '<div class="grid-icon ui-grid-cell-contents"><a href ng-click="grid.appScope.openExtendedMetadata(row.entity.metadata)"><i class="icon icon-data"></i></a></div>';

    $scope.gridOptions = {
      data: 'userLogs',
      multiSelect: false,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableRowSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
      },
      columnDefs: [{
        field: 'emailAddress',
        displayName: $filter('translate')('supportPage.logEmailAddress'),
        sortable: true,
        cellClass: 'email-address',
        headerCellClass: 'header-email-address',
      }, {
        field: 'locusId',
        displayName: $filter('translate')('supportPage.logLocusId'),
        sortable: true,
      }, {
        field: 'callStart',
        displayName: $filter('translate')('supportPage.logCallStart'),
        sortable: true,
      }, {
        field: 'clientLog',
        displayName: $filter('translate')('supportPage.logAction'),
        sortable: false,
        cellTemplate: clientLogTemplate,
        cellClass: 'client-log',
        headerCellClass: 'header-client-log',
        maxWidth: 200,
      }, {
        field: 'feedbackId',
        displayName: $filter('translate')('supportPage.feedbackId'),
        sortable: false,
      }, {
        field: 'correlationId',
        displayName: $filter('translate')('supportPage.correlationId'),
        sortable: false,
      }, {
        field: 'metadata',
        displayName: $filter('translate')('supportPage.metadata'),
        cellTemplate: metadataTemplate,
        headerCellClass: 'header-metadata',
      }],
    };
  }
})();
