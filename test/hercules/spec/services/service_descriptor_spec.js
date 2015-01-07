'use strict';

describe('ServiceDescriptor', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ServiceDescriptor_) {
    Service = _ServiceDescriptor_;
  }));

  it('should fetch services', function () {
    Service.services(function(services) {
      expect(services.length).toEqual(3);
    });
  });

});
