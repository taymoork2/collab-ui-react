'use strict';

describe('Service: Pagination', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Pagination;
  beforeEach(inject(function(_Pagination_) {
    Pagination = _Pagination_;
  }));

  it('should do something', function () {
    expect(!!Pagination).toBe(true);
  });

});
