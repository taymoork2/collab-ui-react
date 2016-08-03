'use strict';
describe('HelpdeskHttpRequestCancellerSpec', function () {
  beforeEach(angular.mock.module('Squared'));

  var HelpdeskHttpRequestCanceller;
  var $scope, $timeout;

  beforeEach(inject(function (_$timeout_, _HelpdeskHttpRequestCanceller_, _$rootScope_) {
    $scope = _$rootScope_.$new();
    $timeout = _$timeout_;
    HelpdeskHttpRequestCanceller = _HelpdeskHttpRequestCanceller_;
  }));

  it('timers cancelled adds a truthy cancelled attribute on the promise', function () {
    var promise = HelpdeskHttpRequestCanceller.newCancelableTimeout();
    var promise2 = HelpdeskHttpRequestCanceller.newCancelableTimeout();
    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);

    expect(promise.cancelled).toBeFalsy();
    expect(promise.timedout).toBeFalsy();

    expect(promise2.cancelled).toBeFalsy();
    expect(promise2.timedout).toBeFalsy();

    var handler = jasmine.createSpy('success');
    var handler2 = jasmine.createSpy('success');

    promise.then(handler);
    promise2.then(handler2);

    var cancelled = false;
    HelpdeskHttpRequestCanceller.cancelAll().then(function () {
      cancelled = true;
    });

    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);

    $scope.$apply(); // do the requests...

    expect(handler).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();

    $timeout.flush(); // forces timeout to resolve promise indicating cancelled is done
    expect(cancelled).toBeTruthy();

    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(0);

    // receiver can not test if the request was cancelled or if it timed out
    expect(promise.cancelled).toBeTruthy();
    expect(promise.timedout).toBeFalsy();

    expect(promise2.cancelled).toBeTruthy();
    expect(promise2.timedout).toBeFalsy();

  });

  it('timers time out adds a truthy timedout attribute on the promise', function () {
    var promise = HelpdeskHttpRequestCanceller.newCancelableTimeout();
    var promise2 = HelpdeskHttpRequestCanceller.newCancelableTimeout();
    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);

    expect(promise.cancelled).toBeFalsy();
    expect(promise2.cancelled).toBeFalsy();

    var handler = jasmine.createSpy('success');
    var handler2 = jasmine.createSpy('success');

    promise.then(handler);
    promise2.then(handler2);

    $timeout.flush(); // force timers to time out

    expect(handler).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();

    // "normal" request timeouts do not clear the list of registered requests.
    // Not a problem as long as a new search clears them anyway
    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);

    expect(promise.cancelled).toBeFalsy();
    expect(promise.timedout).toBeTruthy();

    expect(promise2.cancelled).toBeFalsy();
    expect(promise2.timedout).toBeTruthy();
  });

  it('no timeout or cancellation', function () {
    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(0);
    expect(HelpdeskHttpRequestCanceller.empty()).toBeTruthy();

    var promise = HelpdeskHttpRequestCanceller.newCancelableTimeout();
    var promise2 = HelpdeskHttpRequestCanceller.newCancelableTimeout();
    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);

    expect(promise.cancelled).toBeFalsy();
    expect(promise2.cancelled).toBeFalsy();

    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);
    expect(HelpdeskHttpRequestCanceller.empty()).toBeFalsy();

    $scope.$apply(); // do the requests...

    // "normal" request do not clear the list of registered requests.
    // Not a problem as long as a new search clears them anyway
    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(2);

  });

  //  it('cancelAll when no registered requests should resolved at once', function () {
  //
  //    expect(HelpdeskHttpRequestCanceller.nrOfRegisteredRequests()).toBe(0);
  //
  //    var handler = jasmine.createSpy('success');
  //
  //    var result = false;
  //    HelpdeskHttpRequestCanceller.cancelAll().then(function (res) {
  //      result = res;
  //    });
  //    $scope.$apply() ;
  //
  //    expect(result).toBe(0);
  //
  //  });

});
