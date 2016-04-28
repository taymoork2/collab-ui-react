'use strict';

describe('Window Location', function () {
  beforeEach(module('Core'));

  var WindowLocation, $window;

  beforeEach(module(function ($provide) {
    $provide.value('$window', $window = {
      location: {}
    });
  }));

  beforeEach(inject(function (_WindowLocation_) {
    WindowLocation = _WindowLocation_;
  }));

  it('should update window.location.href when set is called', function () {
    WindowLocation.set('foo');
    expect($window.location.href).toBe('foo');
  });

});
