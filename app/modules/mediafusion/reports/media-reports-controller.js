(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('MediaReportsController', MediaReportsController);
  /* @ngInject */
  function MediaReportsController($q, $scope, $translate, $interval, MediaClusterServiceV2, UtilizationResourceGraphService, MeetingLocationAdoptionGraphService, ParticipantDistributionResourceGraphService, NumberOfParticipantGraphService, MediaReportsService, Notification, MediaReportsDummyGraphService, MediaSneekPeekResourceService, CallVolumeResourceGraphService, AvailabilityResourceGraphService, ClientTypeAdoptionGraphService) {

    var vm = this;
    var interval = null;
    var deferred = $q.defer();

    vm.ABORT = 'ABORT';
    vm.EMPTY = 'empty';
    vm.REFRESH = 'refresh';
    vm.SET = 'set';

    vm.utilizationStatus = vm.REFRESH;
    vm.callVolumeStatus = vm.REFRESH;
    vm.participantDistributionStatus = vm.REFRESH;
    vm.numberOfParticipantStatus = vm.REFRESH;
    vm.availabilityStatus = vm.REFRESH;
    vm.clientTypeStatus = vm.REFRESH;
    vm.meetingLocationStatus = vm.REFRESH;

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

    vm.total_meetings = $translate.instant('mediaFusion.metrics.totalMeetings');
    vm.meeting_premises = $translate.instant('mediaFusion.metrics.meetOnPrem');
    vm.client_types = $translate.instant('mediaFusion.metrics.clientTypes');
    vm.num_meet = $translate.instant('mediaFusion.metrics.noOfMeet');
    vm.total_calls_heading = $translate.instant('mediaFusion.metrics.total_calls');
    vm.on_prem_calls_heading = $translate.instant('mediaFusion.metrics.onpremcalls');
    vm.hosted_calls_heading = $translate.instant('mediaFusion.metrics.hostedcalls');
    vm.total_participants_heading = $translate.instant('mediaFusion.metrics.total_participants');
    vm.on_prem_participants_heading = $translate.instant('mediaFusion.metrics.onprem_participants');
    vm.cloud_participants_heading = $translate.instant('mediaFusion.metrics.cloud_participants');
    vm.overflow_heading = $translate.instant('mediaFusion.metrics.cloud_calls');
    vm.cloud_calls_heading = $translate.instant('mediaFusion.metrics.cloud_calls');
    vm.redirected_calls_heading = $translate.instant('mediaFusion.metrics.redirectedcalls');
    vm.cluster_availability_heading = $translate.instant('mediaFusion.metrics.overAllAvailability');
    vm.customPlaceholder = $translate.instant('mediaFusion.report.custom');
    vm.total_cloud_heading = $translate.instant('mediaFusion.metrics.totalCloud');

    vm.second_card_heading = vm.total_cloud_heading;
    vm.redirected_heading = vm.cloud_calls_heading;
    vm.second_card_value = 0;
    vm.hosted_participants_heading = vm.on_prem_participants_heading;
    vm.hosted_heading = vm.on_prem_calls_heading;

    vm.Map = {};
    vm.secondCardFooter = {
      isShow: '',
      value: '',
      footerDesc: vm.overflow_heading,
    };

    vm.displayAdoption = false;
    vm.displayResources = true;

    vm.changeTabs = changeTabs;
    vm.setRefreshInterval = setRefreshInterval;
    vm.clusterUpdate = clusterUpdate;
    vm.clusterUpdateFromTooltip = clusterUpdateFromTooltip;
    vm.timeUpdate = timeUpdate;
    vm.setRefreshTabs = setRefreshTabs;

    vm.setClusterAvailability = setClusterAvailability;
    vm.setTotalCallsData = setTotalCallsData;
    vm.setSneekPeekData = setSneekPeekData;
    vm.setAvailabilityData = setAvailabilityData;
    vm.setCallVolumeData = setCallVolumeData;

    vm.setClientTypeData = setClientTypeData;
    vm.setClientTypeCard = setClientTypeCard;
    vm.setMeetingLocationData = setMeetingLocationData;

    vm.showAvailabilityTooltip = false;
    vm.showHostedOnPremTooltip = false;

    vm.timeOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.metrics.last4Hours'),
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.metrics.today'),
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.metrics.week'),
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.metrics.month'),
    }, {
      value: 4,
      label: $translate.instant('mediaFusion.metrics.threeMonths'),
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
        setParticipantDistributionData();
        setNumberOfParticipantData();
        setCallVolumeData();
      });
    }

    function loadAdaptionDatas() {
      //Adoption changes here
      setClientTypeData();
      setClientTypeCard();
      setMeetingLocationData();
    }

    function clusterUpdate() {
      if (vm.clusterSelected !== vm.allClusters) {
        vm.clusterId = vm.Map[vm.clusterSelected];
        vm.second_card_heading = vm.redirected_calls_heading;
        vm.redirected_heading = vm.redirected_calls_heading;
      } else {
        vm.clusterId = vm.allClusters;
        vm.second_card_heading = vm.total_cloud_heading;
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
        endTime: data.data.endTime,
      };
      vm.timeSelected.label = vm.customPlaceholder;
      timeUpdate();
    });

    $scope.$on('$destroy', function () {
      $interval.cancel(interval);
    });

    function timeUpdate() {
      setRefreshInterval();
      setRefreshTabs();
    }

    function setRefreshTabs() {
      $interval.cancel(interval);
      if (vm.displayResources) {
        loadResourceDatas();
        interval = $interval(loadResourceDatas, vm.updateInterval);
      } else {
        loadAdaptionDatas();
        interval = $interval(loadAdaptionDatas, vm.updateInterval);
      }
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
      setRefreshTabs();
    }

    function isEmpty(tab) {
      return tab === vm.EMPTY;
    }

    function isRefresh(tab) {
      return tab === vm.REFRESH;
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
            return undefined;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloudOverflow = vm.noData;
            vm.total = vm.noData;
            vm.cloudcalls = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.cloudCalls)) {
            vm.onprem = vm.noData;
            vm.cloudOverflow = response.data.callsOverflow;
            vm.cloudcalls = response.data.cloudCalls;
            vm.secondCardFooter.isShow = true;
            vm.secondCardFooter.value = vm.cloudOverflow;
            vm.total = vm.cloudOverflow;
            vm.totalcloudcalls = vm.cloudcalls;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.cloudCalls)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloudOverflow = vm.noData;
            vm.cloudcalls = vm.noData;
            vm.total = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsOverflow)) {
            vm.onprem = vm.noData;
            vm.cloudOverflow = vm.noData;
            vm.total = vm.noData;
            vm.cloudcalls = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloudOverflow = response.data.callsOverflow;
            vm.cloudcalls = response.data.cloudCalls;
            vm.total = vm.onprem + vm.cloudOverflow;
            vm.totalcloudcalls = vm.onprem + vm.cloudcalls;
            vm.secondCardFooter.isShow = true;
            vm.secondCardFooter.value = vm.cloudOverflow;
          }
          vm.second_card_value = vm.cloudcalls;

        } else {
          if (response === vm.ABORT) {
            return undefined;
          } else if (_.isUndefined(response.data) || response.data.length === 0) {
            vm.onprem = vm.noData;
            vm.cloudOverflow = vm.noData;
            vm.total = vm.noData;
            vm.totalcloudcalls = vm.noData;
          } else if (_.isUndefined(response.data.callsOnPremise) && !_.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloudOverflow = response.data.callsRedirect;
            vm.total = vm.cloudOverflow;
            vm.totalcloudcalls = vm.cloudOverflow;
          } else if (!_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = response.data.callsOnPremise;
            vm.cloudOverflow = vm.noData;
            vm.total = vm.onprem;
            vm.totalcloudcalls = vm.onprem;
          } else if (_.isUndefined(response.data.callsOnPremise) && _.isUndefined(response.data.callsRedirect)) {
            vm.onprem = vm.noData;
            vm.cloudOverflow = vm.noData;
            vm.total = vm.noData;
            vm.totalcloudcalls = vm.noData;
          } else {
            vm.onprem = response.data.callsOnPremise;
            vm.cloudOverflow = response.data.callsRedirect;
            vm.total = vm.onprem + vm.cloudOverflow;
            vm.totalcloudcalls = vm.onprem + vm.cloudOverflow;
          }
          vm.second_card_value = vm.cloudOverflow;
        }
      });
    }

    function setClientTypeCard() {
      MediaReportsService.getClientTypeCardData(vm.timeSelected).then(function (response) {
        if (response === vm.ABORT) {
          return undefined;
        } else if (_.isUndefined(response.data) || response.data.length === 0) {
          vm.clientTypeCount = vm.noData;
        } else {
          vm.clientTypeCount = response.data.dataProvider.length;
        }
      });
    }

    function setClusterAvailability() {
      MediaReportsService.getClusterAvailabilityData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (response === vm.ABORT) {
          return undefined;
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

    function setParticipantDistributionData() {
      MediaReportsService.getParticipantDistributionData(vm.timeSelected, vm.clusterId).then(function (response) {
        if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0 || response.graphs.length === 0) {
          setDummyParticipantDistribution();
        } else {
          deferred.promise.then(function () {
            //set the participant distribution graphs here
            if (_.isUndefined(setParticipantDistributionGraph(response))) {
              setDummyParticipantDistribution();
            } else {
              vm.participantDistributionStatus = vm.SET;
            }
          }, function () {
            //map is nor formed so we shoud show dummy graphs
            setDummyParticipantDistribution();
          });
        }
      }, function () {
        setDummyParticipantDistribution();
      });
    }

    function setClientTypeData() {
      MediaReportsService.getClientTypeData(vm.timeSelected).then(function (response) {
        if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0 || response.graphs.length === 0) {
          setDummyClientType();
        } else {
          deferred.promise.then(function () {
            //set the client type graphs here
            if (_.isUndefined(setClientTypeGraph(response))) {
              setDummyClientType();
            } else {
              vm.clientTypeStatus = vm.SET;
            }
          }, function () {
            //map is nor formed so we shoud show dummy graphs
            setDummyClientType();
          });
        }
      }, function () {
        setDummyClientType();
      });
    }

    function setMeetingLocationData() {
      MediaReportsService.getMeetingLocationData(vm.timeSelected).then(function (response) {
        if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0 || response.graphs.length === 0) {
          setDummyMeetingLocation();
        } else {
          deferred.promise.then(function () {
            //set the client type graphs here
            if (_.isUndefined(setMeetingLocationGraph(response))) {
              setDummyMeetingLocation();
            } else {
              vm.meetingLocationStatus = vm.SET;
            }
          }, function () {
            //map is nor formed so we shoud show dummy graphs
            setDummyMeetingLocation();
          });
        }
      }, function () {
        setDummyMeetingLocation();
      });
    }

    function setNumberOfParticipantData() {
      MediaReportsService.getNumberOfParticipantData(vm.timeSelected).then(function (response) {
        if (_.isUndefined(response.graphData) || _.isUndefined(response.graphs) || response.graphData.length === 0 || response.graphs.length === 0) {
          setDummyNumberOfParticipant();
        } else {
          deferred.promise.then(function () {
              //set the number of participants graphs here
            if (_.isUndefined(setNumberOfParticipantGraph(response))) {
              setDummyNumberOfParticipant();
            } else {
              vm.numberOfParticipantStatus = vm.SET;
            }
          }, function () {
              //map is not formed so we shoud show dummy graphs
            setDummyNumberOfParticipant();
          });
        }
      }, function () {
        setDummyNumberOfParticipant();
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

    function setParticipantDistributionGraph(response) {
      vm.participantDistributionChart = ParticipantDistributionResourceGraphService.setParticipantDistributionGraph(response, vm.participantDistributionChart, vm.clusterSelected, vm.clusterId, vm.timeSelected, vm.Map);
      return vm.participantDistributionChart;
    }

    function setClientTypeGraph(response) {
      vm.clientTypeChart = ClientTypeAdoptionGraphService.setClientTypeGraph(response, vm.clientTypeChart, vm.timeSelected);
      return vm.clientTypeChart;
    }
    function setNumberOfParticipantGraph(response) {
      vm.numberOfParticipantChart = NumberOfParticipantGraphService.setNumberOfParticipantGraph(response, vm.numberOfParticipantChart, vm.timeSelected);
      return vm.numberOfParticipantChart;
    }

    function setMeetingLocationGraph(response) {
      vm.meetingLocationChart = MeetingLocationAdoptionGraphService.setMeetingLocationGraph(response, vm.meetingLocationChart, vm.timeSelected);
      return vm.meetingLocationChart;
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
        graphData: MediaReportsDummyGraphService.dummyLineChartData(vm.timeSelected),
        graphs: MediaReportsDummyGraphService.dummyUtilizationGraph(),
      };
      setUtilizationGraph(response);
    }

    function setDummyParticipantDistribution() {
      vm.participantDistributionStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyLineChartData(vm.timeSelected),
        graphs: MediaReportsDummyGraphService.dummyParticipantDistributionGraph(),
      };
      setParticipantDistributionGraph(response);
    }

    function setDummyClientType() {
      vm.clientTypeStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyLineChartData(vm.timeSelected),
        graphs: MediaReportsDummyGraphService.dummyClientTypeGraph(),
      };
      setClientTypeGraph(response);
    }

    function setDummyMeetingLocation() {
      vm.meetingLocationStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyLineChartData(vm.timeSelected),
        graphs: MediaReportsDummyGraphService.dummyMeetingLocationGraph(),
      };
      setMeetingLocationGraph(response);
    }

    function setDummyNumberOfParticipant() {
      vm.numberOfParticipantStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyLineChartData(vm.timeSelected),
        graphs: MediaReportsDummyGraphService.dummyNumberOfParticipantGraph(),
      };
      setNumberOfParticipantGraph(response);
    }

    function setDummyCallVolume() {
      vm.callVolumeStatus = vm.EMPTY;
      var response = {
        graphData: MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeSelected),
      };
      setCallVolumeGraph(response);
    }

    function setdummyAvailability() {
      vm.availabilityStatus = vm.EMPTY;
      setAvailabilityGraph(MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeSelected));
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
