(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('MediaReportsController', MediaReportsController);
  /* @ngInject */
  function MediaReportsController($q, $scope, $translate, $interval, MediaClusterServiceV2, UtilizationResourceGraphService, MediaReportsService, Notification, MediaReportsDummyGraphService, MediaSneekPeekResourceService, CallVolumeResourceGraphService, AvailabilityResourceGraphService) {
    var vm = this;
    var interval = null;
    var deferred = $q.defer();

    vm.ABORT = 'ABORT';
    vm.EMPTY = 'empty';
    vm.REFRESH = 'refresh';
    vm.SET = 'set';

    vm.utilizationStatus = vm.REFRESH;
    vm.callVolumeStatus = vm.REFRESH;
    vm.availabilityStatus = vm.REFRESH;

    vm.clusterFilter = null;
    vm.timeFilter = null;
    vm.clusterOptions = [vm.allClusters];
    vm.clusterSelected = vm.clusterOptions[0];
    vm.clusterId = vm.clusterOptions[0];
    vm.isEmpty = isEmpty;
    vm.isRefresh = isRefresh;

    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');
    vm.errorData = $translate.instant('mediaFusion.metrics.errordata');
    vm.noData = $translate.instant('mediaFusion.metrics.nodata');
    vm.percentage = $translate.instant('mediaFusion.metrics.percentage');

    vm.total_participants_heading = $translate.instant('mediaFusion.metrics.total_participants');
    vm.on_prem_participants_heading = $translate.instant('mediaFusion.metrics.onprem_participants');
    vm.cloud_participants_heading = $translate.instant('mediaFusion.metrics.cloud_participants');
    vm.cloud_calls_heading = $translate.instant('mediaFusion.metrics.cloud_calls');
    vm.redirected_calls_heading = $translate.instant('mediaFusion.metrics.redirectedcalls');
    vm.cluster_availability_heading = $translate.instant('mediaFusion.metrics.overAllAvailability');
    vm.customPlaceholder = $translate.instant('mediaFusion.report.custom');

    vm.hosted_heading = vm.on_prem_participants_heading;
    vm.redirected_heading = vm.cloud_calls_heading;

    vm.Map = {};
    vm.cloudparticipants = {
      isShow: '',
      value: ''
    };

    vm.displayAdoption = false;
    vm.displayResources = true;

    vm.changeTabs = changeTabs;
    vm.setRefreshInterval = setRefreshInterval;
    vm.clusterUpdate = clusterUpdate;
    vm.clusterUpdateFromTooltip = clusterUpdateFromTooltip;
    vm.timeUpdate = timeUpdate;

    vm.setClusterAvailability = setClusterAvailability;
    vm.setTotalCallsData = setTotalCallsData;
    vm.setSneekPeekData = setSneekPeekData;
    vm.setAvailabilityData = setAvailabilityData;
    vm.setCallVolumeData = setCallVolumeData;

    vm.showAvailabilityTooltip = false;
    vm.showHostedOnPremTooltip = false;

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.metrics.last4Hours')
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.metrics.today')
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.metrics.week')
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.metrics.month')
    }, {
      value: 4,
      label: $translate.instant('mediaFusion.metrics.threeMonths')
    }];
    vm.timeSelected = vm.timeOptions[0];

    setRefreshInterval();
    getCluster();
    timeUpdate();

    function loadResourceDatas() {
      deferred.promise.then(function () {
        setTotalCallsData();
        setAvailabilityData();
        setClusterAvailability();
        setUtilizationData();
        setCallVolumeData();
      });
    }

    function loadAdaptionDatas() {
      //Adoption changes here
      setRefreshInterval();
    }

    function clusterUpdate() {
      if (vm.clusterSelected !== vm.allClusters) {
        vm.clusterId = vm.Map[vm.clusterSelected];
        vm.hosted_heading = vm.on_prem_participants_heading;
        vm.redirected_heading = vm.redirected_calls_heading;
      } else {
        vm.clusterId = vm.allClusters;
        vm.hosted_heading = vm.on_prem_participants_heading;
        vm.redirected_heading = vm.cloud_calls_heading;
      }
      loadResourceDatas();
    }

    $scope.$on('clusterClickEvent', function (event, data) {
      if (vm.clusterSelected === vm.allClusters) {
        vm.clusterSelected = data.data;
        clusterUpdate();
      }
    });

    $scope.$on('zoomedTime', function (event, data) {
      vm.timeSelected = {
        startTime: data.data.startTime,
        endTime: data.data.endTime
      };
      vm.timeSelected.label = vm.customPlaceholder;
      timeUpdate();
    });

    $scope.$on('$destroy', function () {
      $interval.cancel(interval);
    });

    function timeUpdate() {
      setRefreshInterval();
      $interval.cancel(interval);
      if (vm.displayResources) {
        loadResourceDatas();
        interval = $interval(loadResourceDatas, vm.updateInterval);
      } else {
        loadAdaptionDatas();
        interval = $interval(loadAdaptionDatas, vm.updateInterval);
      }
    }

    function getCluster() {
      MediaClusterServiceV2.getAll()
        .then(function (clusters) {
          vm.clusterOptions.length = 0;
          vm.Map = {};
          vm.clusters = _.filter(clusters, { targetType: 'mf_mgmt' });
          _.each(clusters, function (cluster) {
            if (cluster.targetType === "mf_mgmt") {
              vm.clusterOptions.push(cluster.name);
              vm.Map[cluster.name] = cluster.id;
            }
          });
          vm.clusterOptions = _.sortBy(vm.clusterOptions, function (cluster) {
            return cluster.toLowerCase();
          });
          vm.clusterOptions.unshift(vm.allClusters);
          deferred.resolve(vm.Map);
          vm.clusterId = vm.clusterOptions[0];
          vm.clusterSelected = vm.clusterOptions[0];

        }).catch(function (err) {
          Notification.errorWithTrackingId(err, vm.errorData);
        });
      return deferred.promise;
    }

    function setTotalCallsData() {
      MediaReportsService.getTotalCallsData(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (vm.clusterId === vm.allClusters) {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.cloudCalls)) {
            vm.onprem = vm.noData;
            vm.cloud = response.data.callsOverflow;
            vm.cloudcalls = response.data.cloudCalls;
            vm.cloudparticipants.isShow = true;
            vm.cloudparticipants.value = vm.cloudcalls;
            vm.total = vm.cloudcalls;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.cloudCalls)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsOverflow)) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = response.data.callsOverflow;
            vm.cloudcalls = response.data.cloudCalls;
            vm.total = vm.onprem + vm.cloudcalls;
            vm.cloudparticipants.isShow = true;
            vm.cloudparticipants.value = vm.cloudcalls;
          }

        } else {
          if (response === vm.ABORT) {
            return;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloud = response.data.callsRedirect;
            vm.total = vm.cloud;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloud = vm.noData;
            vm.total = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloud = response.data.callsRedirect;
            vm.total = vm.onprem + vm.cloud;
          }
        }
      });
    }

    function setClusterAvailability() {
      MediaReportsService.getClusterAvailabilityData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return;
        } else if (_.isUndefined(response.data) || response.data.length === 0 || _.isUndefined(response.data.availabilityPercent)) {
          vm.clusterAvailability = vm.EMPTY;
          vm.clusterAvailability = vm.noData;
        } else {
          vm.clusterAvailability = response.data.availabilityPercent + vm.percentage;
          setSneekPeekData();
        }
      });
    }

    function setSneekPeekData() {
      MediaReportsService.getClusterAvailabilityTooltip(vm.timeSelected).then(function (response) {
        vm.availabilityTooltipOptions = MediaSneekPeekResourceService.getClusterAvailabilitySneekPeekValues(response, vm.Map, vm.clusterAvailability, vm.clusterId);
        vm.availabilityTooltipOptions['tooltipModel'] = vm.availabilityTooltipOptions.values[0];
        vm.availabilityTooltipOptions['tooltipClickHandler'] = clusterUpdateFromTooltip;
      }, function () {
        Notification.error('mediaFusion.genericError');
      });
    }

    function setUtilizationData() {
      MediaReportsService.getUtilizationData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0 || response.graphs.length === 0) {
          setDummyUtilization();
        } else {
          deferred.promise.then(function () {
            //set the utilization graphs here
            if (_.isUndefined(setUtilizationGraph(response))) {
              setDummyUtilization();
            } else {
              vm.utilizationStatus = vm.SET;
            }
          }, function () {
            //map is nor formed so we shoud show dummy graphs
            setDummyUtilization();
          });
        }
      }, function () {
        setDummyUtilization();
      });
    }

    function setAvailabilityData() {
      MediaReportsService.getAvailabilityData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (_.isUndefined(response.data) || !_.isArray(response.data) || response.data.length === 0 || _.isUndefined(response.data[0].clusterCategories) || response.data[0].clusterCategories.length === 0) {
          setdummyAvailability();
        } else {
          deferred.promise.then(
            function () {
              vm.availabilityStatus = vm.SET;
              setAvailabilityGraph(response);
            },
            function () {
              setdummyAvailability();
            });
        }
      }, function () {
        setdummyAvailability();
      });
    }

    function setCallVolumeData() {
      MediaReportsService.getCallVolumeData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (response.graphData.length === 0) {
          setDummyCallVolume();
        } else {
          setCallVolumeGraph(response);
          vm.callVolumeStatus = vm.SET;
        }
      }, function () {
        setDummyCallVolume();
      });
    }

    function setUtilizationGraph(response) {
      vm.utilizationChart = UtilizationResourceGraphService.setUtilizationGraph(response, vm.utilizationChart, vm.clusterSelected, vm.clusterId, vm.timeSelected, vm.Map);
      return vm.utilizationChart;
    }

    function setCallVolumeGraph(response) {
      vm.callVolumeChart = CallVolumeResourceGraphService.setCallVolumeGraph(response.graphData, vm.callVolumeChart, vm.clusterSelected, vm.timeSelected);
    }

    function setAvailabilityGraph(response) {
      vm.availabilityChart = AvailabilityResourceGraphService.setAvailabilityGraph(response, vm.availabilityChart, vm.clusterId, vm.clusterSelected, vm.timeSelected, vm.Map);
    }

    function setDummyUtilization() {
      vm.utilizationStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyUtilizationData(vm.timeSelected),
        graphs: MediaReportsDummyGraphService.dummyUtilizationGraph()
      };
      setUtilizationGraph(response);
    }

    function setDummyCallVolume() {
      vm.callVolumeStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeSelected)
      };
      setCallVolumeGraph(response);
    }

    function setdummyAvailability() {
      vm.availabilityStatus = vm.EMPTY;
      setAvailabilityGraph(MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeSelected));
    }

    function setRefreshInterval() {
      if (vm.timeSelected.value === 0) {
        vm.updateInterval = 60000;
      } else if (!_.isUndefined(vm.timeSelected.value)) {
        vm.updateInterval = 300000;
      } else {
        vm.updateInterval = 7200000;
      }
    }

    function changeTabs(isDisplayAdoption, isDisplayResources) {
      vm.displayAdoption = isDisplayAdoption;
      vm.displayResources = isDisplayResources;
      //We should load only data's which belongs to resources tab here
      if (vm.displayResources) {
        loadResourceDatas();
      } else {
        loadAdaptionDatas();
      }
    }

    function isEmpty(tab) {
      return tab === vm.EMPTY;
    }

    function isRefresh(tab) {
      return tab === vm.REFRESH;
    }

    function clusterUpdateFromTooltip() {
      vm.selectedClusterSneakPeek = vm.availabilityTooltipOptions['tooltipModel'];
      var selectedCluster = vm.selectedClusterSneakPeek;
      selectedCluster = selectedCluster.substring(0, selectedCluster.lastIndexOf('  '));
      vm.selectedClusterSneakPeek = vm.availabilityTooltipOptions.values[0];
      vm.clusterSelected = selectedCluster;
      clusterUpdate();
    }
  }
})();
