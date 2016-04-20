'use strict';

describe('MailValidatorService', function () {
  beforeEach(module('Hercules'));

  var Service;

  beforeEach(inject(function ($injector, MailValidatorService) {
    Service = MailValidatorService;
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
