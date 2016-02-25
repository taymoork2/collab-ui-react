(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAICalService', AAICalService);

  /* @ngInject */
  function AAICalService(ical) {

    var service = {
      createCalendar: createCalendar,
      getDefaultRange: getDefaultRange,
      addHoursRange: addHoursRange,
      getHoursRanges: getHoursRanges
    };

    return service;

    /////////////////////

    function createCalendar() {
      return new ical.Component('vcalendar');
    }

    function getDefaultRange() {
      return {
        days: [{
          label: 'Monday',
          active: false
        }, {
          label: 'Tuesday',
          active: false
        }, {
          label: 'Wednesday',
          active: false
        }, {
          label: 'Thursday',
          active: false
        }, {
          label: 'Friday',
          active: false
        }, {
          label: 'Saturday',
          active: false
        }, {
          label: 'Sunday',
          active: false
        }]
      };
    }

    function addHoursRange(calendar, hoursRange) {
      if (hoursRange.starttime && hoursRange.endtime) {
        // the recurrence days for the hour range
        var days = [];

        // icalendar uses the first two letters as abbrev for the day
        _.forEach(hoursRange.days, function (day) {
          if (day.active) {
            days.push(day.label.substring(0, 2).toUpperCase());
          }
        });
        if (days.length > 0) {
          // create event
          var vevent = new ical.Component('vevent');

          // create vtimezone
          var timezoneComp = new ical.Component('vtimezone');
          timezoneComp.addPropertyWithValue('tzid', 'Europe/London');
          timezoneComp.addPropertyWithValue('x-lic-location', 'Europe/London');
          calendar.addSubcomponent(timezoneComp);

          var timezone = new ical.Timezone({
            component: timezoneComp,
            tzid: 'Europe/London'
          });

          // Server iCalendar parse seems to want Time with a particular date (year, month, day)
          // Or at least default year, month, day don't parse on server side
          // But we are doing recurrence based on day of week, so what particular date?
          // The date of the first day selected?  Today?

          var p = new ical.Property('dtstart');
          p.setValue(new ical.Time({
            year: 2015,
            month: 7,
            day: 14,
            hour: hoursRange.starttime.getHours(),
            minute: hoursRange.starttime.getMinutes(),
            second: 0,
            isDate: false
          }, timezone));
          p.setParameter('tzid', 'Europe/London');
          vevent.addProperty(p);

          p = new ical.Property('dtend');
          p.setValue(new ical.Time({
            year: 2015,
            month: 7,
            day: 14,
            hour: hoursRange.endtime.getHours(),
            minute: hoursRange.endtime.getMinutes(),
            second: 0,
            isDate: false
          }, timezone));
          p.setParameter('tzid', 'Europe/London');
          vevent.addProperty(p);

          // recurrence
          var strRRule = 'FREQ=WEEKLY;BYDAY=' + days.toString();
          var recur = ical.Recur.fromString(strRRule);
          p = new ical.Property('rrule');
          p.setValue(recur);
          vevent.addProperty(p);

          // add event to calendar
          calendar.addSubcomponent(vevent);
        }
      }
    }

    function getHoursRanges(calendarRaw) {
      var icsStr = calendarRaw.scheduleData;
      var jcalData = ical.parse(icsStr);
      var calendar = new ical.Component(jcalData);

      var hoursRanges = [];

      var vevents = calendar.getAllSubcomponents("vevent");

      _.forEach(vevents, function (vevent) {
        var event = new ical.Event(vevent);

        // create vtimezone
        var timezoneComp = calendar.getFirstSubcomponent('vtimezone');
        var tzid = timezoneComp.getFirstPropertyValue('tzid');

        var timezone = new ical.Timezone({
          component: timezoneComp,
          tzid: tzid
        });

        var dtstart = vevent.getFirstPropertyValue('dtstart');
        var dtend = vevent.getFirstPropertyValue('dtend');

        var hoursRange = getDefaultRange();
        hoursRange.starttime = new Date(dtstart.year, dtstart.month, dtstart.day, dtstart.hour, dtstart.minute, dtstart.second);
        hoursRange.endtime = new Date(dtend.year, dtend.month, dtend.day, dtend.hour, dtend.minute, dtend.second);

        var rrule = vevent.getFirstPropertyValue('rrule');
        var strRule = rrule.toString();
        var eventDays = strRule.substring(strRule.indexOf('BYDAY=') + 6);
        // icalendar uses the first two letters as abbrev for the day
        _.forEach(eventDays.split(','), function (eventDay) {
          _.forEach(hoursRange.days, function (day) {
            if (eventDay.substring(0, 2).toUpperCase() == day.label.substring(0, 2).toUpperCase()) {
              day.active = true;
            }
          });
        });

        hoursRanges.push(hoursRange);
      });
      return hoursRanges;
    }
  }
})();
