'use strict';

describe('CsdmHubFactory', function () {
  beforeEach(angular.mock.module('Squared'));

  var hub;

  beforeEach(inject(function (CsdmHubFactory) {
    hub = CsdmHubFactory.create();
  }));

  it('should work', function () {
    var listener = sinon.stub();
    var listenerAddedListener = sinon.stub();
    var listenerRemovedListener = sinon.stub();
    var scope = {
      '$on': sinon.stub()
    };

    hub.onListener('added', listenerAddedListener);
    hub.onListener('removed', listenerRemovedListener);

    hub.on('foo', listener, {
      scope: scope
    });
    expect(scope.$on.callCount).toBe(1);
    expect(listenerAddedListener.callCount).toBe(1);
    expect(hub.count('foo')).toBe(1);

    hub.emit('foo', 'bar');
    expect(listener.callCount).toBe(1);
    expect(listener.args[0][0]).toBe('bar');

    scope.$on.args[0][1].call();
    expect(listenerRemovedListener.callCount).toBe(1);
    expect(hub.count('foo')).toBe(0);
  });

});
