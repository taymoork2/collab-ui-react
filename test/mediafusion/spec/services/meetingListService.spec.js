'use strict';

//Below is the Test Suit written for MeetingListService
describe('Service: MeetingListService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MeetingListService,httpBackend,meetinglistData,meetinglistinfoData,participantlistData;

  /* Instantiate service.
  * Reading the json data to application variable.
  * Making a fake call to return json data to make unit test cases to be passed.
  */
  beforeEach(inject(function ($httpBackend,_MeetingListService_) {
    meetinglistData = getJSONFixture('mediafusion/json/meetings/meetingListData.json');
    meetinglistinfoData = getJSONFixture('mediafusion/json/meetings/meetingListinfoData.json');
    participantlistData = getJSONFixture('mediafusion/json/meetings/participantListData.json');
    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    httpBackend.when('GET', 'http://multimediafusion-cf-krishna.mb-lab.huron.uno/admin/api/v1/meeting/getallminmeeting')
               .respond(200, meetinglistData);

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table to show additional info.
    httpBackend.when('GET', 'http://multimediafusion-cf-krishna.mb-lab.huron.uno/admin/api/v1/meeting/getaddninfo?id='+meetinglistinfoData.meetings.id)
               .respond(200, meetinglistinfoData);

    //Making a fake call to return json data to make unit test cases to be passed for Participants table.
    httpBackend.when('GET', 'http://multimediafusion-cf-krishna.mb-lab.huron.uno/admin/api/v1/meeting/getaddinfo?id='+meetinglistinfoData.meetings.id)
               .respond(200, participantlistData);
    
    MeetingListService = _MeetingListService_;

  }));


  //Test Specs
  it("MeetingListService should be defined", function(){
      expect(MeetingListService).toBeDefined();
  });

  it("MeetingListService.listMeetings should be defined", function(){
      expect(MeetingListService.listMeetings).toBeDefined();
  });
   it("MeetingListService.listMeetingsinfo should be defined", function(){
      expect(MeetingListService.listMeetingsinfo).toBeDefined();
  });
it("MeetingListService.listParticipantsinfo should be defined", function(){
      expect(MeetingListService.listParticipantinfo).toBeDefined();
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
  
  it("Final Meetinginfo URL should not be null", function(){
      expect(MeetingListService.meetinginfolistUrl).not.toBeNull();
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

  it('Total EnterpriseMeetings should be 5000', function () {
    expect(meetinglistData.totalEnterpriseMeetings).toBe(5000);
  });

  it('Total EnterpriseParticipants should be 6000', function () {
    expect(meetinglistData.totalEnterpriseParticipants).toBe(6000);
  });

  it('Total CloudMeetings should be 7000', function () {
    expect(meetinglistData.totalCloudMeetings).toBe(7000);
  });

  it('Total CloudParticipants should be 8000', function () {
    expect(meetinglistData.totalCloudParticipants).toBe(8000);
  });

});
