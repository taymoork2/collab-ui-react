'use strict';

//Below is the Test Suit written for MeetingListService
describe('Service: MetricsService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MetricsService, httpBackend, metriclistData;

  /* Instantiate service.
   * Reading the json data to application variable.
   * Making a fake call to return json data to make unit test cases to be passed.
   */
  beforeEach(inject(function ($httpBackend, _MetricsService_) {
    metriclistData = getJSONFixture('mediafusion/json/metrics/metricsListData.json');

    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    httpBackend.when('GET', 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1/threshold/metrics')
      .respond(200, metriclistData);

    MetricsService = _MetricsService_;

  }));

  //Test Specs
  it("MetricsService should be defined", function () {
    expect(MetricsService).toBeDefined();
  });

  it("MeetingListService.listMeetings should be defined", function () {
    expect(MetricsService.queryMetricsList).toBeDefined();
  });

  it("Root Scope should not be null", function () {
    expect(MetricsService.$rootScope).not.toBeNull();
  });

  it("Meeting URL from Config baseUrl should not be null", function () {
    expect(MetricsService.baseUrl).not.toBeNull();
  });

  it("Final MeetingList URL should not be null", function () {
    expect(MetricsService.metricsListUrl).not.toBeNull();
  });

  it("HTTP should not be null", function () {
    expect(MetricsService.$http).not.toBeNull();
  });

  it("Should have meeting data of size 5", function () {
    expect(metriclistData.metrics.length).toBe(5);
  });

});
