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
      areDaysSelected: areDaysSelected,
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
      if (currentLanguage === 'en_US') {
        return moment(time, 'HH:mm').format('hh:mm A');
      } else {
        return time;
      }
    }

    function getTimeOptions() {
      var hourValues = _.range(0, 24).map(function (time) {
        return _.padLeft(time, 2, '0') + ':00';
      });
      var halfHourValues = _.range(0, 24).map(function (time) {
        return _.padLeft(time, 2, '0') + ':30';
      });
      var values = _.flatten(_.zip(hourValues, halfHourValues));
      return _.map(values, function (value) {
        return {
          label: labelForTime(value),
          value: value
        };
      });
    }

    function getEndTimeOptions(startTime) {
      var timeOptions = getTimeOptions();
      var index = _.findIndex(timeOptions, function (option) {
        return option.value == startTime.value;
      });
      return timeOptions.slice(index + 1, timeOptions.length);
    }

    function getDefaultTimes() {
      var timeOptions = getTimeOptions();
      var startTime = _.find(timeOptions, function (timeOption) {
        return timeOption.value == '08:00';
      });
      var endTime = _.find(timeOptions, function (timeOption) {
        return timeOption.value == '16:00';
      });
      return {
        startTime: startTime,
        endTime: endTime
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
      return _.find(getTimezoneOptions(), function (timeZone) {
        return timeZone.value == 'America/New_York';
      });
    }

    function getPreviewDays(days, continous, startIndex, endIndex) {
      if (startIndex != endIndex) {
        if (continous) return days[startIndex].label + ' - ' + days[endIndex].label;
        else {
          var daysPreview = [];
          _.forEach(days, function (day) {
            if (day.isSelected) {
              daysPreview.push(day.label);
            }
          });
          return daysPreview.join(', ');
        }
      } else {
        return days[startIndex].label;
      }
    }

    function areDaysSelected(days) {
      var selectedDayIndex = _.findIndex(days, function (day) {
        return day.isSelected;
      });
      return selectedDayIndex != -1;
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
