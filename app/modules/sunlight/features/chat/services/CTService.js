(function () {
  'use strict';

  /* global Uint8Array:false */

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
      getValidationMessages: getValidationMessages
    };
    return service;

    function getLengthValidationConstants() {
      return {
        singleLineMaxCharLimit: 50,
        multiLineMaxCharLimit: 250,
        empty: 0
      };
    }

    function getLogo() {
      return BrandService.getLogoUrl(Authinfo.getOrgId()).then(function (logoUrl) {
        return $http.get(logoUrl, {
          responseType: "arraybuffer"
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
      return "<script>\n" +
        "  (function(document, script) {\n" +
        "  var bubbleScript = document.createElement(script);\n" +
        "  e = document.getElementsByTagName(script)[0];\n" +
        "  bubbleScript.async = true;\n" +
        "  bubbleScript.CiscoAppId =  'cisco-chat-bubble-app';\n" +
        "  bubbleScript.DC = '" + appName.split('https://bubble.')[1] + "';\n" +
        "  bubbleScript.orgId = '" + orgId + "';\n" +
        "  bubbleScript.templateId = '" + templateId + "';\n" +
        "  bubbleScript.src = '" + appName + "/bubble.js';\n" +
        "  bubbleScript.type = 'text/javascript';\n" +
        "  bubbleScript.setAttribute('charset', 'utf-8');\n" +
        "  e.parentNode.insertBefore(bubbleScript, e);\n" +
        "  })(document, 'script');\n" +
        "</script>";
    }

    function labelForTime(time) {
      var currentLanguage = $translate.use();
      // Need to check for other languages
      return (currentLanguage === 'en_US') ? moment(time, 'HH:mm').format('hh:mm A') : time;
    }

    function hoursWithSuffix(suffix) {
      return _.range(0, 24).map(function (time) {
        return _.padLeft(time, 2, '0') + suffix;
      });
    }

    function getTimeOptions() {
      var values = _.flatten(_.zip(hoursWithSuffix(':00'), hoursWithSuffix(':30')));
      return _.map(values, function (value) {
        return {
          label: labelForTime(value),
          value: value
        };
      });
    }

    function getEndTimeOptions(startTime) {
      var timeOptions = getTimeOptions();
      // Push 11:59 PM as end time to handle the scenario where start time is 11:30 PM.
      timeOptions.push({
        label: labelForTime('23:59'),
        value: '23:59'
      });
      var index = _.findIndex(timeOptions, {
        label: labelForTime(startTime.value),
        value: startTime.value
      });
      return timeOptions.slice(index + 1, timeOptions.length);
    }

    function getDefaultTimes() {
      var timeOptions = getTimeOptions();
      return {
        startTime: _.find(timeOptions, {
          value: '08:00'
        }),
        endTime: _.find(timeOptions, {
          value: '16:00'
        })
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
            'label': labelForTimezone(zone),
            'value': zone
          };
        })
        .sort(function (a, b) {
          return a['label'].localeCompare(b['label']);
        });
      return timezones;
    }

    function getDefaultTimeZone() {
      return _.find(getTimezoneOptions(), {
        value: 'America/New_York'
      });
    }

    function getTimeZone(zone) {
      return _.find(getTimezoneOptions(), {
        value: zone
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
        isSelected: false
      }, {
        day: 'M',
        label: 'Monday',
        isSelected: true
      }, {
        day: 'T',
        label: 'Tuesday',
        isSelected: true
      }, {
        day: 'W',
        label: 'Wednesday',
        isSelected: true
      }, {
        day: 'T',
        label: 'Thursday',
        isSelected: true
      }, {
        day: 'F',
        label: 'Friday',
        isSelected: true
      }, {
        day: 'S',
        label: 'Saturday',
        isSelected: false
      }];
    }

    function openEmbedCodeModal(templateId, templateName) {
      var header = $translate.instant('careChatTpl.embedCodeFor');
      $modal.open({
        templateUrl: 'modules/sunlight/features/chat/ctEmbedCodeModal.tpl.html',
        type: 'small',
        controller: 'EmbedCodeCtrl',
        controllerAs: 'embedCodeCtrl',
        resolve: {
          templateId: function () {
            return templateId;
          },
          templateHeader: function () {
            return header + templateName;
          }
        }
      });
    }

    function getValidationMessages(minLength, maxLength) {
      return {
        required: $translate.instant('common.invalidRequired'),
        minlength: $translate.instant('common.invalidMinLength', {
          'min': minLength
        }),
        maxlength: $translate.instant('common.invalidMaxLength', {
          'max': maxLength
        })
      };
    }
  }
})();
