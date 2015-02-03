'use strict';

//Below is the Test Suit written for MeetingListService
describe('Service: MeetingListService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MeetingListService,httpBackend,meetinglistData,meetingLdrBrdData;

  /* Instantiate service.
  * Reading the json data to application variable.
  * Making a fake call to return json data to make unit test cases to be passed.
  */
  beforeEach(inject(function ($httpBackend,_MeetingListService_) {
    meetinglistData = getJSONFixture('mediafusion/json/meetings/meetingListData.json');
    meetingLdrBrdData = getJSONFixture('mediafusion/json/meetings/meetingLeaderBoardData.json');
    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    httpBackend.when('GET', 'http://multimediafusion-cf-krishna.mb-lab.huron.uno/admin/api/v1/meeting/getallminmeeting')
               .respond(200, meetinglistData);

    //Making a fake call to return json data to make unit test cases to be passed for leader board UI.
    httpBackend.when('GET', 'http://multimediafusion-disr.mb-lab.huron.uno/admin/api/v1/meeting/getEnterpriseAndCloudMeetings')
               .respond(200, meetingLdrBrdData);
    
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

  it("Meeting URL from Config baseUrl should not be null", function(){
      expect(MeetingListService.baseUrl).not.toBeNull();
  });

  it("Final MeetingList URL should not be null", function(){
      expect(MeetingListService.meetingListUrl).not.toBeNull();
  });

  it("HTTP should not be null", function(){
      expect(MeetingListService.$http).not.toBeNull();
  });

  it("Should have meeting data of size 5", function(){
      expect(meetinglistData.meetings.length).toBe(5);
  });

  it('Search String should be SearchKey', function () {
    expect(meetinglistData.searchString).toBe("SearchKey");
  });

  it('Search filter should not be null', function () {
    expect(MeetingListService.searchfilter).not.toBeNull();
  });

  it("MeetingListService.getMeetingsAndParticipants should be defined", function(){
      expect(MeetingListService.getMeetingsAndParticipants).toBeDefined();
  });

  it('Total EnterpriseMeetings should be 5000', function () {
    expect(meetingLdrBrdData.totalEnterpriseMeetings).toBe(5000);
  });

  it('Total EnterpriseParticipants should be 6000', function () {
    expect(meetingLdrBrdData.totalEnterpriseParticipants).toBe(6000);
  });

  it('Total CloudMeetings should be 7000', function () {
    expect(meetingLdrBrdData.totalCloudMeetings).toBe(7000);
  });

  it('Total CloudParticipants should be 8000', function () {
    expect(meetingLdrBrdData.totalCloudParticipants).toBe(8000);
  });

});
