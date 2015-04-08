'use strict';

//Below is the Test Suit written for MeetingListController.
describe('Controller: FaultRulesCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var FaultRulesCtrl, FaultRuleService, $state, scope;

  //var testgetMeetingChartInfo;

  /* Initialize the controller and a mock scope
   * Reading the json data to application variable.
   * Making a fake call to return json data to make unit test cases to be passed.
   */
  beforeEach(inject(function ($controller, $rootScope, _$state_, _FaultRuleService_) {
    scope = $rootScope.$new();
    $state = _$state_;

    //MeetingListService  = _MeetingListService_;
    //metriclistData = getJSONFixture('mediafusion/json/metrics/metricsListData.json');

    //httpBackend = $httpBackend;

    //Making a fake call to return json data to make unit test cases to be passed for Meetings table.
    // httpBackend.when('GET', 'http://http://threshold-krishna.mmf-cf.huron.uno/threshold/api/v1/threshold/metrics')
    //.respond(200, metriclistData);

    FaultRulesCtrl = $controller('FaultRulesCtrl', {
      $scope: scope

    });

    //scope.queryMetricsList = metriclistData.metrics;
  }));

  //Test Specs

  it('scope should not be null', function () {
    expect(scope).not.toBeNull();
  });

  it('scope should be defined', function () {
    expect(scope).toBeDefined();
  });

  it('saveThreshold should be defined', function () {
    expect(scope.saveThreshold).toBeDefined();
  });

  it('cancel should be defined', function () {
    expect(scope.cancel).toBeDefined();
  });

  it('getSystemsByType should be defined', function () {
    expect(scope.getSystemsByType).toBeDefined();
  });

  it('getMetricTypesBySystem should be defined', function () {
    expect(scope.getMetricTypesBySystem).toBeDefined();
  });

  it('getMetricCountersByMetricType should be defined', function () {
    expect(scope.getMetricCountersByMetricType).toBeDefined();
  });

});
