(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerReportsCtrl', CustomerReportsCtrl);

  /* @ngInject */
  function CustomerReportsCtrl($scope, $stateParams, $q, $timeout, $translate, Log, Authinfo, Config, CustomerReportService, DummyCustomerReportService, CustomerGraphService, WebexReportService, Userservice, WebExApiGatewayService, Storage) {
    var vm = this;
    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';

    vm.pageTitle = $translate.instant('reportsPage.pageTitle');
    vm.allReports = 'all';
    vm.engagement = 'engagement';
    vm.quality = 'quality';
    var currentFilter = vm.allReports;

    vm.displayEngagement = true;
    vm.displayQuality = true;

    var activeUsersSort = ['userName', 'numCalls', 'sparkMessages', 'totalActivity'];
    var activeUsersChart = null;
    var previousSearch = "";
    vm.activeUserDescription = "";
    vm.mostActiveTitle = "";
    vm.activeUserStatus = REFRESH;
    vm.mostActiveUserStatus = REFRESH;
    vm.searchPlaceholder = $translate.instant('activeUsers.search');
    vm.searchField = "";
    vm.mostActiveUsers = [];
    vm.showMostActiveUsers = false;
    vm.displayMostActive = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];

    var avgRoomsChart = null;
    vm.avgRoomsDescription = "";
    vm.avgRoomStatus = REFRESH;

    var filesSharedChart = null;
    vm.filesSharedDescription = '';
    vm.filesSharedStatus = REFRESH;

    var mediaChart = null;
    var mediaData = [];
    vm.mediaQualityStatus = REFRESH;
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
    vm.deviceStatus = REFRESH;
    vm.isDevicesEmpty = true;
    vm.deviceDescription = '';
    vm.deviceFilter = [angular.copy(defaultDeviceFilter)];
    vm.selectedDevice = vm.deviceFilter[0];

    var metricsChart = null;
    vm.metricsDescription = '';
    vm.metricStatus = REFRESH;
    vm.metrics = {};

    vm.headerTabs = [{
      title: $translate.instant('reportsPage.sparkReports'),
      state: 'reports'
    }];

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('reportsPage.week'),
      description: $translate.instant('reportsPage.week2')
    }, {
      value: 1,
      label: $translate.instant('reportsPage.month'),
      description: $translate.instant('reportsPage.month2')
    }, {
      value: 2,
      label: $translate.instant('reportsPage.threeMonths'),
      description: $translate.instant('reportsPage.threeMonths2')
    }];
    vm.timeSelected = vm.timeOptions[0];

    vm.timeUpdate = timeUpdate;
    vm.mediaUpdate = mediaUpdate;
    vm.resetCards = resetCards;
    vm.searchMostActive = searchMostActive;
    vm.deviceUpdate = deviceUpdate;

    // Graph data status checks
    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    // Controls for Most Active Users Table
    vm.mostActiveUserSwitch = function () {
      vm.showMostActiveUsers = !vm.showMostActiveUsers;
      resizeCards();
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
      resizeCards();
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
      if (vm.showEngagement) {
        setFilterBasedText();
        $timeout(function () {
          setDummyData();
          setAllGraphs();
        }, 30);
      }
    }

    function timeUpdate() {
      vm.activeUserStatus = REFRESH;
      vm.mostActiveUserStatus = REFRESH;
      vm.avgRoomStatus = REFRESH;
      vm.filesSharedStatus = REFRESH;
      vm.mediaQualityStatus = REFRESH;
      vm.deviceStatus = REFRESH;
      vm.metricStatus = REFRESH;
      vm.metrics = {};
      vm.mediaSelected = vm.mediaOptions[0];

      setFilterBasedText();
      setDummyData();
      setAllGraphs();
    }

    function mediaUpdate() {
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(mediaData, mediaChart, vm.mediaSelected);
      if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
        mediaChart = tempMediaChart;
      }
    }

    function setAllGraphs() {
      setActiveUserData();
      setAvgRoomData();
      setFilesSharedData();
      setMediaData();
      setCallMetricsData();
      setDeviceData();
    }

    function resizeCards() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }

    function delayedResize() {
      // delayed resize necessary to fix any overlapping cards on smaller screens
      $timeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 500);
    }

    function resetCards(filter) {
      if (currentFilter !== filter) {
        vm.displayEngagement = false;
        vm.displayQuality = false;
        if (filter === vm.allReports || filter === vm.engagement) {
          vm.displayEngagement = true;
        }
        if (filter === vm.allReports || filter === vm.quality) {
          vm.displayQuality = true;
        }
        resizeCards();
        delayedResize();
        currentFilter = filter;
      }
    }

    function setFilterBasedText() {
      vm.activeUserDescription = $translate.instant('activeUsers.customerPortalDescription', {
        time: vm.timeSelected.description
      });

      vm.mostActiveTitle = $translate.instant("activeUsers.mostActiveUsers", {
        time: vm.timeSelected.label
      });

      vm.avgRoomsDescription = $translate.instant("avgRooms.avgRoomsDescription", {
        time: vm.timeSelected.description
      });

      vm.filesSharedDescription = $translate.instant("filesShared.filesSharedDescription", {
        time: vm.timeSelected.description
      });

      vm.metricsDescription = $translate.instant("callMetrics.customerDescription", {
        time: vm.timeSelected.description
      });

      vm.videoDescription = $translate.instant("callMetrics.videoDescription", {
        time: vm.timeSelected.description
      });

      vm.deviceDescription = $translate.instant("registeredEndpoints.customerDescription", {
        time: vm.timeSelected.description
      });
    }

    function setDummyData() {
      setActiveGraph(DummyCustomerReportService.dummyActiveUserData(vm.timeSelected));
      setAverageGraph(DummyCustomerReportService.dummyAvgRoomData(vm.timeSelected));
      setFilesGraph(DummyCustomerReportService.dummyFilesSharedData(vm.timeSelected));
      setMetricGraph(DummyCustomerReportService.dummyMetricsData());
      setDeviceGraph(DummyCustomerReportService.dummyDeviceData(vm.timeSelected));
      setMediaGraph(DummyCustomerReportService.dummyMediaData(vm.timeSelected), {
        value: 0
      });

      resizeCards();
    }

    function setActiveGraph(data) {
      var tempActiveUserChart = CustomerGraphService.setActiveUsersGraph(data, activeUsersChart);
      if (tempActiveUserChart !== null && angular.isDefined(tempActiveUserChart)) {
        activeUsersChart = tempActiveUserChart;
      }
    }

    function setActiveUserData() {
      vm.activeUsersTotalPages = 0;
      vm.activeUserCurrentPage = 0;
      vm.searchField = "";
      previousSearch = "";
      vm.showMostActiveUsers = false;
      vm.displayMostActive = false;
      CustomerReportService.getActiveUserData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.graphData.length === 0) {
          vm.activeUserStatus = EMPTY;
        } else {
          setActiveGraph(response.graphData);
          vm.activeUserStatus = SET;
          vm.displayMostActive = response.isActiveUsers;
        }
        resizeCards();
      });
      CustomerReportService.getMostActiveUserData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.mostActiveUserStatus = EMPTY;
        } else {
          vm.activeUserPredicate = activeUsersSort[3];
          vm.mostActiveUsers = response;
          vm.activeUserCurrentPage = 1;
          vm.activeButton = [1, 2, 3];
          vm.mostActiveUserStatus = SET;
        }
        resizeCards();
      });
    }

    function searchMostActive() {
      var returnArray = [];
      angular.forEach(vm.mostActiveUsers, function (item, index, array) {
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
      }
      $timeout(function () {
        resizeCards();
      }, 10);
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
          vm.avgRoomStatus = EMPTY;
        } else {
          setAverageGraph(response);
          vm.avgRoomStatus = SET;
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
          vm.filesSharedStatus = EMPTY;
        } else {
          setFilesGraph(response);
          vm.filesSharedStatus = SET;
        }
      });
    }

    function setMediaGraph(data, mediaFilter) {
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(data, mediaChart, mediaFilter);
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
          vm.mediaQualityStatus = EMPTY;
        } else {
          mediaData = response;
          setMediaGraph(mediaData, vm.mediaSelected);
          vm.mediaQualityStatus = SET;
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
        } else if (response.dataProvider.length === 0) {
          vm.metricStatus = EMPTY;
        } else {
          setMetricGraph(response);
          vm.metrics = response.displayData;
          vm.metricStatus = SET;
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
      vm.deviceFilter = [angular.copy(defaultDeviceFilter)];
      vm.selectedDevice = vm.deviceFilter[0];
      currentDeviceGraphs = [];
      vm.isDevicesEmpty = true;
      CustomerReportService.getDeviceData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.filterArray.length === 0) {
          vm.deviceStatus = EMPTY;
        } else {
          vm.deviceFilter = response.filterArray.sort(function (a, b) {
            return a.label.localeCompare(b.label);
          });
          vm.selectedDevice = vm.deviceFilter[0];
          currentDeviceGraphs = response.graphData;

          if (!currentDeviceGraphs[vm.selectedDevice.value].emptyGraph) {
            setDeviceGraph(currentDeviceGraphs, vm.selectedDevice);
            vm.deviceStatus = SET;
            vm.isDevicesEmpty = false;
          } else {
            vm.deviceStatus = EMPTY;
          }
        }
      });
    }

    function deviceUpdate() {
      if (currentDeviceGraphs.length > 0 && !currentDeviceGraphs[vm.selectedDevice.value].emptyGraph) {
        var tempDevicesChart = CustomerGraphService.setDeviceGraph(currentDeviceGraphs, deviceChart, vm.selectedDevice);
        if (tempDevicesChart !== null && angular.isDefined(tempDevicesChart)) {
          deviceChart = tempDevicesChart;
        }
        vm.deviceStatus = SET;
      } else {
        var tempDeviceChart = CustomerGraphService.setDeviceGraph(DummyCustomerReportService.dummyDeviceData(vm.timeSelected), deviceChart);
        if (tempDeviceChart !== null && angular.isDefined(tempDeviceChart)) {
          deviceChart = tempDeviceChart;
        }
        vm.deviceStatus = EMPTY;
      }
    }

    // WEBEX side of the page has been copied from the existing reports page
    $scope.webexReportsObject = {};
    $scope.webexOptions = [];
    $scope.webexSelected = null;

    if ($stateParams.tab === 'webex') {
      vm.showEngagement = false;
      vm.showWebexReports = true;
    } else {
      vm.showEngagement = true;
      vm.showWebexReports = false;
    }

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
            WebExApiGatewayService.isSiteSupportsIframe(url).then(
              function getSiteSupportsIframeSuccess(result) {
                if (result.isAdminReportEnabled && result.isIframeSupported) {
                  $scope.webexOptions.push(result.siteUrl);

                  if (!vm.showWebexTab) {
                    vm.headerTabs.push({
                      title: $translate.instant('reportsPage.webex'),
                      state: 'webex-reports'
                    });

                    vm.showWebexTab = true;
                  }
                }
              },

              function getSiteSupportsIframeError(error) {
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
          if (vm.showWebexReports) {
            // TODO: add code to sort the siteUrls in the dropdown to be in alphabetical order

            // get the information needed for the webex reports index page
            var stateParamsSiteUrl = $stateParams.siteUrl;
            var stateParamsSiteUrlIndex = $scope.webexOptions.indexOf(stateParamsSiteUrl);

            var storageReportsSiteUrl = Storage.get('webexReportsSiteUrl');
            var storageReportsSiteUrlIndex = $scope.webexOptions.indexOf(storageReportsSiteUrl);

            // initialize the site that the webex reports index page will display
            var webexSelected = null;
            if (-1 !== stateParamsSiteUrlIndex) { // if a valid siteUrl is passed in, the reports index page should reflect that site
              webexSelected = stateParamsSiteUrl;
            } else if (-1 !== storageReportsSiteUrlIndex) { // otherwise, if a valid siteUrl is in the local storage, the reports index page should reflect that site
              webexSelected = storageReportsSiteUrl;
            } else { // otherwise, the reports index page should reflect the 1st site that is in the dropdown list
              webexSelected = $scope.webexOptions[0];
            }

            logMsg = funcName + ": " + "\n" +
              "stateParamsSiteUrl=" + stateParamsSiteUrl + "\n" +
              "stateParamsSiteUrlIndex=" + stateParamsSiteUrlIndex + "\n" +
              "storageReportsSiteUrl=" + storageReportsSiteUrl + "\n" +
              "storageReportsSiteUrlIndex=" + storageReportsSiteUrlIndex + "\n" +
              "webexSelected=" + webexSelected;
            Log.debug(logMsg);

            $scope.webexSelected = webexSelected;
            $scope.updateWebexReports();
          }
        }
      );
    }

    if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
      generateWebexReportsUrl();
    } else {
      Userservice.getUser(
        'me',
        function (data, status) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              generateWebexReportsUrl();
            }
          }
        }
      );
    }

    $scope.updateWebexReports = function () {
      var storageReportsSiteUrl = Storage.get('webexReportsSiteUrl');
      var scopeWebexSelected = $scope.webexSelected;

      var logMsg = "updateWebexReports(): " + "\n" +
        "scopeWebexSelected=" + scopeWebexSelected + "\n" +
        "storageReportsSiteUrl=" + storageReportsSiteUrl;
      Log.debug(logMsg);

      $scope.webexReportsObject = WebexReportService.initReportsObject(scopeWebexSelected);
      $scope.infoCardObj = $scope.webexReportsObject.infoCardObj;

      if (scopeWebexSelected !== storageReportsSiteUrl) {
        Storage.put('webexReportsSiteUrl', scopeWebexSelected);
      }
    };

    init();
  }
})();
