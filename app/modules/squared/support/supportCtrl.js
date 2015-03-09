'use strict';
/* global $, Bloodhound, moment */

angular.module('Squared')
  .controller('SupportCtrl', ['$scope', '$filter', '$rootScope', 'Notification', 'Log', 'Config', 'Utils', 'Storage', 'Authinfo', 'UserListService', 'LogService', 'ReportsService', 'CallflowService', '$translate', 'PageParam', '$stateParams', 'FeedbackService', '$window', 'Orgservice', 'ConnectorService',
    function ($scope, $filter, $rootScope, Notification, Log, Config, Utils, Storage, Authinfo, UserListService, LogService, ReportsService, CallflowService, $translate, PageParam, $stateParams, FeedbackService, $window, Orgservice, ConnectorService) {

      $scope.showSupportDetails = false;
      $scope.showSystemDetails = false;
      $scope.problemHandler = ' by Cisco';
      $scope.helpHandler = 'by Cisco';
      $scope.reportingUrl = null;
      $scope.helpUrl = 'https://support.projectsquared.com';
      $scope.statusPageUrl = Config.getStatusPageUrl();

      $scope.problemContent = 'Problem reports are being handled';
      $scope.helpContent = 'Help content is provided';

      $scope.toggleSystem = function () {
        $scope.showSystemDetails = !$scope.showSystemDetails;
      };

      $scope.toggleSupport = function () {
        $scope.showSupportDetails = !$scope.showSupportDetails;
      };

      $scope.sendFeedback = function () {
        var appType = 'Atlas_' + $window.navigator.userAgent;
        var feedbackId = Utils.getUUID();

        FeedbackService.getFeedbackUrl(appType, feedbackId, function (data, status) {
          Log.debug('feedback status: ' + status);
          if (data.success) {
            $window.open(data.url, '_blank');
          } else {
            Log.debug('Cannot load feedback url: ' + status);
          }
        });
      };

      var getHealthMetrics = function () {
        ReportsService.healthMonitor(function (data, status) {
          if (data.success) {
            ConnectorService.fetch(function (err, clusters) {
              $scope.healthMetrics = data.components;
              $scope.healthyStatus = true;

              // check Hercules for error
              for (var cluster in clusters) {
                if (clusters[cluster].needs_attention === true || err) {
                  $scope.healthyStatus = false;
                  return;
                }
              }

              // check Squared for error
              for (var health in $scope.healthMetrics) {
                if ($scope.healthMetrics[health].status !== 'operational') {
                  $scope.healthyStatus = false;
                  return;
                }
              }
            });

          } else {
            Log.debug('Get health metrics failed. Status: ' + status);
          }
        });
      };

      var getOrg = function () {
        Orgservice.getOrg(function (data, status) {
          if (data.success) {
            if (data.orgSettings) {
              for (var url in data.orgSettings) {
                if (data.orgSettings[url].indexOf('reportingSiteUrl=') > -1) {
                  $scope.reportingUrl = data.orgSettings[url].split("reportingSiteUrl=").pop();
                  $scope.problemHandler = 'externally';
                } else if (data.orgSettings[url].indexOf('helpUrl=') > -1) {
                  $scope.helpUrl = data.orgSettings[url].split("helpUrl=").pop();
                  $scope.helpHandler = 'externally';
                }
              }

            }
          } else {
            Log.debug('Get org failed. Status: ' + status);
          }
        });
      };

      var init = function () {
        getHealthMetrics();
        getOrg();
      };

      init();

      $('#logs-panel').hide();

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

      var changeSortIcon = function (logsSortBy, sortIcon) {
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
      };

      var initializeTypeahead = function () {
        var scimSearchUrl = Config.scimUrl + '?count=10&attributes=name,userName&filter=userName%20sw%20%22';
        var suggestUsersUrl = Utils.sprintf(scimSearchUrl, [Authinfo.getOrgId()]);
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
                'Authorization': 'Bearer ' + $rootScope.token
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
      //Populating authinfo data if empty.
      $rootScope.token = Storage.get('accessToken');
      initializeTypeahead();

      $scope.$on('AuthinfoUpdated', function () {
        //Initializing typeahead engine when authinfo is ready
        initializeTypeahead();
      });

      var validateLocusId = function (locusId) {
        var re = /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/;
        return re.test(locusId);
      };

      var validateCallStartTime = function (callStart) {
        var re = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/;
        return re.test(callStart);
      };

      //Retrieving logs for user
      $scope.getLogs = function () {
        $scope.closeCallInfo();
        $('#logsearchfield').typeahead('close');
        $scope.userLogs = [];
        angular.element('#logSearchBtn').button('loading');
        //check whether email address or uuid was enetered
        var searchInput = $('#logsearchfield').val();
        if (searchInput) {
          searchLogs(searchInput);
          $('#noResults').text([$filter('translate')('supportPage.searching')]);
        } else {
          $('#noResults').text([$filter('translate')('supportPage.noResults')]);
          Log.debug('Search input cannot be empty.');
          Notification.notify([$filter('translate')('supportPage.errEmptyinput')], 'error');
          angular.element('#logSearchBtn').button('reset');
        }
      };

      $scope.formatDate = function (date) {
        if (date !== '') {
          return moment.utc(date).local().format('MMM D \'YY H:mm ZZ');
        } else {
          return date;
        }
      };

      var searchLogs = function (searchInput) {
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
                angular.element('#logSearchBtn').button('reset');
                $('#logs-panel').show();
              }
            } else {
              $('#noResults').text([$filter('translate')('supportPage.noResults')]);
              angular.element('#logSearchBtn').button('reset');
              $('#logs-panel').show();
            }
          } else {
            $('#noResults').text([$filter('translate')('supportPage.noResults')]);
            $('#logs-panel').show();
            angular.element('#logSearchBtn').button('reset');
            Log.debug('Failed to retrieve user logs. Status: ' + status);
            Notification.notify([$translate.instant('supportPage.errLogQuery', {
              status: status
            })], 'error');
          }
        });
      };

      var checkValidityOfLocus = function (locus) {
        if (!validateLocusId(locus)) {
          locus = '-NA-';
        }
        return locus;
      };

      var checkValidityOfCallStart = function (callstart) {
        if (!validateCallStartTime(callstart)) {
          callstart = '-NA-';
        }
        return callstart;
      };

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
                var graphUrl = Config.getLocusServiceUrl() + '/locus/api/v1/callflows?start=' + starttime + '&format=svg';
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
              angular.element('#logInfoPendingBtn').button('reset');
              Log.debug('No records found for : ' + locusId + ' startTime :' + startTime);
            }
          } else {
            Log.debug('Failed to retrieve log information. Status: ' + status);
            $scope.getPending = false;
            angular.element('#logInfoPendingBtn').button('reset');
            Notification.notify([$translate.instant('supportPage.errCallInfoQuery', {
              status: status
            })], 'error');
          }
        });
      };

      $scope.downloadLog = function (filename) {
        LogService.downloadLog(filename, function (data, status) {
          if (data.success) {
            window.location.assign(data.tempURL);
          } else {
            Log.debug('Failed to download log: ' + filename + '. Status: ' + status);
            Notification.notify(['Failed to download log: ' + filename + '. Status: ' + status], 'error');
          }
        });
      };

      $scope.getCallflowCharts = function (orgId, userId, locusId, callStart, filename, id) {
        angular.element('#' + id).button('loading');
        var output = $filter('translate')('supportPage.downloading');
        var downloadDialog = window.confirm(output);
        if (downloadDialog === true) {
          CallflowService.getCallflowCharts(orgId, userId, locusId, callStart, filename, function (data, status) {
            angular.element('#' + id).button('reset');
            if (data.success) {
              window.location.assign(data.resultsUrl);
            } else {
              Log.debug('Failed to download the callflow results corresponding to logFile: ' + filename + '. Status: ' + status);
              Notification.notify(['Failed to download the callflow results corresponding to logFile: ' + filename + '. Status: ' + status], 'error');
            }
          });
        } else {
          angular.element('#' + id).button('reset');
        }
      };

      $scope.downloadFlow = function (downloadUrl) {
        $scope.callInfoActive = false;
        $scope.logPanelActive = false;
        $scope.callFlowActive = true;
        $scope.callFlowUrl = downloadUrl;
      };

      $scope.showCallInfo = function (emailAddress, locusId, startTime) {
        $scope.callInfoActive = true;
        $scope.logPanelActive = false;
        $scope.callFlowActive = false;
        $scope.logInfo = [];
        $scope.emailAddress = emailAddress;
        if (!locusId || locusId === '-NA-' || !startTime || startTime === '-NA-') {
          $scope.getPending = false;
          return;
        }
        getLogInfo(locusId, startTime);
      };

      $scope.closeCallInfo = function () {
        $scope.callInfoActive = false;
        $scope.logPanelActive = true;
        $scope.callFlowActive = false;
      };

      $scope.closeCallFlow = function () {
        $scope.callFlowUrl = 'images/solid_white.png';
        $scope.callInfoActive = true;
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

      var rowTemplate = '<div id="{{row.entity.customerName}}" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showCustomerDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var clientLogTemplate = '<div class="ngCellText"><a ng-click="downloadLog(row.entity.fullFilename)"><span id="download-icon"><i class="fa fa-download"></i></a></div>';

      var callFlowTemplate = '<div class="ngCellText"><button class="support_download btn btn-primary pull-center" ng-click="getCallflowCharts(row.entity.orgId, row.entity.userId, row.entity.locusId, row.entity.callStart, row.entity.fullFilename, getRowIndex(row.entity))" id="{{getRowIndex(row.entity)}}" data-loading-text="<i class=\'icon icon-spinner icon-spin\'></i>"><span id="download-callflowCharts-icon"><i class="fa fa-download"></i></button></div>';

      var callInfoTemplate = '<div class="ngCellText"><a ng-click="showCallInfo(row.entity.emailAddress, row.entity.locusId, row.entity.callStart)"><span id="callInfo-icon"><i class="fa fa-info"></i></span></a></div>';

      $scope.gridOptions = {
        data: 'userLogs',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,
        sortInfo: {
          fields: ['date'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'emailAddress',
          displayName: $filter('translate')('supportPage.logEmailAddress'),
          sortable: true
        }, {
          field: 'locusId',
          displayName: $filter('translate')('supportPage.logLocusId'),
          sortable: true
        }, {
          field: 'callStart',
          displayName: $filter('translate')('supportPage.logCallStart'),
          sortable: true
        }, {
          field: 'date',
          displayName: $filter('translate')('supportPage.logDate'),
          sortable: true
        }, {
          field: 'clientLog',
          displayName: $filter('translate')('supportPage.logAction'),
          sortable: false,
          cellTemplate: clientLogTemplate
        }, {
          field: 'callFlow',
          displayName: $filter('translate')('supportPage.callflowAction'),
          sortable: false,
          cellTemplate: callFlowTemplate,
          visible: Authinfo.isCisco()
        }, {
          field: 'callInfo',
          displayName: $filter('translate')('supportPage.callAction'),
          sortable: false,
          cellTemplate: callInfoTemplate,
          visible: Authinfo.isCisco()
        }]
      };

    }
  ]);
