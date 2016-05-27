'use strict';

describe('Service: Mixpanel', function () {
  var Config, Mixpanel, Orgservice, $window;

  beforeEach(module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$window_, _Config_, _Mixpanel_, _Orgservice_) {
    $window = _$window_;
    Config = _Config_;
    Mixpanel = _Mixpanel_;
    Orgservice = _Orgservice_;
  }

  function initSpies() {
    spyOn(Config, 'isProd');
    $window.mixpanel = jasmine.createSpy('mixpanel');
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, oid) {
      callback({
        success: true
      }, 200);
    });
  }

  function setIsProd(isProd) {
    return function () {
      Config.isProd.and.returnValue(isProd);
    };
  }

  describe('mixpanel events', function () {
    beforeEach(setIsProd(false));

    it('should call trackEvent ', function () {
      Mixpanel.trackEvent('myState');
    });
  });

});
