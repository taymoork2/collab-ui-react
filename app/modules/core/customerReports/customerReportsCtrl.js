(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerReportsCtrl', CustomerReportsCtrl);

  /* @ngInject */
  function CustomerReportsCtrl($scope, $stateParams, $q, $timeout, $translate, Log, Authinfo, Config, CustomerReportService, DummyCustomerReportService, CustomerGraphService, WebexReportService, Userservice, WebExUtilsFact, Storage) {
    var vm = this;
    var ABORT = 'ABORT';
    var REFRESH = 'refresh';
    var SET = 'set';
    var EMPTY = 'empty';

    vm.pageTitle = 'reportsPage.pageTitle';
    vm.showWebexTab = false;

    var activeUsersSort = ['userName', 'numCalls', 'totalActivity'];
    var activeUsersChart = null;
    var activeUserCard = null;
    vm.activeUserDescription = "";
    vm.mostActiveTitle = "";
    vm.activeUserStatus = REFRESH;
    vm.displayMostActive = false;
    vm.mostActiveUsers = [];
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[2];
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

    var deviceChart = null;
    var deviceCard = null;
    vm.deviceStatus = REFRESH;
    vm.deviceDescription = '';

    var metricsChart = null;
    var metricsCard = null;
    vm.metricsDescription = '';
    vm.metricStatus = REFRESH;
    vm.metrics = {};

    vm.headerTabs = [{
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
    vm.mostActiveUserSwitch = mostActiveUserSwitch;

    vm.isRefresh = function (tab) {
      return tab === REFRESH;
    };

    vm.isEmpty = function (tab) {
      return tab === EMPTY;
    };

    vm.activePage = function (num) {
      return vm.activeUserCurrentPage === Math.floor((num + 1) / 5);
    };

    vm.changePage = function (num) {
      vm.activeUserCurrentPage = num;
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

    vm.pageForward = function () {
      if ((vm.activeUserCurrentPage === vm.activeButton[2]) && (vm.activeButton[2] !== vm.activeUsersTotalPages)) {
        vm.activeButton[0] += 1;
        vm.activeButton[1] += 1;
        vm.activeButton[2] += 1;
      }
      if (vm.activeUserCurrentPage !== vm.activeUsersTotalPages) {
        vm.changePage(vm.activeUserCurrentPage + 1);
      }
    };

    vm.pageBackward = function () {
      if ((vm.activeUserCurrentPage === vm.activeButton[0]) && (vm.activeButton[0] !== 1)) {
        vm.activeButton[0] -= 1;
        vm.activeButton[1] -= 1;
        vm.activeButton[2] -= 1;
      }
      if (vm.activeUserCurrentPage !== 1) {
        vm.changePage(vm.activeUserCurrentPage - 1);
      }
    };

    function init() {
      setFilterBasedText();
      $timeout(function () {
        setDummyData();

        setActiveUserData();
        setAvgRoomData();
        setFilesSharedData();
        setMediaData();
        setCallMetricsData();
      }, 30);
    }

    function resizeCards() {
      setTimeout(function () {
        $('.cs-card-layout').masonry('layout');
      }, 300);
    }

    function mostActiveUserSwitch() {
      vm.showMostActiveUsers = !vm.showMostActiveUsers;
      resetCards();
    }

    function resetCards() {
      var engagementElems = [activeUserCard, avgRoomsCard, filesSharedCard];
      var qualityElems = [];

      // $('.cs-card-layout').masonry('remove', engagementElems);
      // $('.cs-card-layout').masonry('remove', qualityElems);
      // resizeCards();

      // $('.cs-card-layout').append(engagementElems).masonry('appended', engagementElems);
      // $('.cs-card-layout').append(qualityElems).masonry('appended', qualityElems);
      resizeCards();
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
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(mediaData, mediaChart);
      if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
        mediaChart = tempMediaChart;
      }

      var metricsData = DummyCustomerReportService.dummyMetricsData(vm.timeSelected);
      var tempMetricsChart = CustomerGraphService.setMetricsGraph(metricsData, metricsChart);
      if (tempMetricsChart !== null && angular.isDefined(tempMetricsChart)) {
        metricsChart = tempMetricsChart;
      }
    }

    function timeUpdate() {
      vm.activeUserStatus = REFRESH;
      vm.avgRoomStatus = REFRESH;
      vm.filesSharedStatus = REFRESH;
      vm.mediaQualityStatus = REFRESH;
      vm.deviceStatus = REFRESH;
      vm.metricStatus = REFRESH;
      vm.metrics = {};

      setFilterBasedText();
      setDummyData();

      setActiveUserData();
      setAvgRoomData();
      setFilesSharedData();
      setMediaData();
      setCallMetricsData();
    }

    function setActiveUserData() {
      CustomerReportService.getActiveUserData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.activeUserGraph.length === 0) {
          vm.activeUserStatus = EMPTY;
        } else {
          // TODO: add data handling to update the active user graph and table with the data in response
          var tempActiveUserChart = CustomerGraphService.setActiveUsersGraph(response.activeUserGraph, activeUsersChart);
          if (tempActiveUserChart !== null && angular.isDefined(tempActiveUserChart)) {
            activeUsersChart = tempActiveUserChart;
          }

          vm.activeUserStatus = SET;
        }
        activeUserCard = document.getElementById('active-user-card');
      });
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
          var tempMediaChart = CustomerGraphService.setMediaQualityGraph(response, mediaChart);
          if (tempMediaChart !== null && angular.isDefined(tempMediaChart)) {
            mediaChart = tempMediaChart;
          }
          vm.mediaQualityStatus = SET;
        }
        filesSharedCard = document.getElementById('files-shared-card');
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
        filesSharedCard = document.getElementById('files-shared-card');
      });
    }

    function setDeviceData() {
      CustomerReportService.getDeviceData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.deviceStatus = EMPTY;
        } else {
          // var tempDeviceChart = CustomerGraphService.setMediaQualityGraph(response, deviceChart);
          // if (tempDeviceChart !== null && angular.isDefined(tempDeviceChart)) {
          //   deviceChart = tempDeviceChart;
          // }
          vm.deviceStatus = SET;
        }
        filesSharedCard = document.getElementById('files-shared-card');
      });
    }

    // TODO WEBEX side of the page has been copied from the existing reports page (needs converting from $scope to vm)
    vm.show = show;

    function show(showEngagement, showWebexReports) {
      vm.showEngagement = showEngagement;
      vm.showWebexReports = showWebexReports;
    }

    $scope.webexReportsObject = {};
    $scope.webexOptions = [];
    $scope.webexSelected = null;

    if ($stateParams.tab) {
      vm.showEngagement = false;
      vm.showWebexReports = $stateParams.tab === 'webex';
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
            WebExUtilsFact.isSiteSupportsIframe(url).then(
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
              Authinfo.setEmail(data.emails);
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
