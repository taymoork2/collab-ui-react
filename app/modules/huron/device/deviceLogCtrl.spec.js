'use strict';

describe('Controller: DeviceLogCtrl', function () {
  var controller, $scope, $q, $stateParams, $interval, $intervalSpy, Config, Notification, currentDevice, DeviceService, DeviceLogService;

  var stateParams = getJSONFixture('huron/json/device/devicesCtrlStateParams.json');

  var success = getJSONFixture('huron/json/device/logs/success.json');
  var success2 = getJSONFixture('huron/json/device/logs/success2.json');
  var successDup = getJSONFixture('huron/json/device/logs/successDup.json');
  var successNoEvents = getJSONFixture('huron/json/device/logs/success_No_Events.json');
  var failureCmsToEndpoint = getJSONFixture('huron/json/device/logs/failure_CMS_to_Endpoint.json');
  var failureEndpointCommand = getJSONFixture('huron/json/device/logs/failure_Endpoint_Command.json');
  var failurePostNoBody = getJSONFixture('huron/json/device/logs/failure_POST_No_Body.json');
  var failureZeroLogs = getJSONFixture('huron/json/device/logs/failure_Zero_Logs.json');
  var incomplete = getJSONFixture('huron/json/device/logs/incomplete.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _$interval_, _Config_, _Notification_, _DeviceService_, _DeviceLogService_) {
    $scope = _$rootScope_.$new();

    $q = _$q_;
    $stateParams = _$stateParams_;
    $interval = _$interval_;
    Config = _Config_;
    Notification = _Notification_;
    DeviceService = _DeviceService_;
    DeviceLogService = _DeviceLogService_;

    $stateParams.currentUser = stateParams.currentUser;
    $stateParams.device = stateParams.device;

    spyOn(DeviceLogService, 'getLogInformation').and.returnValue($q.when(success));
    spyOn(DeviceLogService, 'retrieveLog').and.returnValue($q.when());
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
    spyOn(Date, 'now').and.returnValue(1);

    spyOn($interval, 'cancel').and.callThrough();
    $intervalSpy = jasmine.createSpy('$interval', $interval);
    $intervalSpy.and.callThrough();

    controller = _$controller_('DeviceLogCtrl', {
      $scope: $scope,
      $interval: $intervalSpy
    });
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have defined message responses', function () {
    expect(success.length).toBeGreaterThan(0);
    expect(success2.length).toBeGreaterThan(0);
    expect(successDup.length).toBeGreaterThan(0);
    expect(successNoEvents.length).toBeGreaterThan(0);
    expect(incomplete.length).toBeGreaterThan(0);
    expect(failureCmsToEndpoint.length).toBeGreaterThan(0);
    expect(failureEndpointCommand.length).toBeGreaterThan(0);
    expect(failurePostNoBody).toBeDefined();
    expect(failureZeroLogs).toBeDefined();
  });

  it('should start the log retrieval process', function () {
    controller.retrieveLog();
    $scope.$apply();
    expect(controller.active).toEqual(true);
  });

  it('should error on starting the log retrieval', function () {
    DeviceLogService.retrieveLog.and.returnValue($q.reject(failurePostNoBody));
    controller.retrieveLog();
    $scope.$apply();

    expect(Notification.errorResponse).toHaveBeenCalled();
  });

  function callViewPreviousLog() {
    Date.now.and.returnValue(1);
    controller.viewPreviousLog();
    $scope.$apply();
    Date.now.and.returnValue(controller.eventTimeout + 1);
    $intervalSpy.flush(controller.interval * 2);
  }

  function isStateReset() {
    if (controller.active === false && controller.error === false && controller.loading === false) {
      return true;
    }
    return false;
  }

  it('should load logList', function () {
    callViewPreviousLog();

    expect(controller.logList.length).toBeGreaterThan(0);
    expect(controller.logList[0].name).toEqual(success[0].events[3].date);
    expect(controller.logList[0].uri).toEqual(success[0].results);
    expect(controller.logList[0].filename.length).toBeGreaterThan(0);

    DeviceLogService.getLogInformation.and.returnValue($q.when(success2));
    callViewPreviousLog();

    expect(controller.logList.length).toBeGreaterThan(1);
  });

  it('should load loglist successful, but with bad result field, the filename', function () {
    success[0].results = '';
    DeviceLogService.getLogInformation.and.returnValue($q.when(success));
    callViewPreviousLog();

    expect(controller.logList[0].filename.length).toBeGreaterThan(0);
  });

  it('should handle duplicate entries, loglist should not change', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(successDup));
    callViewPreviousLog();

    expect(controller.logList.length).toEqual(1);
  });

  it('should call refresh mulitple times, loglist should not change', function () {
    var currentLength = 0;
    callViewPreviousLog();
    currentLength = controller.logList.length;
    callViewPreviousLog();

    expect(controller.logList.length).toEqual(currentLength);
  });

  it('should start polling then times out', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(incomplete));
    callViewPreviousLog();

    expect(controller.isPolling()).toEqual(true);

    Date.now.and.returnValue(Date.now() + controller.timeout);
    $intervalSpy.flush(controller.interval);

    expect($intervalSpy.calls.count()).toEqual(1);
    expect($intervalSpy.cancel.calls.count()).toEqual(1);
  });

  it('should start polling then stops because log file successfully uploaded', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(incomplete));
    callViewPreviousLog();

    expect($intervalSpy.calls.count()).toEqual(1);
    expect($intervalSpy.cancel.calls.count()).toEqual(0);

    DeviceLogService.getLogInformation.and.returnValue($q.when(success));
    $intervalSpy.flush(controller.interval);

    expect($intervalSpy.cancel.calls.count()).toEqual(1);
  });

  it('should start polling then stops because user left the page', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when(incomplete));
    callViewPreviousLog();

    expect($intervalSpy.calls.count()).toEqual(1);
    expect($intervalSpy.cancel.calls.count()).toEqual(0);

    $scope.$broadcast('$destroy');
    expect($intervalSpy.cancel.calls.count()).toEqual(1);
  });

  it('should error on refreshing log list due to network error', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.reject(failureZeroLogs));
    callViewPreviousLog();

    expect(Notification.errorResponse).toHaveBeenCalled();
  });

  it('should error on refreshing log list, due to invalid log array', function () {
    DeviceLogService.getLogInformation.and.returnValue($q.when([]));
    callViewPreviousLog();

    expect(isStateReset()).toBe(true);
    expect(Notification.error).toHaveBeenCalled();

    DeviceLogService.getLogInformation.and.returnValue($q.when({}));
    callViewPreviousLog();

    expect(isStateReset()).toBe(true);
    expect(Notification.error).toHaveBeenCalled();
  });

});
