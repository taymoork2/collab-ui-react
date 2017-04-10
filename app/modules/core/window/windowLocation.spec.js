'use strict';

describe('Window Location', function () {
  beforeEach(angular.mock.module(require('./index').default));

  var WindowLocation, $window;

  afterEach(function () {
    WindowLocation = $window = undefined;
  });

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('$window', $window = {
      location: {},
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
