'use strict';

describe('status service', function () {
  var $http, $log;
  var statusService;
  function dependencies(_$log_, _$http_, _statusService_) {
    $log = _$log_;
    $http = _$http_;
    statusService = _statusService_;
    spyOn($http, 'post').and.returnValue(
      true
    );
    spyOn($log, 'debug');
  }
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(statusService).toBeDefined();
  });

  it('getServices should be valid', function () {
    statusService.getServices().then(function (services) {
      expect(services.length).toEqual(4);
    });
  });
  it('setServiceId should be active', function () {
    statusService.setServiceId();
    expect($log.debug).toHaveBeenCalled();
  });
  it('addService should be valid', function () {
    var addResult = statusService.addService();
    expect(addResult).toBe(true);
  });
});
