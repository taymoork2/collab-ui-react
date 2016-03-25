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
        "label": "autoAttendant.voices.ava",
        "voice": "Ava",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.samantha",
        "voice": "Samantha",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.tom",
        "voice": "Tom",
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
        "label": "autoAttendant.voices.serena",
        "voice": "Serena",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.kate",
        "voice": "Kate",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.daniel",
        "voice": "Daniel",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.oliver",
        "voice": "Oliver",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "en_AU",
      "label": "languages.englishAustralian",
      "voices": [{
        "label": "autoAttendant.voices.karen",
        "voice": "Karen",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.lee",
        "voice": "Lee",
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
        "label": "autoAttendant.voices.sara",
        "voice": "Sara",
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
        "label": "autoAttendant.voices.claire",
        "voice": "Claire",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.xander",
        "voice": "Xander",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "fi_FI",
      "label": "languages.finnish",
      "voices": [{
        "label": "autoAttendant.voices.satu",
        "voice": "Satu",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.onni",
        "voice": "Onni",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "fr_FR",
      "label": "languages.french",
      "voices": [{
        "label": "autoAttendant.voices.audrey",
        "voice": "Audrey",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.aurelie",
        "voice": "Aurelie",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.thomas",
        "voice": "Thomas",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "fr_CA",
      "label": "languages.frenchCanadian",
      "voices": [{
        "label": "autoAttendant.voices.amelie",
        "voice": "Amelie",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.chantal",
        "voice": "Chantal",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.nicolas",
        "voice": "Nicolas",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "gl_ES",
      "label": "languages.galician",
      "voices": [{
        "label": "autoAttendant.voices.carmela",
        "voice": "Carmela",
        "gender": "autoAttendant.voices.female"
      }]
    }, {
      "code": "de_DE",
      "label": "languages.german",
      "voices": [{
        "label": "autoAttendant.voices.anna",
        "voice": "Anna",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.petra",
        "voice": "Petra",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.markus",
        "voice": "Markus",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.yannick",
        "voice": "Yannick",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "el_GR",
      "label": "languages.greek",
      "voices": [{
        "label": "autoAttendant.voices.melina",
        "voice": "Melina",
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
        "label": "autoAttendant.voices.alice",
        "voice": "Alice",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.federica",
        "voice": "Federica",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.paola",
        "voice": "Paola",
        "gender": "autoAttendant.voices.male"
      }, {
        "label": "autoAttendant.voices.luca",
        "voice": "Luca",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "zh_CN",
      "label": "languages.chineseMandarin",
      "voices": [{
        "label": "autoAttendant.voices.tiantian",
        "voice": "Tian-tian",
        "gender": "autoAttendant.voices.female"
      }]
    }, {
      "code": "no_NO",
      "label": "languages.norwegian",
      "voices": [{
        "label": "autoAttendant.voices.nora",
        "voice": "Nora",
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
        "label": "autoAttendant.voices.ewa",
        "voice": "Ewa",
        "gender": "autoAttendant.voices.female"
      }, {
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
        "label": "autoAttendant.voices.katya",
        "voice": "Katya",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.milena",
        "voice": "Milena",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.yuri",
        "voice": "Yuri",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "es_ES",
      "label": "languages.spanishSpain",
      "voices": [{
        "label": "autoAttendant.voices.monica",
        "voice": "Monica",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.jorge",
        "voice": "Jorge",
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
      "code": "es_CO@Columbia",
      "label": "languages.spanishColumbian",
      "voices": [{
        "label": "autoAttendant.voices.soledad",
        "voice": "Soledad",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.carlos",
        "voice": "Carlos",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "es_MX",
      "label": "languages.spanishMexican",
      "voices": [{
        "label": "autoAttendant.voices.angelica",
        "voice": "Angelica",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.paulina",
        "voice": "Paulina",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.juan",
        "voice": "Juan",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "pt_PT",
      "label": "languages.portuguese",
      "voices": [{
        "label": "autoAttendant.voices.catarina",
        "voice": "Catarina",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.joana",
        "voice": "Joana",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.joaquim",
        "voice": "Joaquim",
        "gender": "autoAttendant.voices.male"
      }]
    }, {
      "code": "pt_BR",
      "label": "languages.portugueseBrazillian",
      "voices": [{
        "label": "autoAttendant.voices.luciana",
        "voice": "Luciana",
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
        "label": "autoAttendant.voices.alva",
        "voice": "Alva",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.klara",
        "voice": "Klara",
        "gender": "autoAttendant.voices.female"
      }, {
        "label": "autoAttendant.voices.oskar",
        "voice": "Oskar",
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
