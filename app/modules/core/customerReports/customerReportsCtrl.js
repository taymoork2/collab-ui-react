(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerReportsCtrl', CustomerReportsCtrl);

  /* @ngInject */
  function CustomerReportsCtrl($state, $stateParams, $q, $timeout, $translate, Log, Authinfo, CustomerReportService, ReportConstants, DummyCustomerReportService, CustomerGraphService, WebexReportService, Userservice, WebExApiGatewayService, Storage, FeatureToggleService, MediaServiceActivationV2) {
    var vm = this;
    var ABORT = 'ABORT';

    // Feature Toggles
    var reportsUpdateToggle = FeatureToggleService.atlasReportsUpdateGetStatus();
    var deviceUsageToggle = FeatureToggleService.atlasDeviceUsageReportGetStatus();

    vm.pageTitle = $translate.instant('reportsPage.pageTitle');
    vm.ALL = ReportConstants.ALL;
    vm.ENGAGEMENT = ReportConstants.ENGAGEMENT;
    vm.QUALITY = ReportConstants.QUALITY;
    vm.currentFilter = vm.ALL;

    vm.filterArray = _.cloneDeep(ReportConstants.filterArray);
    vm.filterArray[0].toggle = function () {
      resetCards(vm.ALL);
    };
    vm.filterArray[1].toggle = function () {
      resetCards(vm.ENGAGEMENT);
    };
    vm.filterArray[2].toggle = function () {
      resetCards(vm.QUALITY);
    };

    vm.displayEngagement = true;
    vm.displayQuality = true;

    vm.tab = $stateParams.tab;
    vm.headerTabs = [{
      title: $translate.instant('reportsPage.sparkReports'),
      state: 'reports'
    }];

    var isActiveUsers = false;
    var activeUsersSort = ['userName', 'numCalls', 'sparkMessages', 'totalActivity'];
    var activeUsersChart = null;
    var previousSearch = '';
    vm.threeMonthTooltip = $translate.instant('activeUsers.threeMonthsMessage');
    vm.activeUserStatus = ReportConstants.REFRESH;
    vm.mostActiveUserStatus = ReportConstants.REFRESH;
    vm.searchPlaceholder = $translate.instant('activeUsers.search');
    vm.searchField = '';
    vm.mostActiveUsers = [];
    vm.showMostActiveUsers = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];
    vm.activeOptions = [{
      value: 0,
      label: $translate.instant('activeUsers.allUsers')
    }, {
      value: 1,
      label: $translate.instant('activeUsers.activeUsers')
    }];
    vm.activeSelected = vm.activeOptions[0];
    vm.displayActiveLineGraph = false;

    var avgRoomsChart = null;
    vm.avgRoomOptions = {
      animate: false,
      description: 'avgRooms.avgRoomsDescription',
      headerTitle: 'avgRooms.avgRooms',
      id: 'avgRooms',
      reportType: ReportConstants.BARCHART,
      state: ReportConstants.REFRESH,
      table: undefined,
      titlePopover: ReportConstants.UNDEF,
    };

    var filesSharedChart = null;
    vm.filesSharedOptions = {
      animate: false,
      description: 'filesShared.filesSharedDescription',
      headerTitle: 'filesShared.filesShared',
      id: 'filesShared',
      reportType: ReportConstants.BARCHART,
      state: ReportConstants.REFRESH,
      table: undefined,
      titlePopover: ReportConstants.UNDEF,
    };

    var mediaChart = null;
    var mediaData = [];
    vm.mediaQualityStatus = ReportConstants.REFRESH;
    vm.mediaQualityPopover = $translate.instant('mediaQuality.packetLossDefinition');
    vm.mediaOptions = [{
      value: 0,
      label: $translate.instant('reportsPage.allCalls')
    }, {
      value: 1,
      label: $translate.instant('reportsPage.audioCalls')
    }, {
      value: 2,
      label: $translate.instant('reportsPage.videoCalls')
    }];
    vm.mediaSelected = vm.mediaOptions[0];

    var deviceChart = null;
    var currentDeviceGraphs = [];
    var defaultDeviceFilter = {
      value: 0,
      label: $translate.instant('registeredEndpoints.allDevices')
    };
    vm.deviceStatus = ReportConstants.REFRESH;
    vm.isDevicesEmpty = true;
    vm.deviceFilter = [angular.copy(defaultDeviceFilter)];
    vm.selectedDevice = vm.deviceFilter[0];

    var metricsChart = null;
    vm.metricStatus = ReportConstants.REFRESH;
    vm.metrics = {};

    var promises = {
      mf: FeatureToggleService.atlasMediaServiceMetricsGetStatus(),
      care: FeatureToggleService.atlasCareTrialsGetStatus(),
      isMfEnabled: MediaServiceActivationV2.getMediaServiceState()
    };

    $q.all(promises).then(function (features) {
      if (features.mf && features.isMfEnabled) {
        vm.headerTabs.unshift({
          title: $translate.instant('mediaFusion.page_title'),
          state: 'reports-metrics'
        });
      }
      if (Authinfo.isCare() && features.care) {
        vm.headerTabs.push({
          title: $translate.instant('reportsPage.careTab'),
          state: 'reports.care'
        });
      }
    });

    vm.timeOptions = _.cloneDeep(ReportConstants.timeFilter);
    vm.timeSelected = vm.timeOptions[0];

    vm.timeUpdate = timeUpdate;
    vm.mediaUpdate = mediaUpdate;
    vm.activityUpdate = activityUpdate;
    vm.isActiveDisabled = isActiveDisabled;
    vm.searchMostActive = searchMostActive;
    vm.deviceUpdate = deviceUpdate;
    vm.getDescription = getDescription;
    vm.getAltDescription = getAltDescription;
    vm.getHeader = getHeader;
    vm.getAltHeader = getAltHeader;
    vm.goToUsersTab = goToUsersTab;

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === ReportConstants.REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === ReportConstants.EMPTY;
    };

    vm.isError = function (tab) {
      return tab === ReportConstants.ERROR;
    };

    // Controls for Most Active Users Table
    vm.mostActiveUserSwitch = function () {
      vm.showMostActiveUsers = !vm.showMostActiveUsers;
      resize(0);
    };

    vm.activePage = function (num) {
      return vm.activeUserCurrentPage === Math.ceil((num + 1) / 5);
    };

    vm.mostActiveSort = function (num) {
      if (vm.activeUserPredicate === activeUsersSort[num]) {
        vm.activeUserReverse = !vm.activeUserReverse;
      } else {
        if (num >= 1) {
          vm.activeUserReverse = true;
        } else {
          vm.activeUserReverse = false;
        }
        vm.activeUserPredicate = activeUsersSort[num];
      }
    };

    vm.changePage = function (num) {
      if ((num > 1) && (num < vm.activeUsersTotalPages)) {
        vm.activeButton[0] = (num - 1);
        vm.activeButton[1] = num;
        vm.activeButton[2] = (num + 1);
      }
      vm.activeUserCurrentPage = num;
      resize(0);
    };

    vm.pageForward = function () {
      if (vm.activeUserCurrentPage < vm.activeUsersTotalPages) {
        vm.changePage(vm.activeUserCurrentPage + 1);
      }
    };

    vm.pageBackward = function () {
      if (vm.activeUserCurrentPage > 1) {
        vm.changePage(vm.activeUserCurrentPage - 1);
      }
    };

    function init() {
      deviceUsageToggle.then(function (response) {
        if (response) {
          vm.headerTabs.push({
            title: $translate.instant('reportsPage.usageReports.usageReportTitle'),
            state: 'reports.device-usage.overview'
          });
        }
      });

      reportsUpdateToggle.then(function (response) {
        vm.displayActiveLineGraph = response;
        if (vm.displayActiveLineGraph) {
          vm.timeOptions[2].label = $translate.instant('reportsPage.threePlusMonths');
        }

        if (!vm.tab) {
          $timeout(function () {
            setDummyData();
            setAllGraphs();
          }, 30);
        }
      });
    }

    function timeUpdate() {
      vm.activeUserStatus = ReportConstants.REFRESH;
      vm.mostActiveUserStatus = ReportConstants.REFRESH;
      vm.avgRoomOptions.state = ReportConstants.REFRESH;
      vm.filesSharedOptions.state = ReportConstants.REFRESH;
      vm.mediaQualityStatus = ReportConstants.REFRESH;
      vm.deviceStatus = ReportConstants.REFRESH;
      vm.metricStatus = ReportConstants.REFRESH;
      vm.metrics = {};
      vm.mediaSelected = vm.mediaOptions[0];
      vm.activeSelected = vm.activeOptions[0];

      setDummyData();
      setAllGraphs();
    }

    function mediaUpdate() {
      setMediaGraph(mediaData);
    }

    function activityUpdate() {
      CustomerGraphService.showHideActiveLineGraph(activeUsersChart, vm.activeSelected);
    }

    function isActiveDisabled() {
      return (vm.isEmpty(vm.activeUserStatus) || vm.isRefresh(vm.activeUserStatus) || !isActiveUsers);
    }

    function setAllGraphs() {
      setActiveUserData();
      setAvgRoomData();
      setFilesSharedData();
      setMediaData();
      setCallMetricsData();
      setDeviceData();
    }

    function resize(delay) {
      $timeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, delay);
    }

    function resetCards(filter) {
      if (vm.currentFilter !== filter) {
        vm.displayEngagement = false;
        vm.displayQuality = false;
        if (filter === vm.ALL || filter === vm.ENGAGEMENT) {
          vm.displayEngagement = true;
        }
        if (filter === vm.ALL || filter === vm.QUALITY) {
          vm.displayQuality = true;
        }
        resize(500);
        vm.currentFilter = filter;
      }
    }

    function getDescription(text) {
      return $translate.instant(text, {
        time: vm.timeSelected.description
      });
    }

    function getAltDescription(text) {
      if (vm.timeSelected.value === ReportConstants.FILTER_THREE.value && vm.displayActiveLineGraph) {
        return $translate.instant(text, {
          time: $translate.instant('reportsPage.lastTwelveWeeks2')
        });
      } else {
        return getDescription(text);
      }
    }

    function getHeader(text) {
      return $translate.instant(text, {
        time: vm.timeSelected.label
      });
    }

    function getAltHeader(text) {
      if (vm.timeSelected.value === ReportConstants.FILTER_THREE.value && vm.displayActiveLineGraph) {
        return $translate.instant(text, {
          time: $translate.instant('reportsPage.lastTwelveWeeks')
        });
      } else {
        return getHeader(text);
      }
    }

    function goToUsersTab() {
      $state.go('users.list');
    }

    function setDummyData() {
      setActiveGraph(DummyCustomerReportService.dummyActiveUserData(vm.timeSelected, vm.displayActiveLineGraph));
      setAverageGraph(DummyCustomerReportService.dummyAvgRoomData(vm.timeSelected));
      setFilesGraph(DummyCustomerReportService.dummyFilesSharedData(vm.timeSelected));
      setMetricGraph(DummyCustomerReportService.dummyMetricsData());
      setDeviceGraph(DummyCustomerReportService.dummyDeviceData(vm.timeSelected));
      setMediaGraph(DummyCustomerReportService.dummyMediaData(vm.timeSelected));

      resize(0);
    }

    function setActiveGraph(data) {
      var tempActiveUserChart;
      if (vm.displayActiveLineGraph) {
        tempActiveUserChart = CustomerGraphService.setActiveLineGraph(data, activeUsersChart, vm.timeSelected);
      } else {
        tempActiveUserChart = CustomerGraphService.setActiveUsersGraph(data, activeUsersChart);
      }

      if (tempActiveUserChart !== null && angular.isDefined(tempActiveUserChart)) {
        activeUsersChart = tempActiveUserChart;
        if (vm.displayActiveLineGraph) {
          CustomerGraphService.showHideActiveLineGraph(activeUsersChart, vm.activeSelected);
        }
      }
    }

    function setActiveUserData() {
      // reset defaults
      vm.activeUsersTotalPages = 0;
      vm.activeUserCurrentPage = 0;
      vm.searchField = '';
      previousSearch = '';
      vm.showMostActiveUsers = false;
      isActiveUsers = false;

      CustomerReportService.getActiveUserData(vm.timeSelected, vm.displayActiveLineGraph).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (_.isArray(response.graphData) && response.graphData.length === 0) {
          vm.activeUserStatus = ReportConstants.EMPTY;
        } else {
          setActiveGraph(response.graphData);
          isActiveUsers = response.isActiveUsers;
          vm.activeUserStatus = ReportConstants.SET;
        }
        resize(0);
      });

      CustomerReportService.getMostActiveUserData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.error) {
          vm.mostActiveUserStatus = ReportConstants.ERROR;
          vm.mostActiveUsers = response.tableData;
        } else if (response.tableData.length === 0) {
          vm.mostActiveUserStatus = ReportConstants.EMPTY;
          vm.mostActiveUsers = response.tableData;
        } else {
          vm.activeUserPredicate = activeUsersSort[3];
          vm.mostActiveUsers = response.tableData;
          vm.activeUserCurrentPage = 1;
          vm.activeButton = [1, 2, 3];
          vm.mostActiveUserStatus = ReportConstants.SET;
        }
        resize(0);
      });
    }

    function searchMostActive() {
      var returnArray = [];
      angular.forEach(vm.mostActiveUsers, function (item) {
        var userName = item.userName;
        if (vm.searchField === undefined || vm.searchField === '' || (angular.isDefined(userName) && (userName.toString().toLowerCase().replace(/_/g, ' ')).indexOf(vm.searchField.toLowerCase().replace(/_/g, ' ')) > -1)) {
          returnArray.push(item);
        }
      });
      if (vm.activeUsersTotalPages !== Math.ceil(returnArray.length / 5) || previousSearch !== vm.searchField) {
        vm.activeUserCurrentPage = 1;
        vm.activeButton = [1, 2, 3];
        vm.activeUsersTotalPages = Math.ceil(returnArray.length / 5);
        previousSearch = vm.searchField;
        resize(0);
      }
      return returnArray;
    }

    function setAverageGraph(data) {
      var tempAvgRoomsChart = CustomerGraphService.setAvgRoomsGraph(data, avgRoomsChart);
      if (tempAvgRoomsChart !== null && angular.isDefined(tempAvgRoomsChart)) {
        avgRoomsChart = tempAvgRoomsChart;
      }
    }

    function setAvgRoomData() {
      CustomerReportService.getAvgRoomData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.avgRoomOptions.state = ReportConstants.EMPTY;
        } else {
          setAverageGraph(response);
          vm.avgRoomOptions.state = ReportConstants.SET;
        }
      });
    }

    function setFilesGraph(data) {
      var tempFilesSharedChart = CustomerGraphService.setFilesSharedGraph(data, filesSharedChart);
      if (tempFilesSharedChart !== null && angular.isDefined(tempFilesSharedChart)) {
        filesSharedChart = tempFilesSharedChart;
      }
    }

    function setFilesSharedData() {
      CustomerReportService.getFilesSharedData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.filesSharedOptions.state = ReportConstants.EMPTY;
        } else {
          setFilesGraph(response);
          vm.filesSharedOptions.state = ReportConstants.SET;
        }
      });
    }

    function setMediaGraph(data) {
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(data, mediaChart, vm.mediaSelected);
      if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
        mediaChart = tempMediaChart;
      }
    }

    function setMediaData() {
      mediaData = [];
      CustomerReportService.getMediaQualityData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.mediaQualityStatus = ReportConstants.EMPTY;
        } else {
          mediaData = response;
          setMediaGraph(mediaData);
          vm.mediaQualityStatus = ReportConstants.SET;
        }
      });
    }

    function setMetricGraph(data) {
      var tempMetricsChart = CustomerGraphService.setMetricsGraph(data, metricsChart);
      if (tempMetricsChart !== null && angular.isDefined(tempMetricsChart)) {
        metricsChart = tempMetricsChart;
      }
    }

    function setCallMetricsData() {
      CustomerReportService.getCallMetricsData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (_.isArray(response.dataProvider) && response.dataProvider.length === 0) {
          vm.metricStatus = ReportConstants.EMPTY;
        } else {
          setMetricGraph(response);
          vm.metrics = response.displayData;
          vm.metricStatus = ReportConstants.SET;
        }
      });
    }

    function setDeviceGraph(data, deviceFilter) {
      var tempDevicesChart = CustomerGraphService.setDeviceGraph(data, deviceChart, deviceFilter);
      if (tempDevicesChart !== null && angular.isDefined(tempDevicesChart)) {
        deviceChart = tempDevicesChart;
      }
    }

    function setDeviceData() {
      vm.deviceFilter = [_.cloneDeep(defaultDeviceFilter)];
      vm.selectedDevice = vm.deviceFilter[0];
      currentDeviceGraphs = [];
      vm.isDevicesEmpty = true;

      CustomerReportService.getDeviceData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.emptyGraph) {
          vm.deviceStatus = ReportConstants.EMPTY;
        } else {
          vm.deviceFilter = response.filterArray.sort(function (a, b) {
            if (a.label) {
              return a.label.localeCompare(b.label);
            } else {
              return a > b;
            }
          });
          vm.selectedDevice = vm.deviceFilter[0];
          currentDeviceGraphs = response.graphData;

          if (!currentDeviceGraphs[vm.selectedDevice.value].emptyGraph) {
            setDeviceGraph(currentDeviceGraphs, vm.selectedDevice);
            vm.deviceStatus = ReportConstants.SET;
            vm.isDevicesEmpty = false;
          } else {
            vm.deviceStatus = ReportConstants.EMPTY;
          }
        }
      });
    }

    function deviceUpdate() {
      if (currentDeviceGraphs[vm.selectedDevice.value].emptyGraph) {
        var tempDeviceChart = CustomerGraphService.setDeviceGraph(DummyCustomerReportService.dummyDeviceData(vm.timeSelected), deviceChart);
        if (tempDeviceChart !== null && angular.isDefined(tempDeviceChart)) {
          deviceChart = tempDeviceChart;
        }
        vm.deviceStatus = ReportConstants.EMPTY;
      } else {
        var tempDevicesChart = CustomerGraphService.setDeviceGraph(currentDeviceGraphs, deviceChart, vm.selectedDevice);
        if (tempDevicesChart !== null && angular.isDefined(tempDevicesChart)) {
          deviceChart = tempDevicesChart;
        }
        vm.deviceStatus = ReportConstants.SET;
      }
    }

    // WEBEX side of the page has been copied from the existing reports page
    vm.webexReportsObject = {};
    vm.webexOptions = [];
    vm.webexSelected = null;
    vm.updateWebexReports = updateWebexReports;

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function getUniqueWebexSiteUrls() {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var webexSiteUrls = [];

      conferenceServices.forEach(
        function getWebExSiteUrl(conferenceService) {
          webexSiteUrls.push(conferenceService.license.siteUrl);
        }
      );

      return webexSiteUrls.filter(onlyUnique);
    }

    function generateWebexReportsUrl() {
      var promiseChain = [];
      var webexSiteUrls = getUniqueWebexSiteUrls(); // strip off any duplicate webexSiteUrl to prevent unnecessary XML API calls

      webexSiteUrls.forEach(
        function chkWebexSiteUrl(url) {
          promiseChain.push(
            WebExApiGatewayService.siteFunctions(url).then(
              function getSiteSupportsIframeSuccess(result) {
                if (result.isAdminReportEnabled && result.isIframeSupported) {
                  vm.webexOptions.push(result.siteUrl);

                  if (!vm.showWebexTab) {
                    vm.headerTabs.push({
                      title: $translate.instant('reportsPage.webex'),
                      state: 'webex-reports'
                    });

                    vm.showWebexTab = true;
                  }
                }
              },

              function getSiteSupportsIframeError() {
                //no-op, but needed
              }
            )
          );
        }
      );

      $q.all(promiseChain).then(
        function promisChainDone() {
          var funcName = "promisChainDone()";
          var logMsg = "";

          // if we are displaying the webex reports index page then go ahead with the rest of the code
          if (vm.tab === 'webex') {
            // TODO: add code to sort the siteUrls in the dropdown to be in alphabetical order

            // get the information needed for the webex reports index page
            var stateParamsSiteUrl = $stateParams.siteUrl;
            var stateParamsSiteUrlIndex = vm.webexOptions.indexOf(stateParamsSiteUrl);

            var storageReportsSiteUrl = Storage.get('webexReportsSiteUrl');
            var storageReportsSiteUrlIndex = vm.webexOptions.indexOf(storageReportsSiteUrl);

            // initialize the site that the webex reports index page will display
            var webexSelected = null;
            if (-1 !== stateParamsSiteUrlIndex) { // if a valid siteUrl is passed in, the reports index page should reflect that site
              webexSelected = stateParamsSiteUrl;
            } else if (-1 !== storageReportsSiteUrlIndex) { // otherwise, if a valid siteUrl is in the local storage, the reports index page should reflect that site
              webexSelected = storageReportsSiteUrl;
            } else { // otherwise, the reports index page should reflect the 1st site that is in the dropdown list
              webexSelected = vm.webexOptions[0];
            }

            logMsg = funcName + ": " + "\n" +
              "stateParamsSiteUrl=" + stateParamsSiteUrl + "\n" +
              "stateParamsSiteUrlIndex=" + stateParamsSiteUrlIndex + "\n" +
              "storageReportsSiteUrl=" + storageReportsSiteUrl + "\n" +
              "storageReportsSiteUrlIndex=" + storageReportsSiteUrlIndex + "\n" +
              "webexSelected=" + webexSelected;
            Log.debug(logMsg);

            vm.webexSelected = webexSelected;
            updateWebexReports();
          }
        }
      );
    }

    if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
      generateWebexReportsUrl();
    } else {
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              generateWebexReportsUrl();
            }
          }
        }
      );
    }

    function updateWebexReports() {
      var funcName = "updateWebexReports()";
      var logMsg = "";

      var storageReportsSiteUrl = Storage.get('webexReportsSiteUrl');
      var webexSelected = vm.webexSelected;

      logMsg = funcName + "\n" +
        "storageReportsSiteUrl=" + storageReportsSiteUrl + "\n" +
        "webexSelected=" + webexSelected;
      Log.debug(logMsg);

      vm.webexReportsObject = WebexReportService.initReportsObject(webexSelected);

      if (webexSelected !== storageReportsSiteUrl) {
        Storage.put('webexReportsSiteUrl', webexSelected);
      }
    }

    init();
  }
})();
