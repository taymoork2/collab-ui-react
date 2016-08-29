'use strict';

describe('Service: AALanguageService', function () {
  var enUs = loadEnUs();

  var AALanguageService;

  var en_USVoice = "Veronica";
  var en_US = "en_US";
  var fr_FRVoice = "Audrey";
  var fr_FR = "fr_FR";
  var pt_BRVoice = "Felipe";
  var pt_BR = "pt_BR";
  var es_ESValencia = "es_ES@Valencia";
  var es_ESValenciaCode = "es_ES";
  var defaultVoice = "Vanessa";
  var defaultLanguage = en_US;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_AALanguageService_) {
    AALanguageService = _AALanguageService_;
  }));

  describe('localizations', function () {
    it('should have localized all languages', function () {
      var count = 0;
      AALanguageService.getLanguageOptions().forEach(function (lang) {
        var translation = _.get(enUs, lang.label);
        if (!translation) throw new Error('Translation not found for ' + lang.label);
        count++;
      });
      expect(count).toBe(25);
    });
  });

  describe('getLanguageOptions', function () {

    it('should return all language options', function () {
      var languageOptions = AALanguageService.getLanguageOptions();
      expect(languageOptions).toBeDefined();
      expect(languageOptions.length).toEqual(25);

      var languageOptions2 = AALanguageService.getLanguageOptions();
      expect(languageOptions2).toBeDefined();
      expect(languageOptions).toEqual(languageOptions2);
    });

  });

  describe('getLanguageOption', function () {

    it('should return matching language option for a given voice value', function () {
      var languageOption = AALanguageService.getLanguageOption(en_USVoice);
      expect(languageOption).toBeDefined();
      expect(languageOption.value).toEqual(en_US);

      var languageOption2 = AALanguageService.getLanguageOption(fr_FRVoice);
      expect(languageOption2).toBeDefined();
      expect(languageOption2.value).toEqual(fr_FR);

      var languageOption3 = AALanguageService.getLanguageOption(pt_BRVoice);
      expect(languageOption3).toBeDefined();
      expect(languageOption3.value).toEqual(pt_BR);
    });

    it('should return empty language option for a unknown voice value', function () {
      var languageOption = AALanguageService.getLanguageOption("test");
      expect(languageOption).toBeDefined();
      expect(languageOption.value).toEqual("");
    });

    it('should return default language option for a undefined/empty voice value', function () {
      var languageOption = AALanguageService.getLanguageOption("");
      expect(languageOption).toBeDefined();
      expect(languageOption.value).toEqual(defaultLanguage);

      var languageOption2 = AALanguageService.getLanguageOption();
      expect(languageOption2).toBeDefined();
      expect(languageOption2.value).toEqual(defaultLanguage);
    });

  });

  describe('getLanguageCode', function () {

    it('should return proper language code for given language value', function () {
      var code = AALanguageService.getLanguageCode({
        "value": en_US
      });
      expect(code).toEqual(en_US);

      var code2 = AALanguageService.getLanguageCode(en_US);
      expect(code2).toEqual(en_US);
    });

    it('should return proper language code for given language value w/special char', function () {
      var code = AALanguageService.getLanguageCode({
        "value": es_ESValencia
      });
      expect(code).toEqual(es_ESValenciaCode);

      var code2 = AALanguageService.getLanguageCode(es_ESValencia);
      expect(code2).toEqual(es_ESValenciaCode);
    });

    it('should return empty language code for empty/undefined language value', function () {
      var code = AALanguageService.getLanguageCode("");
      expect(code).toEqual("");

      var code2 = AALanguageService.getLanguageCode();
      expect(code2).toEqual("");
    });

  });

  describe('getVoiceOptions', function () {

    it('should return proper voice options for given language option', function () {
      var voiceOptions = AALanguageService.getVoiceOptions({
        "value": en_US
      });
      expect(voiceOptions).toBeDefined();
      expect(voiceOptions.length).toEqual(8);

      var voiceOptions2 = AALanguageService.getVoiceOptions({
        "value": pt_BR
      });
      expect(voiceOptions2).toBeDefined();
      expect(voiceOptions2.length).toEqual(2);

      var voiceOptions3 = AALanguageService.getVoiceOptions({
        "value": fr_FR
      });
      expect(voiceOptions3).toBeDefined();
      expect(voiceOptions3.length).toEqual(3);
    });

    it('should return default voice options for empty/undefined language option', function () {
      var voiceOptions = AALanguageService.getVoiceOptions("");
      expect(voiceOptions).toBeDefined();
      expect(voiceOptions.length > 0).toEqual(true);

      var voiceOptions2 = AALanguageService.getVoiceOptions();
      expect(voiceOptions2).toBeDefined();
      expect(voiceOptions2.length > 0).toEqual(true);
    });

    it('should return empty array of voice options for unkown language option', function () {
      var voiceOptions = AALanguageService.getVoiceOptions({
        "value": "test"
      });
      expect(voiceOptions).toBeDefined();
      expect(voiceOptions.length).toEqual(0);
    });

  });

  describe('getVoiceOption', function () {

    it('should return proper voice option for given voice value', function () {
      var voiceOption = AALanguageService.getVoiceOption(en_USVoice);
      expect(voiceOption).toBeDefined();
      expect(voiceOption.value).toEqual(en_USVoice);

      var voiceOption2 = AALanguageService.getVoiceOption(fr_FRVoice);
      expect(voiceOption2).toBeDefined();
      expect(voiceOption2.value).toEqual(fr_FRVoice);

      var voiceOption3 = AALanguageService.getVoiceOption(pt_BRVoice);
      expect(voiceOption3).toBeDefined();
      expect(voiceOption3.value).toEqual(pt_BRVoice);
    });

    it('should empty voice option for unknown voice value', function () {
      var voiceOption = AALanguageService.getVoiceOption("test");
      expect(voiceOption).toBeDefined();
      expect(voiceOption.value).toEqual("");

      var voiceOption2 = AALanguageService.getVoiceOption("test@cisco");
      expect(voiceOption2).toBeDefined();
      expect(voiceOption2.value).toEqual("");
    });

    it('should default voice option for undefined voice value', function () {
      var voiceOption = AALanguageService.getVoiceOption("");
      expect(voiceOption).toBeDefined();
      expect(voiceOption.value).toEqual(defaultVoice);

      var voiceOption2 = AALanguageService.getVoiceOption();
      expect(voiceOption2).toBeDefined();
      expect(voiceOption2.value).toEqual(defaultVoice);
    });

  });

  function loadEnUs() {
    jasmine.getJSONFixtures().fixturesPath = 'base/app';
    var data = getJSONFixture('l10n/en_US.json');
    jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures';
    return data;
  }

});
