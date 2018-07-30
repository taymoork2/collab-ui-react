(function () {
  'use strict';

  angular.module('Sunlight').controller('CareReportsController', CareReportsController);
  /* @ngInject */
  function CareReportsController($log, $q, $scope, $timeout, $translate, CardUtils, CareReportsService, DrillDownReportProps, DummyCareReportService, Notification, ReportConstants, SunlightReportService, FeatureToggleService, SunlightConfigService) {
    var vm = this;
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';
    var RESIZE_DELAY_IN_MS = 600;

    var MEDIA_TYPE_ALL_TASKS = 'all';
    var MEDIA_TYPE_CHAT = 'chat';
    var MEDIA_TYPE_CALLBACK = 'callback';
    var MEDIA_TYPE_VOICE = 'voice';
    var MEDIA_TYPE_WEBCALL = 'webcall';
    var MEDIA_TYPE_APPLEBUSINESSCHAT = 'abc';

    vm.showChartWithoutBreakdown = {
      taskIncoming: EMPTY,
      taskTime: EMPTY,
      avgCsat: EMPTY,
    };
    vm.isVideoCallEnabled = EMPTY;
    vm.isVideoFeatureEnabled = EMPTY;
    vm.dataStatus = REFRESH;
    vm.tableDataStatus = EMPTY;
    vm.snapshotDataStatus = REFRESH;
    vm.taskIncomingDescription = '';
    vm.taskOfferedDescription = '';
    vm.taskTimeDescription = '';
    vm.averageCsatDescription = '';
    vm.taskAggregateDescription = '';
    vm.taskIncomingBreakdownDescription = '';
    vm.taskTimeBreakdownDescription = '';
    vm.averageCsatBreakdownDescription = '';
    vm.taskAggregateBreakdownDescription = '';
    vm.taskIncomingTitle = '';
    vm.taskOfferedTitle = '';
    vm.taskTimeTitle = '';
    vm.taskAggregateTitle = '';

    vm.tableData = [];
    vm.tableDataPromise = undefined;
    var tableDataFor = { mediaTypeSelected: vm.mediaTypeSelected, timeSelected: vm.timeSelected };

    vm.allReports = 'all';
    vm.engagement = 'engagement';
    vm.quality = 'quality';
    vm.currentFilter = vm.allReports;
    vm.displayEngagement = true;
    vm.displayQuality = true;

    vm.filterArray = _.cloneDeep(ReportConstants.filterArray);
    vm.filterArray[0].toggle = function () {
      resetCards(vm.allReports);
    };
    vm.filterArray[1].toggle = function () {
      resetCards(vm.engagement);
    };
    vm.filterArray[2].toggle = function () {
      resetCards(vm.quality);
    };

    vm.timeFilter = null;

    var options = ['today', 'yesterday', 'week', 'month', 'threeMonths'];
    vm.timeOptions = _.map(options, function (name, i) {
      return {
        value: i,
        label: $translate.instant('careReportsPage.' + name),
        description: $translate.instant('careReportsPage.' + name + '2'),
        taskStatus: $translate.instant('careReportsPage.' + name + 'TaskStatus'),
        intervalTxt: $translate.instant('careReportsPage.' + name + 'Interval'),
        categoryAxisTitle: $translate.instant('careReportsPage.' + name + 'CategoryAxis'),
        drilldownTitle: $translate.instant('careReportsPage.' + name + 'DrilldownTitle'),
        drilldownDescription: $translate.instant('careReportsPage.' + name + 'DrilldownDescription'),
      };
    });

    vm.shouldDisplayBreakdown = function (webcallStats) {
      var isVideoDisabledOrChatNotSelected = !vm.isVideoFeatureEnabled || vm.mediaTypeSelected.name !== 'chat';
      vm.showChartWithoutBreakdown.taskIncoming = isVideoDisabledOrChatNotSelected || (vm.isVideoCallEnabled === false && webcallStats.isNumHandledTaskPresent === false);
      vm.showChartWithoutBreakdown.avgCsat = isVideoDisabledOrChatNotSelected || (vm.isVideoCallEnabled === false && webcallStats.isAvgCSATPresent === false);
      vm.showChartWithoutBreakdown.taskTime = isVideoDisabledOrChatNotSelected || (vm.isVideoCallEnabled === false && webcallStats.isAvgHandleTimePresent === false);
    };

    vm.shouldVideoDrillDownBeDisplayed = function (isDataPresent) {
      var selectedMediaType = vm.mediaTypeSelected.name;
      return vm.isVideoFeatureEnabled && selectedMediaType === MEDIA_TYPE_CHAT && (vm.isVideoCallEnabled || isDataPresent);
    };

    vm.shouldWebcallDrillDownBeDisplayed = function (isDataPresent) {
      var selectedMediaType = vm.mediaTypeSelected.name;
      return selectedMediaType === MEDIA_TYPE_WEBCALL && isDataPresent;
    };

    vm.timeSelected = vm.timeOptions[0];

    function timeSelected() {
      return vm.timeSelected;
    }

    vm.filtersUpdate = filtersUpdate;
    var mediaTypes = [MEDIA_TYPE_ALL_TASKS, MEDIA_TYPE_CHAT, MEDIA_TYPE_APPLEBUSINESSCHAT, MEDIA_TYPE_CALLBACK, MEDIA_TYPE_VOICE];
    setMediaTypeOptions(mediaTypes);

    function setMediaTypeOptions(mediaTypes) {
      vm.mediaTypeOptions = _.map(mediaTypes, function (name, i) {
        return {
          value: i,
          name: name,
          label: $translate.instant('careReportsPage.media_type_' + name),
        };
      });
    }

    vm.mediaTypeSelected = vm.mediaTypeOptions[1];
    vm.callbackFeature = false;

    function setDrillDownProps(webcallDataPresent, isDataEmpty) {
      vm.taskIncomingDrilldownProps = DrillDownReportProps.taskIncomingDrilldownProps(timeSelected,
        vm.shouldVideoDrillDownBeDisplayed(webcallDataPresent.isTotalHandledPresent),
        vm.shouldWebcallDrillDownBeDisplayed(webcallDataPresent.isTotalHandledPresent), isDataEmpty);
      vm.taskOfferedDrilldownProps = DrillDownReportProps.taskOfferedDrilldownProps(timeSelected, isDataEmpty);
      vm.avgCsatDrilldownProps = DrillDownReportProps.avgCsatDrilldownProps(timeSelected,
        vm.shouldVideoDrillDownBeDisplayed(webcallDataPresent.isAvgCSATPresent),
        vm.shouldWebcallDrillDownBeDisplayed(webcallDataPresent.isTotalHandledPresent), isDataEmpty);
      vm.taskTimeDrilldownProps = DrillDownReportProps.taskTimeDrilldownProps(timeSelected,
        vm.shouldVideoDrillDownBeDisplayed(webcallDataPresent.isAvgHandleTimePresent),
        vm.shouldWebcallDrillDownBeDisplayed(webcallDataPresent.isTotalHandledPresent), isDataEmpty);
    }

    function filtersUpdate() {
      vm.shouldDisplayBreakdown({});
      $timeout(function () {
        vm.dataStatus = REFRESH;
        vm.snapshotDataStatus = REFRESH;
        vm.tableDataStatus = EMPTY;
        vm.tableData = [];
        tableDataFor = _.pick(vm, ['mediaTypeSelected', 'timeSelected']);
        if (vm.tableDataPromise) {
          vm.tableDataPromise = undefined;
        }

        setFilterBasedTextForCare();
        showReportsWithDummyData();
        collapseDrilldownReports();
        showReportsWithRealData();
        resizeCards();
        delayedResize();
      }, 0);
    }

    function saveReportingAndUserData(mediaTypeSelected, timeSelected) {
      return function (mergedData) {
        if (!isTableDataClean(mediaTypeSelected, timeSelected)) {
          return $q.reject({ reason: 'filtersChanged' });
        }
        if (_.get(mergedData.data, 'length')) {
          vm.tableDataStatus = SET;
        } else {
          vm.tableDataStatus = EMPTY;
        }
        vm.tableData = mergedData.data;
        return $q.resolve(mergedData);
      };
    }

    function getTableData(mediaTypeSelected, timeSelected) {
      return SunlightReportService.getAllUsersAggregatedData('all_user_stats', timeSelected.value, mediaTypeSelected.name)
        .then(saveReportingAndUserData(mediaTypeSelected, timeSelected))
        .finally(function () {
          vm.tableDataPromise = undefined;
        });
    }

    function isTableDataClean(mediaTypeSelected, timeSelected) {
      return tableDataFor.mediaTypeSelected === mediaTypeSelected && tableDataFor.timeSelected === timeSelected;
    }

    function isDataEmpty(data) {
      if (!data || data.length === 0) {
        return true;
      }
    }

    vm.showTable = function (onSuccess, onError, mediaTypeSelected, timeSelected) {
      if (vm.tableDataStatus === SET) {
        onSuccess(vm.tableData);
        return $q.resolve(vm.tableData);
      } else if (vm.tableDataPromise && isTableDataClean(mediaTypeSelected, timeSelected)) {
        return vm.tableDataPromise.then(function (dataObj) {
          onSuccess(dataObj.data);
        }, onError);
      } else {
        vm.tableDataPromise = getTableData(mediaTypeSelected, timeSelected);
        return vm.tableDataPromise.then(function (dataObj) {
          setDrillDownProps(dataObj.isWebcallDataPresent, isDataEmpty(dataObj.data));
          onSuccess(dataObj.data);
        }, onError);
      }
    };

    function collapseDrilldownReports() {
      $log.info('Sending Broadcast to reset...');
      $scope.$broadcast(DrillDownReportProps.broadcastReset, {});
    }

    function setFilterBasedTextForCare() {
      var mediaDescription = (vm.mediaTypeSelected.name === 'all') ? _.split(vm.mediaTypeSelected.label, ' ')[1]
        : vm.mediaTypeSelected.label;
      var taskTimeMediaDesc = mediaDescription.substring(0, mediaDescription.length - 1);
      var mediaDescriptionLowercase = _.toLower(mediaDescription);
      var taskTimeMediaDescLowercase = _.toLower(taskTimeMediaDesc);
      var taskTimeDescription = 'taskTime.desc';
      // For ABC reports, we want to keep it uppercase
      if (vm.mediaTypeSelected.name === MEDIA_TYPE_APPLEBUSINESSCHAT) {
        mediaDescriptionLowercase = mediaDescription;
        taskTimeMediaDescLowercase = taskTimeMediaDesc;
        taskTimeDescription = 'taskTime.abcDesc';
      }

      vm.taskIncomingDescription = $translate.instant('taskIncoming.desc', {
        time: vm.timeSelected.description,
        mediaType: mediaDescriptionLowercase,
      });

      vm.taskOfferedDescription = $translate.instant('taskOffered.desc', {
        time: vm.timeSelected.description,
        mediaType: mediaDescriptionLowercase,
      });

      vm.taskTimeDescription = $translate.instant(taskTimeDescription, {
        time: vm.timeSelected.description,
        mediaType: taskTimeMediaDescLowercase,
      });

      vm.averageCsatDescription = $translate.instant('averageCsat.desc', {
        time: vm.timeSelected.description,
      });

      vm.taskAggregateDescription = $translate.instant('taskAggregate.desc', {
        mediaType: mediaDescriptionLowercase,
      });

      vm.taskIncomingTitle = $translate.instant('taskIncoming.title', {
        mediaType: mediaDescription,
      });

      vm.taskOfferedTitle = $translate.instant('taskOffered.title', {
        mediaType: mediaDescription,
      });

      vm.taskTimeTitle = $translate.instant('taskTime.title', {
        mediaType: taskTimeMediaDesc,
      });

      vm.taskAggregateTitle = $translate.instant('taskAggregate.title', {
        mediaType: mediaDescription,
      });

      vm.taskIncomingBreakdownDescription = $translate.instant('taskIncoming.breakdownDescription', {
        time: vm.timeSelected.description,
        mediaType: mediaDescriptionLowercase,
      });

      vm.taskTimeBreakdownDescription = $translate.instant('taskTime.breakdownDescription', {
        time: vm.timeSelected.description,
        mediaType: taskTimeMediaDescLowercase,
      });

      vm.taskAggregateBreakdownDescription = $translate.instant('taskAggregate.breakdownDescription', {
        mediaType: mediaDescriptionLowercase,
      });

      vm.averageCsatBreakdownDescription = $translate.instant('averageCsat.breakdownDescription', {
        time: vm.timeSelected.description,
        mediaType: mediaDescriptionLowercase,
      });
    }

    function showReportsWithRealData() {
      var isToday = (vm.timeSelected.value === 0);
      if (isToday) {
        showSnapshotReportWithRealData();
      }
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;
      var title = generateReportTitle();
      return SunlightReportService.getReportingData('org_stats', vm.timeSelected.value, vm.mediaTypeSelected.name)
        .then(function (data) {
          var webcallStats = CareReportsService.getWebcallDataStats(data);
          vm.shouldDisplayBreakdown(webcallStats);

          if (data.length === 0) {
            vm.dataStatus = EMPTY;
          } else {
            vm.dataStatus = SET;
            CareReportsService.showTaskIncomingGraph('taskIncomingdiv', 'taskIncomingBreakdownDiv', data, categoryAxisTitle, title);
            CareReportsService.showTaskOfferedGraph('taskOffereddiv', data, categoryAxisTitle, title);
            CareReportsService.showTaskTimeGraph('taskTimeDiv', 'taskTimeBreakdownDiv', data, categoryAxisTitle, title);
            CareReportsService.showAverageCsatGraph('averageCsatDiv', 'averageCsatBreakdownDiv', data, categoryAxisTitle, title);
            resizeCards();
          }
        }, function (data) {
          vm.dataStatus = EMPTY;
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Customer Satisfaction' }));
          if (!isToday) {
            Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Task Completion Time' }));
          }
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Offered Tasks' }));
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Total Completed Tasks' }));
        });
    }

    function showSnapshotReportWithRealData() {
      var isSnapshot = true;
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;
      var title = generateReportTitle();
      SunlightReportService.getReportingData('org_snapshot_stats', vm.timeSelected.value, vm.mediaTypeSelected.name, isSnapshot)
        .then(function (data) {
          if (data.length === 0) {
            vm.snapshotDataStatus = EMPTY;
          } else {
            vm.snapshotDataStatus = SET;
            CareReportsService.showTaskAggregateGraph('taskAggregateDiv', data, categoryAxisTitle, title);
            resizeCards();
          }
        }, function (data) {
          vm.snapshotDataStatus = EMPTY;
          Notification.errorResponse(data, $translate.instant('careReportsPage.taskDataGetError', { dataType: 'Aggregated Tasks' }));
        });
    }

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    function showReportsWithDummyData() {
      var dummyData = DummyCareReportService.dummyOrgStatsData(vm.timeSelected.value);
      var dummyTitle = undefined;
      var categoryAxisTitle = vm.timeSelected.categoryAxisTitle;

      CareReportsService.showTaskIncomingDummy('taskIncomingdiv', 'taskIncomingBreakdownDiv', dummyData, categoryAxisTitle, dummyTitle);
      CareReportsService.showTaskOfferedDummy('taskOffereddiv', dummyData, categoryAxisTitle, dummyTitle);
      CareReportsService.showTaskTimeDummy('taskTimeDiv', 'taskTimeBreakdownDiv', dummyData, categoryAxisTitle, dummyTitle);
      CareReportsService.showAverageCsatDummy('averageCsatDiv', 'averageCsatBreakdownDiv', dummyData, categoryAxisTitle, dummyTitle);
      CareReportsService.showTaskAggregateDummy('taskAggregateDiv', dummyData, categoryAxisTitle, dummyTitle);
      resizeCards();
    }

    function generateReportTitle() {
      switch (vm.timeSelected.value) {
        case 0: return (moment().format('MMM D'));
        case 1: return (moment().subtract(1, 'days').format('MMM D'));
        default: return undefined;
      }
    }

    function resizeCards() {
      CardUtils.resize();
    }

    function delayedResize() {
      CardUtils.resize(RESIZE_DELAY_IN_MS);
    }

    function resetCards(filter) {
      if (vm.currentFilter !== filter) {
        vm.displayEngagement = false;
        vm.displayQuality = false;
        if (filter === vm.allReports || filter === vm.engagement) {
          vm.displayEngagement = true;
        }
        if (filter === vm.allReports || filter === vm.quality) {
          vm.displayQuality = true;
        }
        vm.currentFilter = filter;
      }
      resizeCards();
      delayedResize();
    }

    function renderCards(isVideoFeatureEnabled, isVideoCallEnabled) {
      setDrillDownProps({});
      vm.isVideoFeatureEnabled = isVideoFeatureEnabled;
      vm.isVideoCallEnabled = isVideoCallEnabled;
      filtersUpdate();
    }

    FeatureToggleService.atlasCareWebcallReportTrialsGetStatus().then(function (result) {
      if (result === true) {
        mediaTypes.push(MEDIA_TYPE_WEBCALL);
        setMediaTypeOptions(mediaTypes);
      }
    }).catch(function () {});

    var featurePromise = $q.all([FeatureToggleService.atlasCareChatToVideoTrialsGetStatus(),
      SunlightConfigService.getChatConfig()]);
    featurePromise.then(function (result) {
      renderCards(result[0], result[1].data.videoCallEnabled);
    }).catch(function () {
      renderCards(false, false);
    });
  }
})();
