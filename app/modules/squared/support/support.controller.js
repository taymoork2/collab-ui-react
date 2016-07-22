(function () {
  'use strict';

  /* global Bloodhound */

  angular.module('Squared')
    .controller('SupportCtrl', SupportCtrl);

  /* @ngInject */
  function SupportCtrl($filter, $scope, $timeout, $translate, $state, $stateParams, $window, Authinfo, CallflowService, Config, FeedbackService, Log, LogService, ModalService, Notification, Orgservice, PageParam, ReportsService, TokenService, UrlConfig, Userservice, Utils, WindowLocation) {
    $scope.showSupportDetails = false;
    $scope.showSystemDetails = false;
    $scope.problemHandler = ' by Cisco';
    $scope.helpHandler = 'by Cisco';
    $scope.reportingUrl = null;
    $scope.helpUrl = Config.helpUrl;
    $scope.ssoUrl = Config.ssoUrl;
    $scope.rolesUrl = Config.rolesUrl;
    $scope.statusPageUrl = UrlConfig.getStatusPageUrl();
    $scope.problemContent = 'Problem reports are being handled';
    $scope.helpContent = 'Help content is provided';
    $scope.searchInput = 'none';
    $scope.showCdrCallFlowLink = false;
    $scope.isCiscoDevRole = isCiscoDevRole;
    $scope.initializeShowCdrCallFlowLink = initializeShowCdrCallFlowLink;
    $scope.placeholder = $translate.instant('supportPage.inputPlaceholder');
    $scope.gridRefresh = false;
    $scope.gotoHelpdesk = gotoHelpdesk;
    $scope.gotoCdrSupport = gotoCdrSupport;
    $scope.gotoEdiscovery = gotoEdiscovery;

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

    function initializeShowCdrCallFlowLink() {
      Userservice.getUser('me', function (user, status) {
        if (user.success) {
          if (isCiscoDevRole(user.roles)) {
            $scope.showCdrCallFlowLink = true;
            reInstantiateMasonry();
          }
        } else {
          Log.debug('Get current user failed. Status: ' + status);
        }
      });
    }

    function reInstantiateMasonry() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
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

    $scope.showHelpdeskLink = function () {
      return Authinfo.isHelpDeskUser();
    };

    $scope.showToolsCard = function () {
      // Preliminary hack to fix rendering problem for small width screens.
      // Without it, small screens may initially render card(s) partly on top of each other
      if (!vm.masonryRefreshed)
        reInstantiateMasonry();
      return $scope.showCdrCallFlowLink || $scope.showHelpdeskLink() || $scope.showEdiscoveryLink();
    };

    $scope.showEdiscoveryLink = function () {
      return Authinfo.isComplianceUser();
    };

    $scope.tabs = [{
      title: $translate.instant('supportPage.tabs.status'),
      state: "support.status"
    }];

    //TODO remove test
    /*$scope.tabs.push({
      title: $translate.instant('supportPage.tabs.logs'),
      state: "support.logs"
    });*/

    //ADD BACK
    if (Authinfo.isInDelegatedAdministrationOrg()) {
      $scope.tabs.push({
        title: $translate.instant('supportPage.tabs.logs'),
        state: "support.logs"
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
      ReportsService.healthMonitor(function (data, status) {
        if (data.success) {
          $scope.healthMetrics = data.components;
          $scope.healthyStatus = true;

          // check Squared for error
          for (var health in $scope.healthMetrics) {
            if ($scope.healthMetrics[health].status !== 'operational') {
              $scope.healthyStatus = false;
              return;
            }
          }
        } else {
          Log.debug('Get health metrics failed. Status: ' + status);
        }
      });
    };

    var getOrg = function () {
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          var settings = data.orgSettings;

          if (!_.isEmpty(settings.reportingSiteUrl)) {
            $scope.reportingUrl = settings.reportingSiteUrl;
            $scope.problemHandler = 'externally';
          }
          if (!_.isEmpty(settings.helpUrl)) {
            $scope.helpUrl = settings.helpUrl;
            $scope.helpHandler = 'externally';
          }
        } else {
          Log.debug('Get org failed. Status: ' + status);
        }
      });
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
      initializeShowCdrCallFlowLink();
    };

    init();

    $('#logsearchfield').attr('placeholder', $filter('translate')('supportPage.inputPlaceholder'));

    //initialize sort icons
    var sortIcons = ['sortIconEmailAddress', 'sortIconDate', 'sortIconLocusId', 'sortIconCallStart'];
    for (var sortIcon in sortIcons) {
      if (sortIcons[sortIcon] === 'sortIconDate') {
        $scope[sortIcons[sortIcon]] = 'fa-sort-desc';
      } else {
        $scope[sortIcons[sortIcon]] = 'fa-sort';
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
      search: search
    };

    Log.debug('param search string: ' + $scope.input.search);

    $scope.toggleSort = function (type, icon) {
      $scope.reverseLogs = !$scope.reverseLogs;
      changeSortIcon(type, icon);
    };

    function changeSortIcon(logsSortBy, sortIcon) {
      $scope.logsSortBy = logsSortBy;
      if ($scope.reverseLogs === true) {
        $scope[sortIcon] = 'fa-sort-desc';
      } else {
        $scope[sortIcon] = 'fa-sort-asc';
      }

      for (var otherIcon in sortIcons) {
        if (sortIcons[otherIcon] !== sortIcon) {
          $scope[sortIcons[otherIcon]] = 'fa-sort';
        }
      }
    }

    var initializeTypeahead = function () {
      var suggestUsersUrl = UrlConfig.getScimUrl(Authinfo.getOrgId()) + '?count=10&attributes=name,userName&filter=userName%20sw%20%22';
      var engine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('userName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 5,
        remote: {
          url: suggestUsersUrl,
          filter: function (data) {
            return data.Resources;
          },
          replace: function (url, query) {
            return url + encodeURIComponent(query) + '%22'; //%22 is encoded double-quote
          },
          cache: true,
          ajax: {
            headers: {
              'Authorization': 'Bearer ' + TokenService.getAccessToken()
            }
          }
        }
      });

      engine.initialize();

      $('#logsearchfield').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
      }, {
        name: 'email',
        displayKey: 'userName',
        source: engine.ttAdapter()
      });
    };

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
      LogService.searchLogs(searchInput, function (data, status) {
        if (data.success) {
          //parse the data
          $scope.userLogs = [];
          if (data.metadataList && data.metadataList.length > 0) {
            for (var index in data.metadataList) {
              var fullFilename = data.metadataList[index].filename;
              var metadata = data.metadataList[index].meta;

              // retrieve locus and callstart from metadata
              var locus = '-NA-',
                callstart = '-NA-',
                feedbackid = '-NA-';
              if (metadata) {
                if (metadata.locusid) {
                  locus = metadata.locusid;
                }
                if (metadata.callstart) {
                  callstart = metadata.callstart;
                }
                if (metadata.feedbackid) {
                  feedbackid = metadata.feedbackid;
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
                orgId: data.metadataList[index].orgId
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
          Log.debug('Failed to retrieve user logs. Status: ' + status);
          Notification.error('supportPage.errLogQuery', {
            status: status
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

    var getLogInfo = function (locusId, startTime) {
      $scope.getPending = true;
      ReportsService.getLogInfo(locusId, startTime, function (data, status) {
        if (data.success) {
          if (data.callRecords.length > 0) {
            for (var index in data.callRecords) {
              var errorInfo = data.callRecords[index].errorInfo;
              var mediaStats = data.callRecords[index].mediaStats;
              var audioStart, videoStart, audioRxJitter, audioTxJitter, videoRxJitter, videoTxJitter;
              var audioRxLossRatio, audioTxLossRatio, videoRxLossRatio, videoTxLossRatio;
              var component, errMessage;
              var errorCode = 0;
              var starttime = moment(data.callRecords[index].locusCallStartTime);
              var graphUrl = UrlConfig.getLocusServiceUrl() + '/locus/api/v1/callflows?start=' + starttime + '&format=svg';
              var graphUserIdUrl = graphUrl + '&uid=' + data.callRecords[index].userId;
              var graphLocusIdUrl = graphUrl + '&lid=' + data.callRecords[index].locusId;
              var graphTrackingIdUrl = graphUrl + '&tid=' + data.callRecords[index].trackingId;
              if (mediaStats) {
                audioStart = mediaStats.audioStart;
                videoStart = mediaStats.videoStart;
                audioRxJitter = mediaStats.audioRxJitter;
                audioTxJitter = mediaStats.audioTxJitter;
                videoRxJitter = mediaStats.videoRxJitter;
                videoTxJitter = mediaStats.videoTxJitter;
                audioRxLossRatio = mediaStats.audioRxLossRatio;
                audioTxLossRatio = mediaStats.audioTxLossRatio;
                videoRxLossRatio = mediaStats.videoRxLossRatio;
                videoTxLossRatio = mediaStats.videoTxLossRatio;
              }
              if (errorInfo) {
                if (errorInfo.component) {
                  component = errorInfo.component;
                  errorCode = 1;
                }
                if (errorInfo.message) {
                  errMessage = errorInfo.message;
                  errorCode = 1;
                }
              }
              var info = {
                userId: data.callRecords[index].userId,
                emailAddress: data.callRecords[index].emailAddress,
                orgId: data.callRecords[index].orgId,
                locusId: data.callRecords[index].locusId,
                locusCallStartTime: data.callRecords[index].locusCallStartTime,
                deviceId: data.callRecords[index].deviceId,
                isGroupCall: data.callRecords[index].isGroupCall,
                callDuration: data.callRecords[index].callDuration,
                usrAgent: data.callRecords[index].usrAgent,
                networkName: data.callRecords[index].networkName,
                networkType: data.callRecords[index].networkType,
                trackingId: data.callRecords[index].trackingId,
                audioStart: audioStart,
                videoStart: videoStart,
                audioRxJitter: audioRxJitter,
                audioTxJitter: audioTxJitter,
                videoRxJitter: videoRxJitter,
                videoTxJitter: videoTxJitter,
                audioRxLossRatio: audioRxLossRatio,
                audioTxLossRatio: audioTxLossRatio,
                videoRxLossRatio: videoRxLossRatio,
                videoTxLossRatio: videoTxLossRatio,
                errorCode: errorCode,
                component: component,
                errMessage: errMessage,
                graphUserIdUrl: graphUserIdUrl,
                graphLocusIdUrl: graphLocusIdUrl,
                graphTrackingIdUrl: graphTrackingIdUrl
              };
              $scope.logInfo.push(info);
            }
          } else {
            $scope.getPending = false;
            Log.debug('No records found for : ' + locusId + ' startTime :' + startTime);
          }
        } else {
          Log.debug('Failed to retrieve log information. Status: ' + status);
          $scope.getPending = false;
          Notification.error('supportPage.errCallInfoQuery', {
            status: status
          });
        }
      });
    };

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

    $scope.getCallflowCharts = function (orgId, userId, locusId, callStart, filename, isGetCallLogs) {
      CallflowService.getCallflowCharts(orgId, userId, locusId, callStart, filename, isGetCallLogs, function (data, status) {
        if (data.success) {
          WindowLocation.set(data.resultsUrl);
        } else {
          Log.debug('Failed to download the callflow results corresponding to logFile: ' + filename + '. Status: ' + status);
          Notification.notify([$translate.instant('supportPage.callflowResultsFailed') + ': ' + filename + '. Status: ' + status], 'error');
        }
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
        type: 'primary'
      }).result.then(function () {
        $scope.getCallflowCharts(rowEntity.orgId, rowEntity.userId, rowEntity.locusId, rowEntity.callStart, rowEntity.fullFilename, true);
      });
    };

    var clientLogTemplate = '<div class="grid-icon ui-grid-cell-contents"><a ng-click="grid.appScope.downloadLog(row.entity.fullFilename)"><span><i class="icon icon-download"></i></a></div>';

    var callFlowTemplate =
      '<div class="grid-icon ui-grid-cell-contents"><a ng-click="grid.appScope.getCallflowCharts(row.entity.orgId, row.entity.userId, row.entity.locusId, row.entity.callStart, row.entity.fullFilename, false)"><span id="download-callflowCharts-icon"><i class="icon icon-download"></i></a></div>';

    var callFlowLogsTemplate = '<div class="grid-icon ui-grid-cell-contents"><a ng-click="grid.appScope.openDownloadCallLogModal(row.entity, true)"><span id="download-callflowCharts-icon"><i class="icon icon-download"></i></a></div>';

    $scope.gridOptions = {
      data: 'userLogs',
      multiSelect: false,
      rowHeight: 45,
      enableRowHeaderSelection: false,
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
        headerCellClass: 'header-email-address'
      }, {
        field: 'locusId',
        displayName: $filter('translate')('supportPage.logLocusId'),
        sortable: true
      }, {
        field: 'callStart',
        displayName: $filter('translate')('supportPage.logCallStart'),
        sortable: true
      }, {
        field: 'clientLog',
        displayName: $filter('translate')('supportPage.logAction'),
        sortable: false,
        cellTemplate: clientLogTemplate,
        cellClass: 'client-log',
        headerCellClass: 'header-client-log',
        maxWidth: 200
      }, {
        field: 'callflowLogs',
        displayName: $filter('translate')('supportPage.callflowLogsAction'),
        sortable: false,
        cellTemplate: callFlowLogsTemplate,
        cellClass: 'call-flow-logs',
        headerCellClass: 'header-call-flow-logs',
        maxWidth: 200
      }, {
        field: 'callFlow',
        displayName: $filter('translate')('supportPage.callflowAction'),
        sortable: false,
        cellTemplate: callFlowTemplate,
        cellClass: 'call-flow',
        headerCellClass: 'header-call-flow',
        visible: Authinfo.isCisco()
      }]
    };
  }
}());
