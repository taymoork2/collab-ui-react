'use strict';

//Below is the Test Suit written for MeetingListController.
describe('Controller: MetricsCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var MetricsCtrl, MetricsService, dateToBeUpdated, $state, scope, httpBackend, metriclistData;

  //var testgetMeetingChartInfo;

  /* Initialize the controller and a mock scope
   * Reading the json data to application variable.
   * Making a fake call to return json data to make unit test cases to be passed.
   */
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, _$state_, _MetricsService_) {
    scope = $rootScope.$new();
    $state = _$state_;

    //MeetingListService  = _MeetingListService_;
    metriclistData = getJSONFixture('mediafusion/json/metrics/metricsListData.json');

    httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    httpBackend.when('GET', 'http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1/threshold/metrics')
      .respond(200, metriclistData);

    MetricsCtrl = $controller('MetricsCtrl', {
      $scope: scope
    });

    scope.queryMetricsList = metriclistData.metrics;
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
    expect(metriclistData.success).toBe(true);
  });

  it('querymeetingslist should be defined', function () {
    expect(scope.queryMetricsList).toBeDefined();
  });

  /*it('querymeetingslist should be defined', function () {
    expect(scope.showMetricsDetails).toBeDefined();
  });*/

  it('Should have meeting data of size 5', function () {
    expect(scope.queryMetricsList.length).toBe(5);
  });

});
