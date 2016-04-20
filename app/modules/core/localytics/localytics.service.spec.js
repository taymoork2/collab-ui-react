'use strict';

describe('Service: Localytics', function () {
  var Localytics, Config;

  beforeEach(module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_Localytics_, _Config_) {
    Localytics = _Localytics_;
    Config = _Config_;
  }

  function initSpies() {
    spyOn(Config, 'isProd');
    window.ll = jasmine.createSpy('ll');
  }

  function setIsProd(isProd) {
    return function () {
      Config.isProd.and.returnValue(isProd);
    };
  }

  describe('Non production environment', function () {
    beforeEach(setIsProd(false));

    it('should not set org id', function () {
      Localytics.setOrgId('12345');
      expect(window.ll).not.toHaveBeenCalled();
    });

    it('should not set user id', function () {
      Localytics.setUserId('12345');
      expect(window.ll).not.toHaveBeenCalled();
    });

    it('should not tag screen', function () {
      Localytics.tagScreen('myState');
      expect(window.ll).not.toHaveBeenCalled();
    });

    it('should not tag event', function () {
      Localytics.tagEvent('myEvent', 'stuff');
      expect(window.ll).not.toHaveBeenCalled();
    });
  });

  describe('Production environment', function () {
    beforeEach(setIsProd(true));

    it('should set org id', function () {
      Localytics.setOrgId('12345');
      expect(window.ll).toHaveBeenCalledWith('setCustomDimension', 1, '12345');
    });

    it('should set user id', function () {
      Localytics.setUserId('12345');
      expect(window.ll).toHaveBeenCalledWith('setCustomerId', '12345');
    });

    it('should tag screen', function () {
      Localytics.tagScreen('myState');
      expect(window.ll).toHaveBeenCalledWith('tagScreen', 'myState');
    });

    it('should tag event', function () {
      Localytics.tagEvent('myEvent', 'stuff');
      expect(window.ll).toHaveBeenCalledWith('tagEvent', 'myEvent', 'stuff');
    });
  });
});
