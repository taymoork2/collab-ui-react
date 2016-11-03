(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerReportsCtrl', CustomerReportsCtrl);

  /* @ngInject */
  function CustomerReportsCtrl($rootScope, $stateParams, $q, $timeout, $translate, Log, Authinfo, CustomerReportService, ReportConstants, DummyCustomerReportService, CustomerGraphService, WebexReportService, Userservice, WebExApiGatewayService, Storage, FeatureToggleService, MediaServiceActivationV2, CardUtils) {
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

    var activeUsersChart = null;
    vm.displayActiveLineGraph = false;

    // Active User Options
    var activeArray = _.cloneDeep(ReportConstants.activeFilter);
    vm.activeOptions = {
      animate: true,
      description: 'activeUsers.customerPortalDescription',
      headerTitle: 'activeUsers.activeUsers',
      id: 'activeUsers',
      reportType: ReportConstants.BARCHART,
      state: ReportConstants.REFRESH,
      table: undefined,
      titlePopover: ReportConstants.UNDEF,
    };

    vm.secondaryActiveOptions = {
      alternateTranslations: false,
      broadcast: 'ReportCard::UpdateSecondaryReport',
      description: 'activeUsers.customerMostActiveDescription',
      display: true,
      emptyDescription: 'activeUsers.noActiveUsers',
      errorDescription: 'activeUsers.errorActiveUsers',
      search: true,
      state: ReportConstants.REFRESH,
      sortOptions: [{
        option: 'userName',
        direction: false,
      }, {
        option: 'numCalls',
        direction: false,
      }, {
        option: 'sparkMessages',
        direction: true,
      }, {
        option: 'totalActivity',
        direction: true,
      }],
      table: {
        headers: [{
          title: 'activeUsers.user',
          class: 'col-md-4 pointer',
        }, {
          title: 'activeUsers.calls',
          class: 'horizontal-center col-md-2 pointer',
        }, {
          title: 'activeUsers.sparkMessages',
          class: 'horizontal-center col-md-2 pointer',
        }],
        data: [],
        dummy: false,
      },
      title: 'activeUsers.mostActiveUsers',
    };

    vm.resizeMostActive = function () {
      CardUtils.resize(0);
    };

    var avgRoomsChart = null;
    vm.avgRoomOptions = {
      animate: true,
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
      animate: true,
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
    var mediaArray = _.cloneDeep(ReportConstants.mediaFilter);
    vm.mediaOptions = {
      animate: true,
      description: 'mediaQuality.descriptionCustomer',
      headerTitle: 'mediaQuality.mediaQuality',
      id: 'mediaQuality',
      reportType: ReportConstants.BARCHART,
      state: ReportConstants.REFRESH,
      table: undefined,
      titlePopover: 'mediaQuality.packetLossDefinition',
    };
    vm.mediaDropdown = {
      array: mediaArray,
      click: function () {
        setMediaGraph(mediaData);
      },
      disabled: true,
      selected: mediaArray[0]
    };

    var deviceChart = null;
    var currentDeviceGraphs = [];
    var defaultDeviceFilter = {
      value: 0,
      label: $translate.instant('registeredEndpoints.allDevices')
    };
    vm.deviceOptions = {
      animate: true,
      description: 'registeredEndpoints.customerDescription',
      headerTitle: 'registeredEndpoints.registeredEndpoints',
      id: 'devices',
      reportType: ReportConstants.BARCHART,
      state: ReportConstants.REFRESH,
      table: undefined,
      titlePopover: ReportConstants.UNDEF,
    };
    vm.deviceDropdown = {
      array: [_.cloneDeep(defaultDeviceFilter)],
      click: function () {
        if (currentDeviceGraphs[vm.deviceDropdown.selected.value].emptyGraph) {
          setDeviceGraph(DummyCustomerReportService.dummyDeviceData(vm.timeSelected));
          vm.deviceOptions.state = ReportConstants.EMPTY;
        } else {
          setDeviceGraph(currentDeviceGraphs, vm.deviceDropdown.selected);
          vm.deviceOptions.state = ReportConstants.SET;
        }
      },
      disabled: true,
      selected: _.cloneDeep(defaultDeviceFilter)
    };

    var metricsChart = null;
    vm.metricsOptions = {
      animate: false,
      description: 'callMetrics.customerDescription',
      headerTitle: 'callMetrics.callMetrics',
      id: 'callMetrics',
      reportType: ReportConstants.DONUT,
      state: ReportConstants.REFRESH,
      table: undefined,
      titlePopover: ReportConstants.UNDEF,
    };
    vm.metricsLabels = [{
      number: 0,
      text: 'callMetrics.totalCalls'
    }, {
      number: 0,
      text: 'callMetrics.callMinutes'
    }, {
      number: 0,
      text: 'callMetrics.failureRate'
    }];

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
    vm.getDescription = getDescription;
    vm.getHeader = getHeader;

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

    function init() {
      deviceUsageToggle.then(function (response) {
        if (response) {
          vm.headerTabs.push({
            title: $translate.instant('reportsPage.usageReports.usageReportTitle'),
            state: 'reports.device-usage.total'
          });
        }
      });

      reportsUpdateToggle.then(function (response) {
        vm.displayActiveLineGraph = response;
        if (vm.displayActiveLineGraph) {
          vm.timeOptions[2].label = $translate.instant('reportsPage.threePlusMonths');
          vm.secondaryActiveOptions.alternateTranslations = true;
          vm.activeDropdown = {
            array: activeArray,
            click: function () {
              CustomerGraphService.showHideActiveLineGraph(activeUsersChart, vm.activeDropdown.selected);
            },
            disabled: true,
            selected: activeArray[0]
          };
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
      vm.activeOptions.state = ReportConstants.REFRESH;
      vm.secondaryActiveOptions.state = ReportConstants.REFRESH;
      vm.avgRoomOptions.state = ReportConstants.REFRESH;
      vm.filesSharedOptions.state = ReportConstants.REFRESH;
      vm.mediaOptions.state = ReportConstants.REFRESH;
      vm.deviceOptions.state = ReportConstants.REFRESH;
      vm.metricsOptions.state = ReportConstants.REFRESH;
      setMetrics();
      vm.mediaDropdown.selected = mediaArray[0];
      if (vm.displayActiveLineGraph) {
        vm.activeDropdown.selected = vm.activeDropdown.array[0];
        vm.activeOptions.titlePopover = ReportConstants.UNDEF;
        if (vm.timeSelected.value === ReportConstants.FILTER_THREE.value) {
          vm.activeOptions.titlePopover = 'activeUsers.threeMonthsMessage';
        }
      }

      setDummyData();
      setAllGraphs();
    }

    function setAllGraphs() {
      setActiveUserData();
      setAvgRoomData();
      setFilesSharedData();
      setMediaData();
      setCallMetricsData();
      setDeviceData();
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
        CardUtils.resize(500);
        vm.currentFilter = filter;
      }
    }

    function getDescription(text) {
      return $translate.instant(text, {
        time: vm.timeSelected.description
      });
    }

    function getHeader(text) {
      return $translate.instant(text, {
        time: vm.timeSelected.label
      });
    }

    function setDummyData() {
      setActiveGraph(DummyCustomerReportService.dummyActiveUserData(vm.timeSelected, vm.displayActiveLineGraph));
      setAverageGraph(DummyCustomerReportService.dummyAvgRoomData(vm.timeSelected));
      setFilesGraph(DummyCustomerReportService.dummyFilesSharedData(vm.timeSelected));
      setMetricGraph(DummyCustomerReportService.dummyMetricsData());
      setDeviceGraph(DummyCustomerReportService.dummyDeviceData(vm.timeSelected));
      setMediaGraph(DummyCustomerReportService.dummyMediaData(vm.timeSelected));

      CardUtils.resize(0);
    }

    function setActiveGraph(data) {
      var tempActiveUserChart;
      if (vm.displayActiveLineGraph) {
        tempActiveUserChart = CustomerGraphService.setActiveLineGraph(data, activeUsersChart, vm.timeSelected);
      } else {
        tempActiveUserChart = CustomerGraphService.setActiveUsersGraph(data, activeUsersChart);
      }

      if (tempActiveUserChart) {
        activeUsersChart = tempActiveUserChart;
        if (vm.displayActiveLineGraph) {
          CustomerGraphService.showHideActiveLineGraph(activeUsersChart, vm.activeDropdown.selected);
        }
      }
    }

    function setActiveUserData() {
      // reset defaults
      vm.secondaryActiveOptions.table.data = [];
      $rootScope.$broadcast(vm.secondaryActiveOptions.broadcast);
      if (vm.displayActiveLineGraph) {
        vm.activeDropdown.disabled = true;
      }

      CustomerReportService.getActiveUserData(vm.timeSelected, vm.displayActiveLineGraph).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (_.isArray(response.graphData) && response.graphData.length === 0) {
          vm.activeOptions.state = ReportConstants.EMPTY;
        } else {
          setActiveGraph(response.graphData);
          vm.activeOptions.state = ReportConstants.SET;

          if (vm.displayActiveLineGraph) {
            vm.activeDropdown.disabled = !response.isActiveUsers;
          }
        }
        CardUtils.resize(0);
      });

      CustomerReportService.getMostActiveUserData(vm.timeSelected).then(function (response) {
        if (response.error) {
          vm.secondaryActiveOptions.state = ReportConstants.ERROR;
        } else if (response.tableData.length === 0) {
          vm.secondaryActiveOptions.state = ReportConstants.EMPTY;
        } else {
          vm.secondaryActiveOptions.state = ReportConstants.SET;
        }
        vm.secondaryActiveOptions.table.data = response.tableData;
        $rootScope.$broadcast(vm.secondaryActiveOptions.broadcast);
      });
    }

    function setAverageGraph(data) {
      var tempAvgRoomsChart = CustomerGraphService.setAvgRoomsGraph(data, avgRoomsChart);
      if (tempAvgRoomsChart) {
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
      if (tempFilesSharedChart) {
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
      var tempMediaChart = CustomerGraphService.setMediaQualityGraph(data, mediaChart, vm.mediaDropdown.selected);
      if (tempMediaChart) {
        mediaChart = tempMediaChart;
      }
    }

    function setMediaData() {
      vm.mediaDropdown.disabled = true;
      mediaData = [];
      CustomerReportService.getMediaQualityData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.length === 0) {
          vm.mediaOptions.state = ReportConstants.EMPTY;
        } else {
          mediaData = response;
          setMediaGraph(mediaData);
          vm.mediaOptions.state = ReportConstants.SET;
          vm.mediaDropdown.disabled = false;
        }
      });
    }

    function setMetricGraph(data) {
      var tempMetricsChart = CustomerGraphService.setMetricsGraph(data, metricsChart);
      if (tempMetricsChart) {
        metricsChart = tempMetricsChart;
      }
    }

    function setMetrics(data) {
      if (data) {
        vm.metricsLabels[0].number = data.totalCalls;
        vm.metricsLabels[1].number = data.totalAudioDuration;
        vm.metricsLabels[2].number = data.totalFailedCalls;
      } else {
        _.forEach(vm.metricsLabels, function (label) {
          label.number = 0;
        });
      }
    }

    function setCallMetricsData() {
      CustomerReportService.getCallMetricsData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (_.isArray(response.dataProvider) && response.dataProvider.length === 0) {
          vm.metricsOptions.state = ReportConstants.EMPTY;
        } else {
          setMetricGraph(response);
          setMetrics(response.displayData);
          vm.metricsOptions.state = ReportConstants.SET;
        }
      });
    }

    function setDeviceGraph(data, deviceFilter) {
      var tempDevicesChart = CustomerGraphService.setDeviceGraph(data, deviceChart, deviceFilter);
      if (tempDevicesChart) {
        deviceChart = tempDevicesChart;
      }
    }

    function setDeviceData() {
      vm.deviceDropdown.array = [_.cloneDeep(defaultDeviceFilter)];
      vm.deviceDropdown.selected = vm.deviceDropdown.array[0];
      currentDeviceGraphs = [];
      vm.deviceDropdown.disabled = true;

      CustomerReportService.getDeviceData(vm.timeSelected).then(function (response) {
        if (response === ABORT) {
          return;
        } else if (response.emptyGraph) {
          vm.deviceOptions.state = ReportConstants.EMPTY;
        } else {
          if (response.filterArray.length) {
            vm.deviceDropdown.array = response.filterArray.sort(function (a, b) {
              if (a.label) {
                return a.label.localeCompare(b.label);
              } else {
                return a > b;
              }
            });
          }
          vm.deviceDropdown.selected = vm.deviceDropdown.array[0];
          currentDeviceGraphs = response.graphData;

          if (currentDeviceGraphs.length && !currentDeviceGraphs[vm.deviceDropdown.selected.value].emptyGraph) {
            setDeviceGraph(currentDeviceGraphs, vm.deviceDropdown.selected);
            vm.deviceOptions.state = ReportConstants.SET;
            vm.deviceDropdown.disabled = false;
          } else {
            vm.deviceOptions.state = ReportConstants.EMPTY;
          }
        }
      });
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
