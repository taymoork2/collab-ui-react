(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AALanguageService', AALanguageService);

  function AALanguageService($translate) {

    var voiceOptionDefault = createVoiceOption({
      "label": "autoAttendant.voices.vanessa",
      "voice": "Vanessa",
      "gender": "autoAttendant.voices.female"
    });

    var languageOptions = [];
    var languageOptionDefault = createLanguageOption({
      "code": "en_US",
      "label": "languages.englishAmerican"
    });

    //  languages []
    //    code: 4 character code for CES; optional '@' to differentiate duplicated codes for UI purposes
    //    label: display string for langauge, uses same langauge strings service setup when applicable
    //    voices[]
    //      label: display string for name
    //      voice: voice value for CES
    //      gender: display string for gender
    //

    var languages = [{
      "code": "en_US",
      "label": "languages.englishAmerican",
      "voices": [{
        "label": "autoAttendant.voices.allison",
        "voice": "Allison",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.susan",
        "voice": "Susan",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.vanessa",
        "voice": "Vanessa",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.veronica",
        "voice": "Veronica",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.dave",
        "voice": "Dave",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.steven",
        "voice": "Steven",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.victor",
        "voice": "Victor",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "en_GB",
      "label": "languages.englishBritish",
      "voices": [{
        "label": "autoAttendant.voices.elizabeth",
        "voice": "Elizabeth",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.kate",
        "voice": "Kate",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.simon",
        "voice": "Simon",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "en_AU",
      "label": "languages.englishAustralian",
      "voices": [{
        "label": "autoAttendant.voices.grace",
        "voice": "Grace",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.alan",
        "voice": "Alan",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "ca_ES",
      "label": "languages.catalan",
      "voices": [{
        "label": "autoAttendant.voices.montserrat",
        "voice": "Montserrat",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.jordi",
        "voice": "Jordi",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "da_DK",
      "label": "languages.danish",
      "voices": [{
        "label": "autoAttendant.voices.frida",
        "voice": "Frida",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.magnus",
        "voice": "Magnus",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "nl_NL",
      "label": "languages.dutch",
      "voices": [{
        "label": "autoAttendant.voices.saskia",
        "voice": "Saskia",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.willem",
        "voice": "Willem",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "fi_FI",
      "label": "languages.finnish",
      "voices": [{
        "label": "autoAttendant.voices.milla",
        "voice": "Milla",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.mikko",
        "voice": "Mikko",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "fr_FR",
      "label": "languages.french",
      "voices": [{
        "label": "autoAttendant.voices.florence",
        "voice": "Florence",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.juliette",
        "voice": "Juliette",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.bernard",
        "voice": "Bernard",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "fr_CA",
      "label": "languages.frenchCanadian",
      "voices": [{
        "label": "autoAttendant.voices.charlotte",
        "voice": "Charlotte",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.olivier",
        "voice": "Olivier",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "gl_ES",
      "label": "languages.galacian",
      "voices": [{
        "label": "autoAttendant.voices.carmela",
        "voice": "Carmela",
        "gender": "autoAttendant.voices.female"
      }]
    }, {
      "code": "de_DE",
      "label": "languages.german",
      "voices": [{
        "label": "autoAttendant.voices.katrin",
        "voice": "Katrin",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.stefan",
        "voice": "Stefan",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "el_GR",
      "label": "languages.greek",
      "voices": [{
        "label": "autoAttendant.voices.afroditi",
        "voice": "Afroditi",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.nikos",
        "voice": "Nikos",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "it_IT",
      "label": "languages.italian",
      "voices": [{
        "label": "autoAttendant.voices.giulia",
        "voice": "Giulia",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.paola",
        "voice": "Paola",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.silvana",
        "voice": "Silvana",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.valentina",
        "voice": "Valentina",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.luca",
        "voice": "Luca",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.marcello",
        "voice": "Marcello",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.matteo",
        "voice": "Matteo",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.roberto",
        "voice": "Roberto",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "zh_CN",
      "label": "languages.chineseMandarin",
      "voices": [{
        "label": "autoAttendant.voices.linlin",
        "voice": "Linlin",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.lisheng",
        "voice": "Lisheng",
        "gender": "autoAttendant.voices.female"
      }]
    }, {
      "code": "no_NO",
      "label": "languages.norwegian",
      "voices": [{
        "label": "autoAttendant.voices.vilde",
        "voice": "Vilde",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.henrik",
        "voice": "Henrik",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "pl_Pl",
      "label": "languages.polish",
      "voices": [{
        "label": "autoAttendant.voices.zosia",
        "voice": "Zosia",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.krzysztof",
        "voice": "Krzysztof",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "ru_RU",
      "label": "languages.russian",
      "voices": [{
        "label": "autoAttendant.voices.olga",
        "voice": "Olga",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.dmitri",
        "voice": "Dmitri",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "es_ES",
      "label": "languages.spanishSpain",
      "voices": [{
        "label": "autoAttendant.voices.carmen",
        "voice": "Carmen",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.leonor",
        "voice": "Leonor",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.jorge",
        "voice": "Jorge",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.juan",
        "voice": "Juan",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "es_CO@Argentine",
      "label": "languages.spanishArgentine",
      "voices": [{
        "label": "autoAttendant.voices.diego",
        "voice": "Diego",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "es_CO@Chilean",
      "label": "languages.spanishChilean",
      "voices": [{
        "label": "autoAttendant.voices.francisca",
        "voice": "Francisca",
        "gender": "autoAttendant.voices.female"
      }]
    }, {
      "code": "es_CO@Columbia",
      "label": "languages.spanishColumbian",
      "voices": [{
        "label": "autoAttendant.voices.soledad",
        "voice": "Soledad",
        "gender": "autoAttendant.voices.female"
      }]
    }, {
      "code": "es_MX",
      "label": "languages.spanishMexican",
      "voices": [{
        "label": "autoAttendant.voices.ximena",
        "voice": "Ximena",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.esperanza",
        "voice": "Esperanza",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.carlos",
        "voice": "Carlos",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "pt_PT",
      "label": "languages.portugese",
      "voices": [{
        "label": "autoAttendant.voices.amalia",
        "voice": "Amalia",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.eusebio",
        "voice": "Eusebio",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "pt_BR",
      "label": "languages.portugeseBrazillian",
      "voices": [{
        "label": "autoAttendant.voices.fernanda",
        "voice": "Fernanda",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.gabriela",
        "voice": "Gabriela",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.felipe",
        "voice": "Felipe",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "sv_SE",
      "label": "languages.swedish",
      "voices": [{
        "label": "autoAttendant.voices.annika",
        "voice": "Annika",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.sven",
        "voice": "Sven",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "es_ES@Valencia",
      "label": "languages.valencian",
      "voices": [{
        "label": "autoAttendant.voices.empar",
        "voice": "Empar",
        "gender": "autoAttendant.voices.female"
      }]
    }];

    var service = {
      getLanguageOptions: getLanguageOptions,
      getLanguageOption: getLanguageOption,
      getLanguageCode: getLanguageCode,
      getVoiceOptions: getVoiceOptions,
      getVoiceOption: getVoiceOption
    };

    return service;

    /////////////////////

    function setLanguageOptions() {
      languageOptions = [];
      if (angular.isDefined(languages)) {
        _.each(languages, function (language) {
          languageOptions.push(createLanguageOption(language));
        });
      }
    }

    function getLanguageOptions() {
      if (angular.isUndefined(languageOptions) || languageOptions.length === 0) {
        setLanguageOptions();
      }
      return languageOptions;
    }

    function getLanguageOption(voice) {
      if (!voice || voice.length === 0) {
        return languageOptionDefault;
      }

      var voiceLanguage = _.find(languages, function (language) {
        return _.findWhere(language.voices, {
          voice: voice
        });
      });

      return createLanguageOption(voiceLanguage);
    }

    function createLanguageOption(languageData) {
      var option = {
        "label": '',
        "value": ''
      };

      if (languageData) {
        option.label = $translate.instant(languageData.label);
        option.value = languageData.code;
      }

      return option;
    }

    function getLanguageCode(languageOption) {
      var code = "";
      if (!languageOption) {
        return code;
      }

      if (!languageOption.value) {
        code = languageOption;
      } else {
        code = languageOption.value;
      }

      var index = code.indexOf('@');
      if (index === -1) {
        return code;
      }

      return code.substr(0, index);
    }

    function getVoiceOptions(languageOption) {
      if (!languageOption || !languageOption.value || languageOption.value.length === 0) {
        languageOption = languageOptionDefault;
      }
      var language = _.findWhere(languages, {
        code: languageOption.value
      });

      var voiceOptions = [];
      if (language && language.voices && language.voices.length > 0) {
        _.forEach(language.voices, function (voiceData) {
          voiceOptions.push(createVoiceOption(voiceData));
        });
      }

      return voiceOptions;
    }

    function getVoiceOption(voice) {
      if (!voice || voice.length === 0) {
        return voiceOptionDefault;
      }

      var voiceData = {};
      var voiceLanguage = _.find(languages, function (language) {
        voiceData = _.findWhere(language.voices, {
          voice: voice
        });
        return voiceData;
      });

      return createVoiceOption(voiceData);
    }

    function createVoiceOption(voiceData) {
      var option = {
        "label": '',
        "value": ''
      };

      if (voiceData) {
        option.label = $translate.instant(voiceData.label) + ' (' + $translate.instant(voiceData.gender) + ')';
        option.value = voiceData.voice;
      }

      return option;
    }
  }
})();
