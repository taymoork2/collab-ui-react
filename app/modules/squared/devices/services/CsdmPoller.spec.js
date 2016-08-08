'use strict';

describe('CsdmPoller', function () {
  beforeEach(angular.mock.module('Squared'));

  var Poller, Hub, $q, $timeout, $rootScope;

  beforeEach(inject(function (_$q_, CsdmPoller, _$timeout_, _$rootScope_, CsdmHubFactory) {
    $q = _$q_;
    Hub = CsdmHubFactory;
    Poller = CsdmPoller;
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
  }));

  it('should poll and cancel polling if there are no subscribers', function () {
    var defer, serviceCallCount = 0;

    var scope = {
      $on: sinon.stub()
    };

    var service = function () {
      serviceCallCount++;
      defer = $q.defer();
      return defer.promise;
    };
    var hub = Hub.create();
    Poller.create(service, hub);

    var callback = sinon.stub();
    hub.on('data', callback, {
      scope: scope
    });

    // perform the initial callback
    expect(serviceCallCount).toBe(1);
    expect(callback.callCount).toBe(0, 'callback');
    defer.resolve();
    $rootScope.$digest();
    expect(callback.callCount).toBe(1, 'callback');

    // perform the next callback after 5 secs
    $timeout.flush(30500);
    expect(serviceCallCount).toBe(2);
    expect(callback.callCount).toBe(1, 'callback');
    defer.resolve();
    $rootScope.$digest();
    expect(callback.callCount).toBe(2, 'callback');

    // trigger next poll, but cancel the subscription midway
    $timeout.flush(30500);
    expect(serviceCallCount).toBe(3);
    expect(callback.callCount).toBe(2, 'callback');

    expect(scope.$on.callCount).toBe(1);
    expect(scope.$on.args[0][0]).toBe('$destroy');
    scope.$on.callArg(1);

    defer.resolve();
    $rootScope.$digest();
    expect(callback.callCount).toBe(2, 'callback');

    // should stopp polling since there are no active subscriptions
    $timeout.flush(30500);
    expect(serviceCallCount).toBe(3);
  });

});
