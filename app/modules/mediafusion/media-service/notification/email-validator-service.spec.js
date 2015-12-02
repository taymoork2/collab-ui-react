'use strict';

describe('EmailValidatorService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service;

  beforeEach(inject(function ($injector, EmailValidatorService) {
    Service = EmailValidatorService;
  }));

  it('empty string is not ok', function () {
    var str = '';
    expect(Service.isValidEmailCsv(str)).toBe(false);
  });

  it('single email is ok', function () {
    var str = 'foo@bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(true);
  });

  it('multiple email is ok', function () {
    var str = 'foo@bar.com, yo@lo.no';
    expect(Service.isValidEmailCsv(str)).toBe(true);
  });

  it('single bad email is bad', function () {
    var str = 'foo.bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(false);
  });

  it('one of two bad emails is bad', function () {
    var str = 'foo@bar.com, foo.bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(false);
  });

});
