'use strict';

//Below is the Test Suit written for MeetingListController.
describe('Controller: ThresholdCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var ThresholdCtrl, ThresholdService, $state, scope, httpBackend, thresholdlistData;

  //var testgetMeetingChartInfo;

  /* Initialize the controller and a mock scope
   * Reading the json data to application variable.
   * Making a fake call to return json data to make unit test cases to be passed.
   */
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, _$state_, _ThresholdService_) {
    scope = $rootScope.$new();
    $state = _$state_;

    //MeetingListService  = _MeetingListService_;
    thresholdlistData = getJSONFixture('mediafusion/json/threshold/thresholdListData.json');

    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    httpBackend.when('GET', 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1/threshold/allThreshold')
      .respond(200, thresholdlistData);

    ThresholdCtrl = $controller('ThresholdCtrl', {
      $scope: scope

    });

    scope.queryThresholdList = thresholdlistData.threshold;
  }));

  //Test Specs

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
    expect(thresholdlistData.success).toBe(true);
  });

  it('queryThresholdList should be defined', function () {
    expect(scope.queryThresholdList).toBeDefined();
  });

  it('showThresholdDetails should be defined', function () {
    expect(scope.showThresholdDetails).toBeDefined();
  });

  it('Should have meeting data of size 5', function () {
    expect(scope.queryThresholdList.length).toBe(5);
  });

});
