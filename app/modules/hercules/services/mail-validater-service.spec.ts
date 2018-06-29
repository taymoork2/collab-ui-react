describe('MailValidatorService', () => {

  beforeEach(angular.mock.module('Hercules'));

  let Service;

  beforeEach(inject(function (MailValidatorService) {
    Service = MailValidatorService;
  }));

  it('empty string is not ok', () => {
    const str = '';
    expect(Service.isValidEmailCsv(str)).toBe(false);
  });

  it('single email is ok', () => {
    const str = 'foo@bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(true);
  });

  it('multiple email is ok', () => {
    const str = 'foo@bar.com, yo@lo.no';
    expect(Service.isValidEmailCsv(str)).toBe(true);
  });

  it('email in upper case is okay', () => {
    const str = 'FOO@bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(true);
  });

  it('single bad email is bad', () => {
    const str = 'foo.bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(false);
  });

  it('one of two bad emails is bad', () => {
    const str = 'foo@bar.com, foo.bar.com';
    expect(Service.isValidEmailCsv(str)).toBe(false);
  });

});
