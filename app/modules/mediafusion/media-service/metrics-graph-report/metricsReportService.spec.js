'use strict';

describe('Service: Metrics Reports Service', function () {
  var $httpBackend, MetricsReportService, Config, Notification;
  var callVolumeUrl, UtilizationUrl, clusterAvailabilityUrl, totalCallsCard, availabilityCard, utilizationCard;

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeData.json');
  var callVolume = callVolumeData.callvolume;
  var callVolumeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  var responsedata = callVolumeGraphData.graphData;
  var UtilizationData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationData.json');
  var utilizationdata = UtilizationData.utilization;
  var utilizationGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationGraphData.json');
  var utilizationresponse = utilizationGraphData.graphData;
  var clusterAvailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  var clusterAvailability = clusterAvailabilityData.clusteravailability;
  var clusterAvailabilityGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');
  var clusteravailabilityresponse = clusterAvailabilityGraphData.graphData;
  var totalCallsCardData = getJSONFixture('mediafusion/json/metrics-graph-report/totalCallsCardData.json');
  var totalcallsdata = totalCallsCardData.totolcalls;
  var availabilityCardData = getJSONFixture('mediafusion/json/metrics-graph-report/availabilityCardData.json');
  var availabilitydata = availabilityCardData.availability;
  var utilizationCardData = getJSONFixture('mediafusion/json/metrics-graph-report/utilizationCardData.json');
  var utilizationcarddata = utilizationCardData.utilization;

  beforeEach(angular.mock.module('Mediafusion'));

  var cacheValue = (parseInt(moment.utc().format('H')) >= 8);
  var dayFormat = "MMM DD";
  var timezone = "Etc/GMT";
  var timeFilter = {
    value: 0
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };
  var error = {
    message: 'error'
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _MetricsReportService_, _Config_, _Notification_, UrlConfig) {
    $httpBackend = _$httpBackend_;
    MetricsReportService = _MetricsReportService_;
    Config = _Config_;
    Notification = _Notification_;

    spyOn(Notification, 'notify');

    var baseUrl = UrlConfig.getAthenaServiceUrl() + '/organizations/' + Authinfo.getOrgId();
    callVolumeUrl = baseUrl + '/call_volume/?relativeTime=1d';
    UtilizationUrl = baseUrl + '/cpu_utilization/?relativeTime=1d';
    clusterAvailabilityUrl = baseUrl + '/clusters_availability/?relativeTime=1d';
    totalCallsCard = baseUrl + '/total_calls/?relativeTime=1d';
    availabilityCard = baseUrl + '/agg_availability/?relativeTime=1d';
    utilizationCard = baseUrl + '/agg_cpu_utilization/?relativeTime=1d';

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(MetricsReportService).toBeDefined();
  });

  it('getCallVolumeData should exist', function () {
    expect(MetricsReportService.getCallVolumeData).toBeDefined();
  });

  it('should exist', function () {
    expect(MetricsReportService.getAvailabilityData).toBeDefined();
  });

  describe('Call Volume Graph Data', function () {
    it('should get call volume data', function () {
      $httpBackend.whenGET(callVolumeUrl).respond(callVolume);

      MetricsReportService.getCallVolumeData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual({
          graphData: responsedata
        });
      });

      $httpBackend.flush();
    });

    it('should notify an error for call volume data failure', function () {
      $httpBackend.whenGET(callVolumeUrl).respond(500, error);

      MetricsReportService.getCallVolumeData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual({
          graphData: []
        });
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Percentage of CPU utilization', function () {
    it('should get percentage utilization data', function () {
      $httpBackend.whenGET(UtilizationUrl).respond(utilizationdata);

      MetricsReportService.getUtilizationData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual({
          graphData: utilizationresponse
        });
      });

      $httpBackend.flush();
    });

    it('should notify an error for percentage utilization failure', function () {
      $httpBackend.whenGET(UtilizationUrl).respond(500, error);

      MetricsReportService.getUtilizationData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual({
          graphData: []
        });
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Cluster Availability Data', function () {
    it('should get cluster availability data', function () {
      $httpBackend.whenGET(clusterAvailabilityUrl).respond(clusterAvailability);

      MetricsReportService.getAvailabilityData(timeFilter, 'All Clusters').then(function (response) {
        expect(response.data).toEqual(clusteravailabilityresponse);
      });

      $httpBackend.flush();
    });

    it('should notify an error for cluster availability data failure', function () {
      $httpBackend.whenGET(clusterAvailabilityUrl).respond(500, error);

      MetricsReportService.getAvailabilityData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Total Number of calls', function () {
    it('should get total number of calls', function () {
      $httpBackend.whenGET(totalCallsCard).respond(totalcallsdata);

      MetricsReportService.getTotalCallsData(timeFilter, 'All Clusters').then(function (response) {
        expect(response.data).toEqual(totalcallsdata);
      });

      $httpBackend.flush();
    });

    it('should notify an error for total number of calls failure', function () {
      $httpBackend.whenGET(totalCallsCard).respond(500, error);

      MetricsReportService.getTotalCallsData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Cluster Availability Data on the Card', function () {
    it('should get cluster availability percentage', function () {
      $httpBackend.whenGET(availabilityCard).respond(availabilitydata);

      MetricsReportService.getClusterAvailabilityData(timeFilter, 'All Clusters').then(function (response) {
        expect(response.data).toEqual(availabilitydata);
      });

      $httpBackend.flush();
    });

    it('should notify an error for cluster availability percentage failure', function () {
      $httpBackend.whenGET(availabilityCard).respond(500, error);

      MetricsReportService.getClusterAvailabilityData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

  describe('Aggregated Utilization Data', function () {
    it('should get Average and Peak Utilization data', function () {
      $httpBackend.whenGET(utilizationCard).respond(utilizationcarddata);

      MetricsReportService.getCPUUtilizationData(timeFilter, 'All Clusters').then(function (response) {
        expect(response.data).toEqual(utilizationcarddata);
      });

      $httpBackend.flush();
    });

    it('should notify an error for Utilization data failure', function () {
      $httpBackend.whenGET(utilizationCard).respond(500, error);

      MetricsReportService.getCPUUtilizationData(timeFilter, 'All Clusters').then(function (response) {
        expect(response).toEqual([]);
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      $httpBackend.flush();
    });
  });

});
