'use strict';

describe('Service: Authinfo', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Authinfo;
  beforeEach(inject(function (_Authinfo_) {
    Authinfo = _Authinfo_;
  }));

  it('should do something', function () {
    expect(!!Authinfo).toBe(true);
  });

});
