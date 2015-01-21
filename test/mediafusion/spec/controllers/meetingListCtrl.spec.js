'use strict';

//Below is the Test Suit written for MeetingListController.
describe('Controller: ListMeetingsCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MeetingsCtrl,scope,httpBackend,meetinglistData;

   /* Initialize the controller and a mock scope
  * Reading the json data to application variable.
  * Making a fake call to return json data to make unit test cases to be passed.
  */
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
    scope = $rootScope.$new();

    meetinglistData = getJSONFixture('mediafusion/json/meetings/meetingListData.json');
    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed.
    httpBackend.when('GET', 'http://multimediafusion-cf-krishna.mb-lab.huron.uno/admin/api/v1/meeting/getallminmeeting')
               .respond(200, meetinglistData);

    MeetingsCtrl = $controller('ListMeetingsCtrl', {
      $scope: scope
    });

    scope.querymeetingslist = meetinglistData.meetings;
  }));

  //Test Specs

  it('MeetingsCtrl controller should be defined', function () {
    expect(MeetingsCtrl).toBeDefined();
  });

  it('scope should not be null', function () {
    expect(scope).not.toBeNull();
  });

  it('scope should be defined', function () {
    expect(scope).toBeDefined();
  });

  it('grid oprions should be defined', function () {
    expect(scope.gridOptions).toBeDefined();
  });

  it('response status should be success', function () {
    expect(meetinglistData.success).toBe(true);
  });

  it('querymeetingslist should be defined', function () {
    expect(scope.querymeetingslist).toBeDefined();
  });

  it('Should have meeting data of size 5', function () {
    expect(scope.querymeetingslist.length).toBe(5);
  });

});
