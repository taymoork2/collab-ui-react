'use strict';

describe('Service: Inviteservice', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Inviteservice;
  beforeEach(inject(function (_Inviteservice_) {
    Inviteservice = _Inviteservice_;
  }));

  it('should do something', function () {
    expect(!!Inviteservice).toBe(true);
  });

});
