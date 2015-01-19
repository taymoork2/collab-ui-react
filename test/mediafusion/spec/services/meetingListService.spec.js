'use strict';

describe('Service: MeetingListService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MeetingListService,httpBackend,meetinglistData;

  // instantiate service
  beforeEach(inject(function ($httpBackend,_MeetingListService_) {
    meetinglistData = getJSONFixture('mediafusion/json/meetings/meetingListData.json');
    httpBackend = $httpBackend;
    httpBackend.when('GET', 'http://multimediafusion-cf-krishna.mb-lab.huron.uno/admin/api/v1/meeting/getallminmeeting')
               .respond(200, meetinglistData);
    
    MeetingListService = _MeetingListService_;

  }));


  //Test Specs
  it("MeetingListService should be defined", function(){
      expect(MeetingListService).toBeDefined();
  });

  it("MeetingListService.listMeetings should be defined", function(){
      expect(MeetingListService.listMeetings).toBeDefined();
  });

  it("Root Scope should not be null", function(){
      expect(MeetingListService.$rootScope).not.toBeNull();
  });

  it("Meeting URL from Config meetingUrl should not be null", function(){
      expect(MeetingListService.meetingUrl).not.toBeNull();
  });

  it("Final Meeting URL should not be null", function(){
      expect(MeetingListService.listUrl).not.toBeNull();
  });

  it("HTTP should not be null", function(){
      expect(MeetingListService.$http).not.toBeNull();
  });

  it("Should have meeting data of size 5", function(){
      expect(meetinglistData.meetings.length).toBe(5);
  });

});
