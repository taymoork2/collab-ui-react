'use strict';

describe('Service: CsdmPollerSpec', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Poller, CsdmService, $interval;

  beforeEach(function () {
    module(function ($provide) {
      CsdmService = {
        listCodesAndDevices: sinon.stub(),
        fillCodesAndDevicesCache: sinon.stub()
      };
      $provide.value('CsdmService', CsdmService);
    });
  });

  beforeEach(inject(function ($injector, _$interval_, _CsdmPoller_) {
    $interval = _$interval_;
    Poller = _CsdmPoller_;
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
  }));

  it('should start polling', function () {
    var callback = sinon.stub();
    Poller.startPolling(callback);

    expect(CsdmService.fillCodesAndDevicesCache.callCount).toBe(1);

    CsdmService.fillCodesAndDevicesCache.callArg(0);
    expect(callback.callCount).toBe(1);

    $interval.flush(10000);
    expect(CsdmService.fillCodesAndDevicesCache.callCount).toBe(2);

    CsdmService.fillCodesAndDevicesCache.callArg(0);
    expect(callback.callCount).toBe(2);
  });

  it('should stop polling', function () {
    var callback = sinon.stub();
    Poller.startPolling(callback);

    expect(CsdmService.fillCodesAndDevicesCache.callCount).toBe(1);

    Poller.stopPolling(callback);

    CsdmService.fillCodesAndDevicesCache.callArg(0);
    expect(callback.callCount).toBe(1);

    $interval.flush(10000);
    expect(CsdmService.fillCodesAndDevicesCache.callCount).toBe(1);
  });

});
