'use strict';

describe('Service: StatusFilter', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var StatusFilter;

  beforeEach(inject(function (_StatusFilter_) {
    StatusFilter = _StatusFilter_;
  }));

  it('In UI, service state entitled=false should override state value', function () {
    var userStatusSummery = {
      "entitled": false,
      "state": "whatever"
    };
    expect(StatusFilter.convertToUiState(userStatusSummery)).toEqual("notEntitled");
  });

  it('In UI, service state should normally reflect the state value', function () {
    var userStatusSummery = {
      "entitled": true,
      "state": "whatever"
    };
    expect(StatusFilter.convertToUiState(userStatusSummery)).toEqual("whatever");
  });

});
