'use strict';

describe('Languages', function () {

  beforeEach(function init() {
    this.$window = {
      navigator: {},
    };
    var $windowProvider = {
      $get: function () {
        return this.$window;
      }.bind(this),
    };
    angular.mock.module(function ($provide) {
      $provide.provider('$window', $windowProvider);
    });
    this.initModules('Core');
    this.injectProviders('languagesProvider');
    this.injectDependencies('languages');
  });

  describe('Provider', function () {
    describe('should get preferred language', function () {
      afterEach(function () {
        expect(this.languagesProvider.getPreferredLanguage()).toBe('ja_JP');
      });

      it('from a hyphentated languages property', function () {
        this.$window.navigator.languages = ['ja-JP'];
      });

      it('from a language code prefix', function () {
        this.$window.navigator.languages = ['ja'];
      });

      it('from a valid language in the languages collection', function () {
        this.$window.navigator.languages = ['not-real', 'not_real', 'ja_JP'];
      });

      it('from a language property', function () {
        this.$window.navigator.language = 'ja-JP';
      });

      it('from a browserLanguage property', function () {
        this.$window.navigator.browserLanguage = 'ja-JP';
      });

      it('from a systemLanguage property', function () {
        this.$window.navigator.systemLanguage = 'ja-JP';
      });

      it('from a userLanguage property', function () {
        this.$window.navigator.userLanguage = 'ja-JP';
      });
    });

    describe('should get preferred language default country', function () {
      it('for english', function () {
        this.$window.navigator.languages = ['en'];
        expect(this.languagesProvider.getPreferredLanguage()).toBe('en_US');
      });

      it('for spanish', function () {
        this.$window.navigator.languages = ['es'];
        expect(this.languagesProvider.getPreferredLanguage()).toBe('es_ES');
      });

      it('for french', function () {
        this.$window.navigator.languages = ['fr'];
        expect(this.languagesProvider.getPreferredLanguage()).toBe('fr_FR');
      });
    });

    it('should have a default english preferred language', function () {
      expect(this.languagesProvider.getPreferredLanguage()).toBe('en_US');
    });

    it('should have a default english fallback language', function () {
      expect(this.languagesProvider.getFallbackLanguage()).toBe('en_US');
    });
  });

  it('should contain an english language object', function () {
    expect(this.languages).toContain({
      value: 'en_US',
      label: 'languages.englishAmerican'
    });
  });
});
