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
    vm.activeUserDescription = "";
    vm.mostActiveTitle = "";
    vm.activeUserStatus = REFRESH;
    vm.displayMostActive = true;
    vm.mostActiveUsers = [];
    vm.activeUserReverse = true;
    vm.activeUsersTotalPages = 0;
    vm.activeUserCurrentPage = 0;
    vm.activeUserPredicate = activeUsersSort[2];
    vm.activeButton = [1, 2, 3];

    var avgRoomsChart = null;
    vm.avgRoomsDescription = "";
    vm.avgRoomStatus = REFRESH;

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
      }, 30);
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
    }

    function timeUpdate() {
      vm.activeUserStatus = REFRESH;
      vm.avgRoomStatus = REFRESH;

      setFilterBasedText();
      setDummyData();

      setActiveUserData();
      setAvgRoomData();
    }

    function setActiveUserData() {
      CustomerReportService.getActiveUserData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.activeUserGraph.length === 0) {
          vm.activeUserStatus = EMPTY;
        } else {
          // TODO: add data handling to update the active user graph and table with the data in response
          vm.activeUserStatus = SET;
        }
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