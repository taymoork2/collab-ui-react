(function () {
  'use strict';

  /* global Uint8Array:false */

  angular
    .module('Sunlight')
    .service('CTService', CTService);

  /* @ngInject */
  function CTService($http, $translate, Authinfo, BrandService, TimezoneService, UrlConfig) {
    var service = {
      getDays: getDays,
      getLogo: getLogo,
      getPreviewDays: getPreviewDays,
      getTimeOptions: getTimeOptions,
      getEndTimeOptions: getEndTimeOptions,
      getDefaultTimes: getDefaultTimes,
      getTimezoneOptions: getTimezoneOptions,
      getDefaultTimeZone: getDefaultTimeZone,
      generateCodeSnippet: generateCodeSnippet
    };
    return service;

    function getLogo() {
      return BrandService.getLogoUrl(Authinfo.getOrgId()).then(function (logoUrl) {
        return $http.get(logoUrl, {
          responseType: "arraybuffer"
        });
      });
    }

    function generateCodeSnippet(templateId) {
      var appName = UrlConfig.getSunlightBubbleUrl();
      var orgId = Authinfo.getOrgId();
      return "<script>(function(document, script) {" +
        "var bubbleScript = document.createElement(script);" +
        "e = document.getElementsByTagName(script)[0];" +
        "bubbleScript.async = true;" +
        "bubbleScript.CiscoAppId =  'cisco-chat-bubble-app';" +
        "bubbleScript.DC = 'rciad.ciscoccservice.com';" +
        "bubbleScript.orgId = '" + orgId + "';" +
        "bubbleScript.templateId = '" + templateId + "';" +
        "bubbleScript.src = '" + appName + "/bubble.js';" +
        "bubbleScript.type = \"text/javascript\";" +
        "bubbleScript.setAttribute(\"charset\", \"utf-8\");" +
        "e.parentNode.insertBefore(bubbleScript, e);" +
        "})(document, \"script\");         </script>";
    }

    function labelForTime(time) {
      var currentLanguage = $translate.use();
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
      var index = _.findIndex(timeOptions, {
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
  }
})();
