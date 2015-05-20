'use strict';

//Below is the Test Suit written for MeetingListService
describe('Service: ThresholdService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var ThresholdService, httpBackend, thresholdlistData;

  /* Instantiate service.
   * Reading the json data to application variable.
   * Making a fake call to return json data to make unit test cases to be passed.
   */
  beforeEach(inject(function ($httpBackend, _ThresholdService_) {
    thresholdlistData = getJSONFixture('mediafusion/json/threshold/thresholdListData.json');

    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    httpBackend.when('GET', 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1/threshold/allThreshold')
      .respond(200, thresholdlistData);

    ThresholdService = _ThresholdService_;

  }));

  //Test Specs
  it("ThresholdService should be defined", function () {
    expect(ThresholdService).toBeDefined();
  });

  it("ThresholdService.queryThresholdList should be defined", function () {
    expect(ThresholdService.queryThresholdList).toBeDefined();
  });

  it("Root Scope should not be null", function () {
    expect(ThresholdService.$rootScope).not.toBeNull();
  });

  it("ThresholdService URL from Config baseUrl should not be null", function () {
    expect(ThresholdService.baseUrl).not.toBeNull();
  });

  it("Final threshold URL should not be null", function () {
    expect(ThresholdService.thresholdListUrl).not.toBeNull();
  });

  it("HTTP should not be null", function () {
    expect(ThresholdService.$http).not.toBeNull();
  });

  it("Should have meeting data of size 5", function () {
    expect(thresholdlistData.threshold.length).toBe(5);
  });

});
