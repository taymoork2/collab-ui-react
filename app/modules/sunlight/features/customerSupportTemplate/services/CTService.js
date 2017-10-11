(function () {
  'use strict';

  angular
    .module('Sunlight')
    .service('CTService', CTService);

  /* @ngInject */
  function CTService($http, $modal, $translate, Authinfo, BrandService, TimezoneService, UrlConfig) {
    var service = {
      getDays: getDays,
      getLogo: getLogo,
      getLogoUrl: getLogoUrl,
      getPreviewDays: getPreviewDays,
      getTimeOptions: getTimeOptions,
      getEndTimeOptions: getEndTimeOptions,
      getDefaultTimes: getDefaultTimes,
      getTimeZone: getTimeZone,
      getTimezoneOptions: getTimezoneOptions,
      getDefaultTimeZone: getDefaultTimeZone,
      generateCodeSnippet: generateCodeSnippet,
      openEmbedCodeModal: openEmbedCodeModal,
      getLengthValidationConstants: getLengthValidationConstants,
      getValidationMessages: getValidationMessages,
      getStatesBasedOnType: getStatesBasedOnType,
      getOverviewPageCards: getOverviewPageCards,
      getPromptTimeOptions: getPromptTimeOptions,
      getPromptTime: getPromptTime,
    };
    return service;

    function getPromptTimeOptions() {
      return [
        { label: $translate.instant('careChatTpl.promptTimeOption1'), value: 30 },
        { label: $translate.instant('careChatTpl.promptTimeOption2'), value: 60 },
        { label: $translate.instant('careChatTpl.promptTimeOption3'), value: 180 },
        { label: $translate.instant('careChatTpl.promptTimeOption4'), value: 300 },
      ];
    }

    function getPromptTime(time) {
      var timeOptions = getPromptTimeOptions();
      return _.find(timeOptions, {
        value: time || timeOptions[0].value,
      });
    }

    function getLengthValidationConstants() {
      return {
        singleLineMaxCharLimit25: 25,
        singleLineMaxCharLimit50: 50,
        multiLineMaxCharLimit: 250,
        multiLineMaxCharLimit100: 100,
        empty: 0,
      };
    }

    function getLogo() {
      return BrandService.getLogoUrl(Authinfo.getOrgId()).then(function (logoUrl) {
        return $http.get(logoUrl, {
          responseType: 'arraybuffer',
        });
      });
    }

    function getLogoUrl() {
      return BrandService.getSettings(Authinfo.getOrgId()).then(function (settings) {
        return settings.logoUrl;
      });
    }

    function generateCodeSnippet(templateId) {
      var appName = UrlConfig.getSunlightBubbleUrl();
      var orgId = Authinfo.getOrgId();
      return '<script>\n' +
        '  (function(document, script) {\n' +
        '  var bubbleScript = document.createElement(script);\n' +
        '  e = document.getElementsByTagName(script)[0];\n' +
        '  bubbleScript.async = true;\n' +
        "  bubbleScript.CiscoAppId =  'cisco-chat-bubble-app';\n" +
        "  bubbleScript.DC = '" + appName.split('https://bubble.')[1] + "';\n" +
        "  bubbleScript.orgId = '" + orgId + "';\n" +
        "  bubbleScript.templateId = '" + templateId + "';\n" +
        "  bubbleScript.src = '" + appName + "/bubble.js';\n" +
        "  bubbleScript.type = 'text/javascript';\n" +
        "  bubbleScript.setAttribute('charset', 'utf-8');\n" +
        '  e.parentNode.insertBefore(bubbleScript, e);\n' +
        "  })(document, 'script');\n" +
        '</script>';
    }

    function labelForTime(time) {
      return moment(time, 'HH:mm').locale('en').format('hh:mm A');
    }

    function hoursWithSuffix(suffix) {
      return _.range(0, 24).map(function (time) {
        return _.padStart(time, 2, '0') + suffix;
      });
    }

    function getTimeOptions() {
      var values = _.flatten(_.zip(hoursWithSuffix(':00'), hoursWithSuffix(':30')));
      return _.map(values, function (value) {
        return {
          label: labelForTime(value),
          value: value,
        };
      });
    }

    function getEndTimeOptions(startTime) {
      var timeOptions = getTimeOptions();
      // Push 11:59 PM as end time to handle the scenario where start time is 11:30 PM.
      timeOptions.push({
        label: labelForTime('23:59'),
        value: '23:59',
      });
      var index = _.findIndex(timeOptions, {
        label: labelForTime(startTime.value),
        value: startTime.value,
      });
      return timeOptions.slice(index + 1, timeOptions.length);
    }

    function getDefaultTimes() {
      var timeOptions = getTimeOptions();
      return {
        startTime: _.find(timeOptions, {
          value: '08:00',
        }),
        endTime: _.find(timeOptions, {
          value: '16:00',
        }),
      };
    }

    function labelForTimezone(zone) {
      var map = TimezoneService.getCountryMapping();
      return map[zone] + ': ' + zone;
    }

    function getTimezoneOptions() {
      var timezones = moment.tz.names()
        .filter(function (zone) {
          var map = TimezoneService.getCountryMapping();
          return map[zone];
        })
        .map(function (zone) {
          return {
            label: labelForTimezone(zone),
            value: zone,
          };
        })
        .sort(function (a, b) {
          return a['label'].localeCompare(b['label']);
        });
      return timezones;
    }

    function getDefaultTimeZone() {
      return _.find(getTimezoneOptions(), {
        value: 'America/New_York',
      });
    }

    function getTimeZone(zone) {
      return _.find(getTimezoneOptions(), {
        value: zone,
      });
    }

    function getPreviewDays(days, continuous, startIndex, endIndex) {
      if (startIndex == endIndex) {
        return days[startIndex].label;
      }

      if (continuous) {
        return days[startIndex].label + ' - ' + days[endIndex].label;
      }

      return _.map(_.filter(days, 'isSelected'), 'label').join(', ');
    }

    function getDays() {
      return [{
        day: 'S',
        label: 'Sunday',
        isSelected: false,
      }, {
        day: 'M',
        label: 'Monday',
        isSelected: true,
      }, {
        day: 'T',
        label: 'Tuesday',
        isSelected: true,
      }, {
        day: 'W',
        label: 'Wednesday',
        isSelected: true,
      }, {
        day: 'T',
        label: 'Thursday',
        isSelected: true,
      }, {
        day: 'F',
        label: 'Friday',
        isSelected: true,
      }, {
        day: 'S',
        label: 'Saturday',
        isSelected: false,
      }];
    }

    function openEmbedCodeModal(templateId, templateName) {
      var header = $translate.instant('careChatTpl.embedCodeFor');
      $modal.open({
        template: require('modules/sunlight/features/customerSupportTemplate/wizardPages/ctEmbedCodeModal.tpl.html'),
        type: 'small',
        controller: 'EmbedCodeCtrl',
        controllerAs: 'embedCodeCtrl',
        resolve: {
          templateId: function () {
            return templateId;
          },
          templateHeader: function () {
            return header + templateName;
          },
        },
      });
    }

    function getValidationMessages(minLength, maxLength) {
      return {
        required: $translate.instant('common.invalidRequired'),
        minlength: $translate.instant('common.invalidMinLength', {
          min: minLength,
        }),
        maxlength: $translate.instant('common.invalidMaxLength', {
          max: maxLength,
        }),
        invalidInput: $translate.instant('careChatTpl.ctValidation.invalidCharacters'),
      };
    }

    function getOverviewPageCards(mediaType, isProactiveFlagEnabled, isVirtualChatAssistantEnabled) {
      var cards = [];
      switch (mediaType) {
        case 'chat':
          if (isProactiveFlagEnabled) {
            cards.push({ name: 'proactivePrompt', mediaIcons: [] });
          }
          cards.push({ name: 'customerInformation', mediaIcons: [] });
          if (isVirtualChatAssistantEnabled) {
            cards.push({ name: 'virtualAssistant', mediaIcons: [] });
          }
          cards.push({ name: 'agentUnavailable', mediaIcons: [] });
          cards.push({ name: 'offHours', mediaIcons: [] });
          cards.push({ name: 'feedback', mediaIcons: [] });
          break;
        case 'callback':
          cards.push({ name: 'customerInformation', mediaIcons: [] });
          cards.push({ name: 'offHours', mediaIcons: [] });
          cards.push({ name: 'feedbackCallback', mediaIcons: [] });
          break;
        case 'chatPlusCallback':
          if (isProactiveFlagEnabled) {
            cards.push({ name: 'proactivePrompt', mediaIcons: ['icon-message'] });
          }
          cards.push({ name: 'customerInformationChat', mediaIcons: ['icon-message'] });
          if (isVirtualChatAssistantEnabled) {
            cards.push({ name: 'virtualAssistant', mediaIcons: ['icon-message'] });
          }
          cards.push({ name: 'agentUnavailable', mediaIcons: ['icon-message'] });
          cards.push({ name: 'feedback', mediaIcons: ['icon-message'] });
          cards.push({ name: 'customerInformationCallback', mediaIcons: ['icon-phone'] });
          cards.push({ name: 'feedbackCallback', mediaIcons: ['icon-phone'] });
          cards.push({ name: 'offHours', mediaIcons: ['icon-message', 'icon-phone'] });
          break;
        default:
          return cards;
      }
      return cards;
    }

    function getStatesBasedOnType(mediaType, isProactiveFlagEnabled) {
      var states = [];
      switch (mediaType) {
        case 'chat':
          states.push('name');
          states.push('overview');
          if (isProactiveFlagEnabled) {
            states.push('proactivePrompt');
          }
          states.push('customerInformation');
          states.push('virtualAssistant');
          states.push('agentUnavailable');
          states.push('offHours');
          states.push('feedback');
          states.push('profile');
          states.push('chatStatusMessages');
          states.push('summary');
          break;
        case 'callback':
          states.push('name');
          states.push('overview');
          states.push('customerInformation');
          states.push('offHours');
          states.push('feedbackCallback');
          states.push('summary');
          break;
        case 'chatPlusCallback':
          states.push('name');
          states.push('overview');
          if (isProactiveFlagEnabled) {
            states.push('proactivePrompt');
          }
          states.push('customerInformationChat');
          states.push('virtualAssistant');
          states.push('agentUnavailable');
          states.push('feedback');
          states.push('profile');
          states.push('chatStatusMessages');
          states.push('customerInformationCallback');
          states.push('feedbackCallback');
          states.push('offHours');
          states.push('summary');
          break;
        default:
          return states;
      }
      return states;
    }
  }
})();
