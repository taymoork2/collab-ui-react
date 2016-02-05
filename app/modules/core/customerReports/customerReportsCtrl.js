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
    var activeUserCard = null;
    var previousSearch = "";
    vm.activeUserDescription = "";
    vm.mostActiveTitle = "";
    vm.activeUserStatus = REFRESH;
    vm.mostActiveUserStatus = REFRESH;
    vm.searchPlaceholder = $translate.instant('activeUsers.search');
    vm.searchField = "";
    vm.mostActiveUsers = [];
    vm.showMostActiveUsers = false;
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[3];
    vm.activeButton = [1, 2, 3];

    var avgRoomsChart = null;
    var avgRoomsCard = null;
    vm.avgRoomsDescription = "";
    vm.avgRoomStatus = REFRESH;

    var filesSharedChart = null;
    var filesSharedCard = null;
    vm.filesSharedDescription = '';
    vm.filesSharedStatus = REFRESH;

    var mediaChart = null;
    var mediaCard = null;
    vm.mediaQualityStatus = REFRESH;
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
    var deviceCard = null;
    var currentDeviceGraphs = [];
    var defaultDeviceFilter = {
      value: 0,
      label: $translate.instant('registeredEndpoints.allDevices')
    };
    vm.deviceStatus = REFRESH;
    vm.deviceDescription = '';
    vm.deviceFilter = [angular.copy(defaultDeviceFilter)];
    vm.selectedDevice = vm.deviceFilter[0];

    var metricsChart = null;
    var metricsCard = null;
    vm.metricsDescription = '';
    vm.metricStatus = REFRESH;
    vm.metrics = {};

    vm.headerTabs = [{
      title: $translate.instant('reportsPage.engagement'),
      state: 'reports'
    }, {
      title: $translate.instant('reportsPage.sparkReports'),
      state: 'devReports'
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
    vm.mostActiveUserSwitch = mostActiveUserSwitch;
    vm.resetCards = resetCards;
    vm.searchMostActive = searchMostActive;
    vm.deviceUpdate = deviceUpdate;

    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
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

          setActiveUserData();
          setAvgRoomData();
          setFilesSharedData();
          setMediaData();
          setCallMetricsData();
          setDeviceData();
        }, 30);
      }
    }

    function resizeCards() {
      setTimeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 300);
    }

    function mostActiveUserSwitch() {
      vm.showMostActiveUsers = !vm.showMostActiveUsers;
      resizeCards();
    }

    function resetCards(filter) {
      if (currentFilter !== filter) {
        var engagementElems = [avgRoomsCard, activeUserCard, filesSharedCard, deviceCard];
        var qualityElems = [mediaCard, metricsCard];

        if (filter === vm.allReports) {
          if (!vm.displayEngagement) {
            $('.cs-card-layout').prepend(engagementElems).masonry('prepended', engagementElems);
          }
          if (!vm.displayQuality) {
            $('.cs-card-layout').append(qualityElems).masonry('appended', qualityElems);
          }
          vm.displayEngagement = true;
          vm.displayQuality = true;
        } else if (filter === vm.engagement) {
          if (!vm.displayEngagement) {
            $('.cs-card-layout').append(engagementElems).masonry('appended', engagementElems);
          }
          if (vm.displayQuality) {
            $('.cs-card-layout').masonry('remove', qualityElems);
          }
          vm.displayEngagement = true;
          vm.displayQuality = false;
        } else if (filter === vm.quality) {
          if (!vm.displayQuality) {
            $('.cs-card-layout').append(qualityElems).masonry('appended', qualityElems);
          }
          if (vm.displayEngagement) {
            $('.cs-card-layout').masonry('remove', engagementElems);
          }
          vm.displayEngagement = false;
          vm.displayQuality = true;
        }

        currentFilter = filter;
        resizeCards();
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

      vm.deviceDescription = $translate.instant("registeredEndpoints.description", {
        time: vm.timeSelected.description
      });
    }

    function setDummyData() {
      var activeUserData = DummyCustomerReportService.dummyActiveUserData(vm.timeSelected);
      var tempActiveUserChart = CustomerGraphService.setActiveUsersGraph(activeUserData, activeUsersChart);
      if (tempActiveUserChart !== null && angular.isDefined(tempActiveUserChart)) {
        activeUsersChart = tempActiveUserChart;
      }

      var avgRoomData = DummyCustomerReportService.dummyAvgRoomData(vm.timeSelected);
      var tempAvgRoomsChart = CustomerGraphService.setAvgRoomsGraph(avgRoomData, avgRoomsChart);
      if (tempAvgRoomsChart !== null && angular.isDefined(tempAvgRoomsChart)) {
        avgRoomsChart = tempAvgRoomsChart;
      }

      var filesSharedData = DummyCustomerReportService.dummyFilesSharedData(vm.timeSelected);
      var tempFilesSharedChart = CustomerGraphService.setFilesSharedGraph(filesSharedData, filesSharedChart);
      if (tempFilesSharedChart !== null && angular.isDefined(tempFilesSharedChart)) {
        filesSharedChart = tempFilesSharedChart;
      }

      var mediaData = DummyCustomerReportService.dummyMediaData(vm.timeSelected);
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(mediaData, mediaChart, {
        value: 0
      });
      if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
        mediaChart = tempMediaChart;
      }

      var metricsData = DummyCustomerReportService.dummyMetricsData();
      var tempMetricsChart = CustomerGraphService.setMetricsGraph(metricsData, metricsChart);
      if (tempMetricsChart !== null && angular.isDefined(tempMetricsChart)) {
        metricsChart = tempMetricsChart;
      }

      var deviceData = DummyCustomerReportService.dummyDeviceData(vm.timeSelected);
      var tempDevicesChart = CustomerGraphService.setDeviceGraph(deviceData, deviceChart);
      if (tempDevicesChart !== null && angular.isDefined(tempDevicesChart)) {
        deviceChart = tempDevicesChart;
      }

      resizeCards();
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

      setActiveUserData();
      setAvgRoomData();
      setFilesSharedData();
      setMediaData();
      setCallMetricsData();
      setDeviceData();
    }

    function mediaUpdate() {
      vm.mediaQualityStatus = REFRESH;

      var mediaData = DummyCustomerReportService.dummyMediaData(vm.timeSelected);
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(mediaData, mediaChart, {
        value: 0
      });
      if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
        mediaChart = tempMediaChart;
      }

      setMediaData();
    }

    function setActiveUserData() {
      vm.activeUsersTotalPages = 0;
      vm.activeUserCurrentPage = 0;
      vm.searchField = "";
      previousSearch = "";
      vm.showMostActiveUsers = false;
      CustomerReportService.getActiveUserData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.activeUserStatus = EMPTY;
        } else {
          var tempActiveUserChart = CustomerGraphService.setActiveUsersGraph(response, activeUsersChart);
          if (tempActiveUserChart !== null && angular.isDefined(tempActiveUserChart)) {
            activeUsersChart = tempActiveUserChart;
          }
          vm.activeUserStatus = SET;
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
        resizeCards();
      });
      activeUserCard = document.getElementById('active-user-card');
    }

    function searchMostActive() {
      var returnArray = [];
      angular.forEach(vm.mostActiveUsers, function (item, index, array) {
        var userName = item.userName;
        if (vm.searchField === undefined || vm.searchField === '' || (userName.toString().toLowerCase().replace(/_/g, ' ')).indexOf(vm.searchField.toLowerCase().replace(/_/g, ' ')) > -1) {
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

    function setAvgRoomData() {
      CustomerReportService.getAvgRoomData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.avgRoomStatus = EMPTY;
        } else {
          var tempAvgRoomsChart = CustomerGraphService.setAvgRoomsGraph(response, avgRoomsChart);
          if (tempAvgRoomsChart !== null && angular.isDefined(tempAvgRoomsChart)) {
            avgRoomsChart = tempAvgRoomsChart;
          }
          vm.avgRoomStatus = SET;
        }
        avgRoomsCard = document.getElementById('avg-room-card');
      });
    }

    function setFilesSharedData() {
      CustomerReportService.getFilesSharedData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.filesSharedStatus = EMPTY;
        } else {
          var tempFilesSharedChart = CustomerGraphService.setFilesSharedGraph(response, filesSharedChart);
          if (tempFilesSharedChart !== null && angular.isDefined(tempFilesSharedChart)) {
            filesSharedChart = tempFilesSharedChart;
          }
          vm.filesSharedStatus = SET;
        }
        filesSharedCard = document.getElementById('files-shared-card');
      });
    }

    function setMediaData() {
      CustomerReportService.getMediaQualityData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.mediaQualityStatus = EMPTY;
        } else {
          var tempMediaChart = CustomerGraphService.setMediaQualityGraph(response, mediaChart, vm.mediaSelected);
          if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
            mediaChart = tempMediaChart;
          }
          vm.mediaQualityStatus = SET;
        }
        mediaCard = document.getElementById('media-quality-card');
      });
    }

    function setCallMetricsData() {
      CustomerReportService.getCallMetricsData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.dataProvider.length === 0) {
          vm.metricStatus = EMPTY;
        } else {
          var tempMetricsChart = CustomerGraphService.setMetricsGraph(response, metricsChart);
          if (tempMetricsChart !== null && angular.isDefined(tempMetricsChart)) {
            metricsChart = tempMetricsChart;
          }
          vm.metrics = response.displayData;
          vm.metricStatus = SET;
        }
        metricsCard = document.getElementById('call-metrics-customer');
      });
    }

    function setDeviceData() {
      vm.deviceFilter = [angular.copy(defaultDeviceFilter)];
      vm.selectedDevice = vm.deviceFilter[0];
      currentDeviceGraphs = [];
      CustomerReportService.getDeviceData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.filterArray.length === 0) {
          vm.deviceStatus = EMPTY;
        } else {
          vm.deviceFilter = response.filterArray;
          vm.selectedDevice = vm.deviceFilter[0];
          currentDeviceGraphs = response.graphData;

          var tempDevicesChart = CustomerGraphService.setDeviceGraph(currentDeviceGraphs, deviceChart, vm.selectedDevice);
          if (tempDevicesChart !== null && angular.isDefined(tempDevicesChart)) {
            deviceChart = tempDevicesChart;
          }
          vm.deviceStatus = SET;
        }
        deviceCard = document.getElementById('device-card');
      });
    }

    function deviceUpdate() {
      if (currentDeviceGraphs.length > 0) {
        var tempDevicesChart = CustomerGraphService.setDeviceGraph(currentDeviceGraphs, deviceChart, vm.selectedDevice);
        if (tempDevicesChart !== null && angular.isDefined(tempDevicesChart)) {
          deviceChart = tempDevicesChart;
        }
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
