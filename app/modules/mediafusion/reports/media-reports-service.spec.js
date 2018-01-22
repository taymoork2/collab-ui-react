'use strict';

describe('Service: Media Reports Service', function () {
  var vm = this;
  vm.callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  vm.callVolume = vm.callVolumeData.callvolume;
  vm.callVolumeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  vm.responsedata = vm.callVolumeGraphData.graphData;
  vm.UtilizationData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationData.json');
  vm.utilizationdata = vm.UtilizationData.utilizationresponse;
  vm.utilizationGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationGraphData.json');
  vm.utilizationresponse = vm.utilizationGraphData.graphData;
  vm.utilizationgraph = vm.utilizationGraphData.graphs;
  vm.clusterAvailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  vm.clusterAvailability = vm.clusterAvailabilityData.clusteravailability;
  vm.clusterAvailabilityGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');
  vm.clusteravailabilityresponse = vm.clusterAvailabilityGraphData.graphData;
  vm.totalCallsCardData = getJSONFixture('mediafusion/json/metrics-graph-report/totalCallsCardData.json');
  vm.totalcallsdata = vm.totalCallsCardData.totolcalls;
  vm.availabilityCardData = getJSONFixture('mediafusion/json/metrics-graph-report/availabilityCardData.json');
  vm.availabilitydata = vm.availabilityCardData.availability;
  vm.participantChangedata = {
    orgId: '11111111-2222-3333-a444-111111111bac',
    dataProvider: [{
      name: 'participant_change',
      value: 2,
    }],
  };

  vm.allClusters = 'mediaFusion.metrics.allclusters';
  vm.sampleClusters = 'mediaFusion.metrics.sampleclusters';

  beforeEach(angular.mock.module('Mediafusion'));

  vm.timeFilter = {
    value: 0,
  };

  vm.Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };
  vm.error = {
    message: 'error',
    data: {
      trackingId: 'id',
    },
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', vm.Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _MediaReportsService_, _Notification_, _UrlConfig_) {
    vm.$httpBackend = _$httpBackend_;
    vm.MediaReportsService = _MediaReportsService_;
    vm.Notification = _Notification_;
    vm.UrlConfig = _UrlConfig_;

    spyOn(vm.Notification, 'errorWithTrackingId');

    vm.baseUrl = vm.UrlConfig.getAthenaServiceUrl() + '/organizations/' + vm.Authinfo.getOrgId();
    vm.callVolumeUrl = vm.baseUrl + '/call_volume/?relativeTime=4h';
    vm.UtilizationUrl = vm.baseUrl + '/utilization/?relativeTime=4h';
    vm.clusterAvailabilityUrl = vm.baseUrl + '/clusters_availability/?relativeTime=4h';
    vm.totalCallsCard = vm.baseUrl + '/total_calls/?relativeTime=4h';
    vm.availabilityCard = vm.baseUrl + '/agg_availability/?relativeTime=4h';
    vm.participantDistributionUrl = vm.baseUrl + '/clusters_call_volume_with_insights/?relativeTime=4h';
    vm.participantDistributionMultipleInsightsUrl = vm.baseUrl + '/clusters_call_volume_with_multiple_insights/?relativeTime=4h';
    vm.clientTypeUrl = vm.baseUrl + '/client_type_trend/?relativeTime=4h';
    vm.meetingLcationUrl = vm.baseUrl + '/meeting_location_trend/?relativeTime=4h';
    vm.participant_change = vm.baseUrl + '/overflow_participant_change/?relativeTime=4h';
  }));

  afterEach(function () {
    vm.$httpBackend.verifyNoOutstandingExpectation();
    vm.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(vm.MediaReportsService).toBeDefined();
  });

  it('getCallVolumeData should exist', function () {
    expect(vm.MediaReportsService.getCallVolumeData).toBeDefined();
  });

  it('should exist', function () {
    expect(vm.MediaReportsService.getAvailabilityData).toBeDefined();
  });

  describe('Call Volume Graph Data', function () {
    it('should get call volume data', function () {
      vm.$httpBackend.whenGET(vm.callVolumeUrl).respond(vm.callVolume);

      vm.MediaReportsService.getCallVolumeData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: vm.responsedata,
        });
      });

      vm.$httpBackend.flush();
    });

    it('should notify an error for call volume data failure', function () {
      vm.$httpBackend.whenGET(vm.callVolumeUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getCallVolumeData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: [],
        });
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Percentage of CPU utilization', function () {
    it('should notify an error for percentage utilization failure', function () {
      vm.$httpBackend.whenGET(vm.UtilizationUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getUtilizationData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          graphs: [],
        });
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Participant Distribution:', function () {
    it('should notify an error for Participant Distribution Call failure', function () {
      vm.$httpBackend.whenGET(vm.participantDistributionUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getParticipantDistributionData(vm.timeFilter, vm.allClusters, false).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          graphs: [],
        });
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Participant Distribution:', function () {
    it('should notify an error for Participant Distribution with Multiple Insights Call failure', function () {
      vm.$httpBackend.whenGET(vm.participantDistributionMultipleInsightsUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getParticipantDistributionData(vm.timeFilter, vm.allClusters, true).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          graphs: [],
        });
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Client Type Data:', function () {
    it('should notify an error for Client Type Data call failure', function () {
      vm.$httpBackend.whenGET(vm.clientTypeUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getClientTypeData(vm.timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          graphs: [],
        });
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.verifyNoOutstandingRequest();
    });
  });

  describe('Meeting Location Data:', function () {
    it('should notify an error for Meeting Location Data call failure', function () {
      vm.$httpBackend.whenGET(vm.meetingLcationUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getMeetingLocationData(vm.timeFilter).then(function (response) {
        expect(response).toEqual({
          graphData: [],
          graphs: [],
        });
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Cluster Availability Data', function () {
    it('should get cluster availability data', function () {
      vm.$httpBackend.whenGET(vm.clusterAvailabilityUrl).respond(vm.clusterAvailability);

      vm.MediaReportsService.getAvailabilityData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response.data).toEqual(vm.clusteravailabilityresponse);
      });

      vm.$httpBackend.flush();
    });

    it('should notify an error for cluster availability data failure', function () {
      vm.$httpBackend.whenGET(vm.clusterAvailabilityUrl).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getAvailabilityData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Total Number of calls', function () {
    it('should get total number of calls', function () {
      vm.$httpBackend.whenGET(vm.totalCallsCard).respond(vm.totalcallsdata);

      vm.MediaReportsService.getTotalCallsData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response.data).toEqual(vm.totalcallsdata);
      });

      vm.$httpBackend.flush();
    });

    it('should notify an error for total number of calls failure', function () {
      vm.$httpBackend.when('GET', /^\w+.*/).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getTotalCallsData(vm.timeFilter, vm.sampleClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('Cluster Availability Data on the Card', function () {
    it('should get cluster availability percentage', function () {
      vm.$httpBackend.whenGET(vm.availabilityCard).respond(vm.availabilitydata);

      vm.MediaReportsService.getClusterAvailabilityData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response.data).toEqual(vm.availabilitydata);
      });

      vm.$httpBackend.flush();
    });

    it('should notify an error for cluster availability percentage failure', function () {
      vm.$httpBackend.whenGET(vm.availabilityCard).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getClusterAvailabilityData(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });

  describe('getOverflowIndicator on the Card', function () {
    it('should get cluster availability percentage', function () {
      vm.$httpBackend.whenGET(vm.participant_change).respond(vm.participantChangedata);

      vm.MediaReportsService.getOverflowIndicator(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response.data).toEqual(vm.participantChangedata);
      });

      vm.$httpBackend.flush();
    });

    it('should notify an error for cluster availability percentage failure', function () {
      vm.$httpBackend.whenGET(vm.participant_change).respond(500, vm.error);
      expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(0);

      vm.MediaReportsService.getOverflowIndicator(vm.timeFilter, vm.allClusters).then(function (response) {
        expect(response).toEqual([]);
        expect(vm.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      });

      vm.$httpBackend.flush();
    });
  });
});
