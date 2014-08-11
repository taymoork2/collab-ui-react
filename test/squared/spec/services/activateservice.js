'use strict';

describe('Service: Activateservice', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Activateservice;
  beforeEach(inject(function (_Activateservice_) {
    Activateservice = _Activateservice_;
  }));

  it('should do something', function () {
    expect(!!Activateservice).toBe(true);
  });

});
