'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global login,landing */

describe('Test localization options for pages', function () {

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  it('should login as squared test admin', function () {
    login.login('sqtest-admin');
  });

  // It's annoying to do it this way, but I couldn't figure out how to get it to work
  // on sauce labs serves without generating jasmine timeouts...
  it('Language', function () {
    landing.selectLanguageRange(0, 1);
  });
  it('Language', function () {
    landing.selectLanguageRange(1, 2);
  });
  it('Language', function () {
    landing.selectLanguageRange(2, 3);
  });
  it('Language', function () {
    landing.selectLanguageRange(3, 4);
  });
  it('Language', function () {
    landing.selectLanguageRange(4, 5);
  });
  it('Language', function () {
    landing.selectLanguageRange(5, 6);
  });
  it('Language', function () {
    landing.selectLanguageRange(6, 7);
  });
  it('Language', function () {
    landing.selectLanguageRange(7, 8);
  });
  it('Language', function () {
    landing.selectLanguageRange(8, 9);
  });
  it('Language', function () {
    landing.selectLanguageRange(9, 10);
  });
  it('Language', function () {
    landing.selectLanguageRange(10, 11);
  });
  it('Language', function () {
    landing.selectLanguageRange(11, 12);
  });
  it('Language', function () {
    landing.selectLanguageRange(12, 13);
  });
  it('Language', function () {
    landing.selectLanguageRange(13, 14);
  });
  it('Language', function () {
    landing.selectLanguageRange(14, 15);
  });
  it('Language', function () {
    landing.selectLanguageRange(15, 16);
  });
  it('Language', function () {
    landing.selectLanguageRange(16, 17);
  });
  it('Language', function () {
    landing.selectLanguageRange(17, 18);
  });
  it('Language', function () {
    landing.selectLanguageRange(18, 19);
  });
  it('Language', function () {
    landing.selectLanguageRange(19, 20);
  });
});
