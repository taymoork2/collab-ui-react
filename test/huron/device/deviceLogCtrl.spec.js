'use strict';

describe('Controller: DeviceLogCtrl', function () {
  var controller, $scope, $q, $stateParams, $interval, $intervalSpy, Config, HttpUtils, currentDevice, DeviceService, DeviceLogService;

  var stateParams = getJSONFixture('huron/json/device/devicesCtrlStateParams.json');

  var success = getJSONFixture('huron/json/device/logs/success.json');
  var successNoEvents = getJSONFixture('huron/json/device/logs/success_No_Events.json');
  var failureCmsToEndpoint = getJSONFixture('huron/json/device/logs/failure_CMS_to_Endpoint.json');
  var failureEndpointCommand = getJSONFixture('huron/json/device/logs/failure_Endpoint_Command.json');
  var failurePostNoBody = getJSONFixture('huron/json/device/logs/failure_POST_No_Body.json');
  var failureZeroLogs = getJSONFixture('huron/json/device/logs/failure_Zero_Logs.json');

  var customerId = 'cd1500f6-ebd8-4009-a79f-9f43fa9bd898';
  var userId = '6604225e-647f-4db3-a446-9417af9f7ba4';
  var sipEndpointId = '7a755f28-4fd5-4710-8477-301c5336a885';

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _$interval_, _Config_, _HttpUtils_, _DeviceService_, _DeviceLogService_) {
    $scope = _$rootScope_.$new();

    $q = _$q_;
    $stateParams = _$stateParams_;
    $interval = _$interval_;
    Config = _Config_;
    HttpUtils = _HttpUtils_;
    DeviceService = _DeviceService_;
    DeviceLogService = _DeviceLogService_;

    $stateParams.currentUser = stateParams.currentUser;

    spyOn(DeviceLogService, 'getLogInformation').and.returnValue($q.when(success));
    spyOn(DeviceLogService, 'retrieveLog').and.returnValue($q.when());
    spyOn(Date, 'now').and.returnValue(1);

    spyOn($interval, 'cancel').and.callThrough();
    $intervalSpy = jasmine.createSpy('$interval', $interval);
    $intervalSpy.and.callThrough();

    controller = _$controller_('DeviceLogCtrl', {
      $scope: $scope,
      $interval: $intervalSpy
    });
    controller.interval = 100;
    controller.timeout = 500;
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have defined message responses', function () {
    expect(success.length).toBeGreaterThan(0);
    expect(successNoEvents.length).toBeGreaterThan(0);
    expect(failureCmsToEndpoint.length).toBeGreaterThan(0);
    expect(failureEndpointCommand.length).toBeGreaterThan(0);
    expect(failurePostNoBody).toBeDefined();
    expect(failureZeroLogs).toBeDefined();
  });

  it('should load logList', function () {
    controller.refreshLogList(customerId, userId, sipEndpointId);

    $scope.$apply();
    expect(controller.logList.length).toBeGreaterThan(0);
    expect(controller.logList[0].name).toEqual(success[0].events[3].date);
    expect(controller.logList[0].uri).toEqual(success[0].events[3].uri);
  });

  it('should keep logList the same', function () {
    var currentLength = 0;

    controller.refreshLogList(customerId, userId, sipEndpointId);
    $scope.$apply();

    currentLength = controller.logList.length;
    controller.refreshLogList(customerId, userId, sipEndpointId);
    $scope.$apply();

    expect(controller.logList.length).toEqual(currentLength);
  });

  it('should start polling then times out', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(successNoEvents));
    controller.refreshLogList(customerId, userId, sipEndpointId);
    $scope.$apply();

    Date.now.and.returnValue(Date.now() + controller.timeout);

    $intervalSpy.flush(controller.timeout + 1);
    expect($intervalSpy.calls.count()).toEqual(1);
    expect($intervalSpy.cancel.calls.count()).toEqual(1);
  });

  it('should start polling then stops because log file successfully uploaded', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(successNoEvents));
    controller.refreshLogList(customerId, userId, sipEndpointId);
    $scope.$apply();

    $intervalSpy.flush(controller.interval);
    expect($intervalSpy.calls.count()).toEqual(1);
    expect($intervalSpy.cancel.calls.count()).toEqual(0);

    DeviceLogService.getLogInformation.and.returnValue($q.when(success));
    $scope.$apply();
    $intervalSpy.flush(controller.interval);
    expect($intervalSpy.cancel.calls.count()).toEqual(1);
  });

  it('should start polling then stops because user left the page', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(successNoEvents));
    controller.refreshLogList(customerId, userId, sipEndpointId);
    $scope.$apply();

    $intervalSpy.flush(controller.interval);
    expect($intervalSpy.calls.count()).toEqual(1);
    expect($intervalSpy.cancel.calls.count()).toEqual(0);

    $scope.$broadcast('$destroy');
    expect($intervalSpy.cancel.calls.count()).toEqual(1);
  });

});
