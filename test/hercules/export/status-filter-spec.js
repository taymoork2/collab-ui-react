'use strict';

describe('Service: StatusFilter', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var StatusFilter, Utils, Authinfo, Config;

  beforeEach(inject(function (_StatusFilter_, _Utils_, _Authinfo_, _Config_) {
    StatusFilter = _StatusFilter_;
    Utils = _Utils_;
    Authinfo = _Authinfo_;
    Config = _Config_;
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
