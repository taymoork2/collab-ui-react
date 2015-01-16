'use strict';

describe('Controller: ListMeetingsCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  var MeetingsCtrl,scope,httpBackend;
  var tempJson1;
  var tempJson=[{"status": "Active", "subject": "Test1","date": "abcd","startTime": "abcd","resource": "abcd","webexSite": "webex"}, 
      {"status": "Active", "subject": "Test1","date": "abcd","startTime": "abcd","resource": "abcd","webexSite": "webex"}, 
      {"status": "Active", "subject": "Test1","date": "abcd","startTime": "abcd","resource": "abcd","webexSite": "webex"}];
  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, $http) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    
    tempJson1 = $httpBackend.whenGET('/meetings')
    .respond(tempJson);
    
    console.log("Length is : "+ tempJson1.length);

    MeetingsCtrl = $controller('ListMeetingsCtrl', {
      $scope: scope,
      $http: $http
    });
  }));

  xit("should have 3 data records", function () {
            httpBackend.flush();
            expect(tempJson1).toBe(3);
        });

  it('scope should not be null', function () {
    expect(scope).not.toBeNull();
  });

  it('Call should be success', function () {
    expect(scope.data.success).toBe(true);
  });

  it('returned meetings list should not be null', function () {
    expect(scope.data.meetings).not.toBeNull();
  });

  it('meetings list should not be null', function () {
    expect(scope.querymeetingslist).not.toBeNull();
  });

});
