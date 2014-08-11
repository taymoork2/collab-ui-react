'use strict';

describe('Service: Localize', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Localize;
  beforeEach(inject(function (_Localize_) {
    Localize = _Localize_;
  }));

  it('should do something', function () {
    expect(!!Localize).toBe(true);
  });

});
