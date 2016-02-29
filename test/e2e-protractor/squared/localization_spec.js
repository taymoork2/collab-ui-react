'use strict';

describe('Test localization options for pages', function () {

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as squared test admin', function () {
    login.login('sqtest-admin');
  });

  var n = 0;

  // selectLaunguageRange is designed to iterate over a range of languages, but Jasmine times out if I do this
  // so instead, we have one it() block per language

  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(0, 1);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(1, 2);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(2, 3);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(3, 4);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(4, 5);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(5, 6);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(6, 7);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(7, 8);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(8, 9);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(9, 10);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(10, 11);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(11, 12);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(12, 13);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(13, 14);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(14, 15);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(15, 16);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(16, 17);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(17, 18);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(18, 19);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(19, 20);
  });
  it('Should have loaded Locale #' + (n++) + ' without browser errors/exceptions/etc', function () {
    landing.expectSelectLanguageRange(20, 21);
  });

});
