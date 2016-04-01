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
      getHoursRanges: getHoursRanges,
      getDefaultDayHours: getDefaultDayHours
    };

    return service;

    /////////////////////

    function createCalendar() {
      return new ical.Component('vcalendar');
    }

    function getDefaultRange(type) {
      if (type !== 'holiday') {
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
      } else {
        return [];
      }

    }

    function addHoursRange(type, calendar, hoursRange) {
      if ((hoursRange.starttime && hoursRange.endtime) || hoursRange.allDay) {
        // the recurrence days for the hour range
        var days = [];

        // icalendar uses the first two letters as abbrev for the day
        _.forEach(hoursRange.days, function (day) {
          if (day.active) {
            days.push(day.label.substring(0, 2).toUpperCase());
          }
        });
        if ((days.length > 0) || type === 'holiday') {
          // create event
          var vevent = new ical.Component('vevent');

          // create vtimezone
          // recurrence
          if (type === 'open') {
            var strRRule = 'FREQ=WEEKLY;BYDAY=' + days.toString();
            var recur = ical.Recur.fromString(strRRule);
            p = new ical.Property('rrule');
            p.setValue(recur);
            vevent.addProperty(p);
            vevent.addPropertyWithValue('summary', 'open');
            vevent.addPropertyWithValue('priority', '10');
          } else if (type === 'holiday') {
            vevent.addPropertyWithValue('summary', 'holiday');
            var date = moment(hoursRange.date).toDate();
            var _date = moment(hoursRange.date).toDate();
            if (hoursRange.allDay) {
              date.setHours(0);
              date.setMinutes(0);
              _date.setHours(23);
              _date.setMinutes(59);
            } else {
              date.setHours(hoursRange.starttime.getHours());
              date.setMinutes(hoursRange.starttime.getMinutes());
              _date.setHours(hoursRange.endtime.getHours());
              _date.setMinutes(hoursRange.endtime.getMinutes());
            }
            hoursRange.starttime = date;
            hoursRange.endtime = _date;
            vevent.addPropertyWithValue('description', hoursRange.name);
            vevent.addPropertyWithValue('priority', '1');
          }

          // Server iCalendar parse seems to want Time with a particular date (year, month, day)
          // Or at least default year, month, day don't parse on server side
          // But we are doing recurrence based on day of week, so what particular date?
          // The date of the first day selected?  Today?

          var p = getiCalDateTime(calendar, 'dtstart', hoursRange.starttime, type);
          vevent.addProperty(p);

          p = getiCalDateTime(calendar, 'dtend', hoursRange.endtime, type);
          vevent.addProperty(p);

          // add event to calendar
          calendar.addSubcomponent(vevent);
        }
      }
    }

    function getTz(calendar) {
      var tz = 'UTC/GMT';
      var timezoneComp = new ical.Component('vtimezone');
      timezoneComp.addPropertyWithValue('tzid', tz);
      timezoneComp.addPropertyWithValue('x-lic-location', tz);
      calendar.addSubcomponent(timezoneComp);

      var timezone = new ical.Timezone({
        component: timezoneComp,
        tzid: tz
      });
      return timezone;
    }

    function getiCalDateTime(calendar, dateType, time, type) {
      var currentDate = new Date();
      var timezone = getTz(calendar);
      var tz = 'UTC/GMT';
      var p = new ical.Property(dateType);
      p.setValue(new ical.Time({
        year: type !== 'holiday' ? currentDate.getFullYear() : time.getFullYear(),
        month: type !== 'holiday' ? (currentDate.getMonth() + 1) : (time.getMonth() + 1),
        day: type !== 'holiday' ? currentDate.getDate() : time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: 0,
        isDate: false
      }, timezone));
      p.setParameter('tzid', tz);
      return p;
    }

    function getHoursRanges(calendarRaw) {
      var icsStr = calendarRaw.scheduleData;
      var jcalData = ical.parse(icsStr);
      var calendar = new ical.Component(jcalData);

      var hoursRanges = [];
      var holidayRanges = [];

      var vevents = calendar.getAllSubcomponents("vevent");

      _.forEach(vevents, function (vevent, index) {
        var event = new ical.Event(vevent);

        // create vtimezone
        var timezoneComp = calendar.getFirstSubcomponent('vtimezone');
        var tzid = timezoneComp.getFirstPropertyValue('tzid');

        var timezone = new ical.Timezone({
          component: timezoneComp,
          tzid: tzid
        });
        var summary = vevent.getFirstPropertyValue('summary');

        var dtstart = vevent.getFirstPropertyValue('dtstart');
        var dtend = vevent.getFirstPropertyValue('dtend');
        var hoursRange = getDefaultRange(summary);

        hoursRange.starttime = new Date(dtstart.year, dtstart.month - 1, dtstart.day, dtstart.hour, dtstart.minute, dtstart.second);
        hoursRange.endtime = new Date(dtend.year, dtend.month - 1, dtend.day, dtend.hour, dtend.minute, dtend.second);
        if (summary === 'open') {
          hoursRanges.push(hoursRange);
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
        } else if (summary === 'holiday') {
          hoursRange.name = vevent.getFirstPropertyValue('description');
          hoursRange.date = moment(hoursRange.starttime).format("YYYY-MM-DD");
          if (dtstart.hour === 0 && dtstart.minute === 0 && dtend.hour === 23 && dtend.minute === 59) {
            hoursRange.allDay = true;
            hoursRange.starttime = undefined;
            hoursRange.endtime = undefined;
          }
          holidayRanges.push(hoursRange);
        }

      });
      return {
        hours: hoursRanges,
        holidays: holidayRanges
      };
    }

    function getDefaultDayHours() {
      return [{
        label: 'Monday',
        hours: []
      }, {
        label: 'Tuesday',
        hours: []
      }, {
        label: 'Wednesday',
        hours: []
      }, {
        label: 'Thursday',
        hours: []
      }, {
        label: 'Friday',
        hours: []
      }, {
        label: 'Saturday',
        hours: []
      }, {
        label: 'Sunday',
        hours: []
      }];
    }
  }
})();
