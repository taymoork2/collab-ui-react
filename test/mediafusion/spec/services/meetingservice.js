'use strict';

describe('Service: MeetingListService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MeetingListService;

  // instantiate service
  beforeEach(inject(function (_MeetingListService_) {
    MeetingListService = _MeetingListService_;
  }));


  //Test Specs
  it("Meeting URL from Config should not be null", function(){
      expect(MeetingListService.$rootScope).not.toBeNull();
  });

  it("Meeting URL from Config should not be null", function(){
      expect(MeetingListService.meetingUrl).not.toBeNull();
  });

  it("Final Meeting URL should not be null", function(){
      expect(MeetingListService.listUrl).not.toBeNull();
  });

  it("HTTP should not be null", function(){
      expect(MeetingListService.$http).not.toBeNull();
  });

  it("Data Success state should be true", function(){
      expect(MeetingListService.data.success).toBe(true);
  });

});
