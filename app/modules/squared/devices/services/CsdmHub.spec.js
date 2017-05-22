'use strict';

describe('CsdmHubFactory', function () {
  beforeEach(angular.mock.module('Squared'));

  var hub;

  beforeEach(inject(function (CsdmHubFactory) {
    hub = CsdmHubFactory.create();
  }));

  it('should work', function () {
    var listener = jasmine.createSpy('listener');
    var listenerAddedListener = jasmine.createSpy('listenerAddedListener');
    var listenerRemovedListener = jasmine.createSpy('listenerRemovedListener');
    var scope = {
      '$on': jasmine.createSpy('$on'),
    };

    hub.onListener('added', listenerAddedListener);
    hub.onListener('removed', listenerRemovedListener);

    hub.on('foo', listener, {
      scope: scope,
    });
    expect(scope.$on.calls.count()).toBe(1);
    expect(listenerAddedListener.calls.count()).toBe(1);
    expect(hub.count('foo')).toBe(1);

    hub.emit('foo', 'bar');
    expect(listener.calls.count()).toBe(1);
    expect(listener.calls.argsFor(0)[0]).toBe('bar');

    scope.$on.calls.argsFor(0)[1].call();
    expect(listenerRemovedListener.calls.count()).toBe(1);
    expect(hub.count('foo')).toBe(0);
  });

});
