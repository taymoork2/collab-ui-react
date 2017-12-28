(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('MediaReportsController', MediaReportsController);
  /* @ngInject */
  function MediaReportsController($q, $scope, $translate, $interval, $timeout, HybridServicesClusterService, UtilizationResourceGraphService, MeetingLocationAdoptionGraphService, ParticipantDistributionResourceGraphService, NumberOfParticipantGraphService, MediaReportsService, Notification, MediaReportsDummyGraphService, MediaSneekPeekResourceService, CallVolumeResourceGraphService, AvailabilityResourceGraphService, ClientTypeAdoptionGraphService, AdoptionCardService, hasHmsTwoDotFiveFeatureToggle, Orgservice) {
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
    vm.selectedPeriod = $translate.instant('mediaFusion.report.selectedPeriod');
    vm.total_cloud_heading = $translate.instant('mediaFusion.metrics.totalCloud');
    vm.participants = $translate.instant('mediaFusion.metrics.participants');
    vm.increaseBy = $translate.instant('mediaFusion.metrics.increaseBy');
    vm.decreasedBy = $translate.instant('mediaFusion.metrics.decreasedBy');

    vm.availabilityCardHeading = '';
    vm.clusterAvailabilityCardHeading = $translate.instant('mediaFusion.metrics.clusterAvailabilityCardHeading');
    vm.nodeAvailabilityCardHeading = $translate.instant('mediaFusion.metrics.nodeAvailabilityCardHeading');

    vm.second_card_heading = vm.cloud_calls_heading;
    vm.redirected_heading = vm.cloud_calls_heading;

    vm.hosted_participants_heading = vm.on_prem_participants_heading;
    vm.hosted_heading = vm.on_prem_calls_heading;
    vm.availabilityCardHeading = vm.clusterAvailabilityCardHeading;
    vm.clusterInServiceOrgDesc = $translate.instant('mediaFusion.metrics.graphDescription.clusterInServiceOrgDesc');
    vm.clusterInServiceClusterDesc = $translate.instant('mediaFusion.metrics.graphDescription.clusterInServiceClusterDesc');

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
    vm.setTotalCallsPie = setTotalCallsPie;
    vm.setSneekPeekData = setSneekPeekData;
    vm.setAvailabilityData = setAvailabilityData;
    vm.setCallVolumeData = setCallVolumeData;

    vm.setClientTypeData = setClientTypeData;
    vm.setClientTypeCard = setClientTypeCard;
    vm.setMeetingLocationData = setMeetingLocationData;
    vm.setMeetingLocationCard = setMeetingLocationCard;

    vm.cardFlipHandler = cardFlipHandler;

    vm.showAvailabilityTooltip = false;
    vm.showHostedOnPremTooltip = false;

    vm.clientTypeschartOptions = {
      isShow: true,
      cardChartDiv: 'clientTypeChartDiv',
      noData: false,
    };
    vm.meetsHostedchartOptions = {
      isShow: true,
      cardChartDiv: 'numberOfMeetsOnPremisesChartDiv',
      noData: false,
    };
    vm.totalParticipantschartOptions = {
      isShow: true,
      cardChartDiv: 'totalParticipantsChartDiv',
      noData: false,
    };

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
    vm.timeSelected = vm.timeOptions[1];

    vm.isFlipped = false;
    vm.clientTypeDesc = $translate.instant('mediaFusion.metrics.cardDescription.clientTypeDesc');
    vm.cloudParticipantsDesc = $translate.instant('mediaFusion.metrics.cardDescription.cloudParticipants');
    vm.meetsHostTypeDesc = $translate.instant('mediaFusion.metrics.cardDescription.meetsHostType');
    vm.tooltipText = '';
    vm.cardIndicatorDiff = 0;
    vm.clusterUnavailablityFlag = false;


    vm.clientTypeOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.metrics.all'),
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.metrics.onPremisesHeading'),
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.metrics.cloudHeading'),
    }];
    vm.clientTypeSelected = vm.clientTypeOptions[0].value;
    vm.clientTypeOptions['tooltipModel'] = vm.clientTypeOptions[0];

    vm.clientTypeUpdateFromCard = clientTypeUpdateFromCard;
    vm.clientTypeText = vm.clientTypeSelected.label;
    vm.clientTypeOptions['tooltipClickHandler'] = clientTypeUpdateFromCard;

    vm.hasHmsTwoDotFiveFeatureToggle = hasHmsTwoDotFiveFeatureToggle;
    setRefreshInterval();
    getCluster();
    timeUpdate();

    Orgservice.isTestOrg()
      .then(function (isTestOrg) {
        vm.isTestOrg = isTestOrg;
      });

    function loadResourceDatas() {
      deferred.promise.then(function () {
        setTotalCallsPie();
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
      setMeetingLocationCard();
    }

    function clusterUpdate() {
      if (vm.clusterSelected !== vm.allClusters) {
        vm.clusterId = vm.Map[vm.clusterSelected];
        vm.second_card_heading = vm.redirected_calls_heading;
        vm.redirected_heading = vm.redirected_calls_heading;
        vm.availabilityCardHeading = vm.nodeAvailabilityCardHeading;
      } else {
        vm.clusterId = vm.allClusters;
        vm.second_card_heading = vm.cloud_calls_heading;
        vm.redirected_heading = vm.cloud_calls_heading;
        vm.availabilityCardHeading = vm.clusterAvailabilityCardHeading;
      }
      vm.displayResources = false;
      loadResourceDatas();
      $timeout(function () {
        angular.element('#resourceReportsLi').triggerHandler('click');
      }, 0);
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
      HybridServicesClusterService.getAll()
        .then(function (clusters) {
          vm.clusterOptions.length = 0;
          vm.Map = {};
          vm.clusters = _.filter(clusters, {
            targetType: 'mf_mgmt',
          });
          _.each(vm.clusters, function (cluster) {
            vm.clusterOptions.push(cluster.name);
            vm.Map[cluster.name] = cluster.id;
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
        vm.second_card_value = 0;
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
          vm.second_card_value = (vm.cloudOverflow == vm.noData) ? vm.noData : abbreviateNumber(vm.cloudOverflow);
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
          vm.second_card_value = (vm.cloudOverflow == vm.noData) ? vm.noData : abbreviateNumber(vm.cloudOverflow);
        }
        vm.totalcloudShort = (vm.totalcloudcalls == vm.noData) ? vm.noData : abbreviateNumber(vm.totalcloudcalls);
        vm.totalcloudTooltip = checkForTooltip(vm.totalcloudShort) ? vm.totalcloudcalls : '';
        vm.secondCardShort = (vm.second_card_value == vm.noData) ? vm.noData : abbreviateNumber(vm.second_card_value);
        vm.secondCardTooltip = checkForTooltip(vm.secondCardShort) ? vm.second_card_value : '';
        vm.onpremShort = (vm.onprem == vm.noData) ? vm.noData : abbreviateNumber(vm.onprem);
        vm.onpremTooltip = checkForTooltip(vm.onpremShort) ? vm.onprem : '';
        vm.cloudOverflowTooltip = checkForTooltip(vm.second_card_value) ? vm.cloudOverflow : '';

        var overflow = (vm.cloudOverflow === vm.noData) ? 0 : vm.cloudOverflow;
        vm.overflowPercentage = (vm.totalcloudcalls > 0) ? (overflow / vm.totalcloudcalls) * 100 : 0;
        vm.overflowPercentage = _.round(vm.overflowPercentage, 2);
        setOverflowIndicator();
      }, function () {
        vm.onprem = vm.noData;
        vm.cloudOverflow = vm.noData;
        vm.total = vm.noData;
        vm.cloudcalls = vm.noData;
        vm.second_card_value = vm.noData;
      });
    }

    function setOverflowIndicator() {
      MediaReportsService.getOverflowIndicator(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (response == vm.ABORT) {
          return undefined;
        } else {
          vm.cardIndicatorDiff = response.data.dataProvider[0].value;
          if (vm.cardIndicatorDiff > 0) {
            vm.cardIndicator = vm.increaseBy + ' ' + vm.cardIndicatorDiff;
          } else {
            vm.cardIndicator = vm.decreasedBy + ' ' + Math.abs(vm.cardIndicatorDiff);
          }
        }
      });
    }

    function setTotalCallsPie() {
      MediaReportsService.getTotalCallsData(vm.timeSelected, vm.clusterSelected).then(function (response) {
        if (response === vm.ABORT) {
          return undefined;
        } else if (_.isUndefined(response.data)) {
          AdoptionCardService.setDummyTotalParticipantsPiechart(false);
          vm.totalParticipantschartOptions.noData = true;
        } else if (!_.isUndefined(response.data)) {
          var callsOverflow = 0;
          var isAllCluster = true;
          var callsOnPremise = _.isUndefined(response.data.callsOnPremise) ? 0 : response.data.callsOnPremise;
          if (vm.clusterId === vm.allClusters) {
            isAllCluster = true;
            callsOverflow = _.isUndefined(response.data.callsOverflow) ? 0 : response.data.callsOverflow;
          } else {
            isAllCluster = false;
            callsOverflow = _.isUndefined(response.data.callsRedirect) ? 0 : response.data.callsRedirect;
          }
          var cloudCalls = _.isUndefined(response.data.cloudCalls) ? 0 : response.data.cloudCalls;

          if (callsOnPremise === 0 && callsOverflow === 0 && cloudCalls === 0) {
            AdoptionCardService.setDummyTotalParticipantsPiechart(true);
            vm.totalParticipantschartOptions.noData = false;
          } else {
            AdoptionCardService.setTotalParticipantsPiechart(callsOnPremise, callsOverflow, cloudCalls, isAllCluster);
            vm.totalParticipantschartOptions.noData = false;
          }
        }
      }, function () {
        AdoptionCardService.setDummyTotalParticipantsPiechart(false);
        vm.totalParticipantschartOptions.noData = true;
      });
    }

    function setClientTypeCard() {
      MediaReportsService.getClientTypeCardData(vm.timeSelected, vm.clientTypeSelected).then(function (response) {
        if (response === vm.ABORT) {
          return undefined;
        } else if (_.isUndefined(response.data) || response.data.dataProvider.length === 0) {
          AdoptionCardService.setDummyClientTypePiechart();
          vm.clientTypeschartOptions.noData = true;
        } else {
          AdoptionCardService.setClientTypePiechart(response.data);
          vm.clientTypeschartOptions.noData = false;
        }
      }, function () {
        AdoptionCardService.setDummyClientTypePiechart();
        vm.clientTypeschartOptions.noData = true;
      });
    }

    function setMeetingLocationCard() {
      MediaReportsService.getMeetingLocationCardData(vm.timeSelected).then(function (response) {
        if (response === vm.ABORT) {
          return undefined;
        } else if (_.isUndefined(response.data) || response.data.dataProvider.length === 0) {
          AdoptionCardService.setDummyNumberOfMeetsOnPremisesPiechart();
          vm.meetsHostedchartOptions.noData = true;
          vm.tot_number_meetings = vm.EMPTY;
          vm.tot_number_meetings = vm.noData;
          vm.totMeetingsShort = vm.tot_number_meetings;
          vm.totMeetingsTooltip = '';
        } else {
          var total_meets = 0;
          AdoptionCardService.setNumberOfMeetsOnPremisesPiechart(response.data);
          vm.meetsHostedchartOptions.noData = false;
          _.each(response.data.dataProvider, function (val) {
            total_meets += val.value;
          });
          vm.tot_number_meetings = total_meets;
          vm.totMeetingsShort = abbreviateNumber(vm.tot_number_meetings);
          vm.totMeetingsTooltip = checkForTooltip(vm.totMeetingsShort) ? vm.tot_number_meetings : '';
        }
      }, function () {
        AdoptionCardService.setDummyNumberOfMeetsOnPremisesPiechart();
        vm.meetsHostedchartOptions.noData = true;
        vm.totMeetingsShort = vm.noData;
        vm.totMeetingsTooltip = '';
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
        vm.tooltipText = vm.availabilityTooltipOptions.values[0];
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
      MediaReportsService.getClientTypeData(vm.timeSelected, vm.clientTypeSelected).then(function (response) {
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
      clusterUnavailablityCheck();
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

    function cardFlipHandler() {
      if (vm.isFlipped) {
        vm.isFlipped = false;
      } else {
        vm.isFlipped = true;
      }
    }

    function abbreviateNumber(value) {
      if (value <= 1000) {
        return value.toString();
      }
      var numDigits = ('' + value).length;
      var suffixIndex = Math.floor(numDigits / 3);
      var normalisedValue = value / Math.pow(1000, suffixIndex);
      var precision = 3;
      if (normalisedValue < 1) {
        precision = 1;
      }
      var suffixes = ['', 'k', 'm', 'bn'];
      if (normalisedValue < 1) {
        return _.round(normalisedValue * 1000) + suffixes[suffixIndex - 1];
      } else {
        return normalisedValue.toPrecision(precision) + suffixes[suffixIndex];
      }
    }

    function checkForTooltip(value) {
      var tooltipFlag = false;
      value = '' + value;
      if ((value.indexOf('k') > -1) || (value.indexOf('m') > -1) || (value.indexOf('bn') > -1)) {
        tooltipFlag = true;
      }
      return tooltipFlag;
    }

    function clusterUnavailablityCheck() {
      vm.clusterUnavailablityFlag = false;
      _.each(vm.availabilityChart.dataProvider, function (cluster) {
        if (!vm.clusterUnavailablityFlag) {
          if (cluster.segments[cluster.segments.length - 1].availability === 'Unavailable') {
            vm.clusterUnavailablityFlag = true;
          } else {
            vm.clusterUnavailablityFlag = false;
          }
        }
      });
    }

    function clientTypeUpdateFromCard() {
      vm.clientTypeSelected = vm.clientTypeOptions['tooltipModel'].value;
      setClientTypeCard();
      setClientTypeData();
    }
  }
})();
