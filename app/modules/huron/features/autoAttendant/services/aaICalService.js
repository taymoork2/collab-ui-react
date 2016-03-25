(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAICalService', AAICalService);

  /* @ngInject */
  function AAICalService(ical, $translate) {

    //TODO: Remove the find method
    var service = {
      createCalendar: createCalendar,
      getDefaultRange: getDefaultRange,
      getMonths: getMonths,
      findMonthByNumber: findMonthByNumber,
      getDays: getDays,
      findDayByAbbr: findDayByAbbr,
      getRanks: getRanks,
      findRankByNumber: findRankByNumber,
      addHoursRange: addHoursRange,
      getHoursRanges: getHoursRanges
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
            label: 'Monday', //TODO: Use translate?
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

    function getMonths() {
      return [{
        label: 'january',
        index: 0,
        number: 1
      }, {
        label: 'february',
        index: 1,
        number: 2
      }, {
        label: 'march',
        index: 2,
        number: 3
      }, {
        label: 'april',
        index: 3,
        number: 4
      }, {
        label: 'may',
        index: 4,
        number: 5
      }, {
        label: 'june',
        index: 5,
        number: 6
      }, {
        label: 'july',
        index: 6,
        number: 7
      }, {
        label: 'august',
        index: 7,
        number: 8
      }, {
        label: 'september',
        index: 8,
        number: 9
      }, {
        label: 'october',
        index: 9,
        number: 10
      }, {
        label: 'november',
        index: 10,
        number: 11
      }, {
        label: 'december',
        index: 11,
        number: 12
      }];
    }

    function findMonthByNumber(number) {
      var months = getMonths();
      for (var i = 0; i < months.length; i++) {
        if (number == months[i].number) {
          return months[i];
        }
      }
    }

    function getDays() {
      return [{
        label: 'monday',
        index: '1',
        abbr: 'MO'
      }, {
        label: 'tuesday',
        index: '2',
        abbr: 'TU'
      }, {
        label: 'wednesday',
        index: '3',
        abbr: 'WE'
      }, {
        label: 'thursday',
        index: '4',
        abbr: 'TH'
      }, {
        label: 'friday',
        index: '5',
        abbr: 'FR'
      }, {
        label: 'saturday',
        index: '6',
        abbr: 'SA'
      }, {
        label: 'sunday',
        index: '0',
        abbr: 'SU'
      }];
    }

    function findDayByAbbr(abbr) {
      var days = getDays();
      for (var i = 0; i < days.length; i++) {
        if (abbr === days[i].abbr) {
          return days[i];
        }
      }
    }

    function getRanks() {
      return [{
        label: 'first',
        index: 0,
        number: 1
      }, {
        label: 'second',
        index: 1,
        number: 2
      }, {
        label: 'third',
        index: 2,
        number: 3
      }, {
        label: 'fourth',
        index: 3,
        number: 4
      }, {
        label: 'last',
        index: -1,
        number: -1
      }];
    }

    function findRankByNumber(number) {
      var ranks = getRanks();
      for (var i = 0; i < ranks.length; i++) {
        if (number == ranks[i].number) {
          return ranks[i];
        }
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
            var startDate, endDate;
            var description = hoursRange.name;
            if (hoursRange.exactDate) {
              startDate = moment(hoursRange.date).toDate();
              endDate = moment(hoursRange.date).toDate();
            } else {
              //TODO: Find the first occurrence of the rule
              var dayOfWeek = hoursRange.day.index;
              if (hoursRange.rank.index == -1) {
                //Set the date to the last of the <month>
                startDate = moment({
                  month: hoursRange.month.index + 1,
                  day: -1
                });
                if (moment().diff(startDate) > 0) {
                  startDate.year(startDate.year() + 1);
                }
                //Find the last <dayOfWeek> of this month.
                while (startDate.day() != dayOfWeek && startDate.month() == hoursRange.month.index) {
                  startDate.subtract(1, "day");
                }
              } else {
                //Set the date to the 1st of the <month>
                startDate = moment({
                  month: hoursRange.month.index,
                  day: 1
                });
                if (moment().diff(startDate) > 0) {
                  startDate.year(startDate.year() + 1);
                }
                //Find the first <dayOfWeek> of this month.
                while (startDate.day() != dayOfWeek && startDate.month() == hoursRange.month.index) {
                  startDate.add(1, "day");
                }
                //Apply the rank if it is not the weekday option
                startDate.add(hoursRange.rank.index, "week");
              }
              startDate = startDate.toDate();
              endDate = moment(startDate);
              endDate = endDate.toDate();
              //Save the rule in the description
              description += ";" + hoursRange.month.number + ";" + hoursRange.rank.number + ";" + hoursRange.day.abbr;
            }
            if (hoursRange.allDay) {
              startDate.setHours(0);
              startDate.setMinutes(0);
              endDate.setHours(23);
              endDate.setMinutes(59);
            } else {
              startDate.setHours(hoursRange.starttime.getHours());
              startDate.setMinutes(hoursRange.starttime.getMinutes());
              endDate.setHours(hoursRange.endtime.getHours());
              endDate.setMinutes(hoursRange.endtime.getMinutes());
            }
            hoursRange.starttime = startDate;
            hoursRange.endtime = endDate;
            if (hoursRange.recurAnnually) {
              //TODO Set the rule in the calendar
              strRRule = '';
              if (hoursRange.exactDate) {
                strRRule = 'FREQ=YEARLY;BYMONTH=' + (startDate.getMonth() + 1) + ';BYMONTHDAY=' + (startDate.getDate());
              } else {
                strRRule = 'FREQ=YEARLY;BYMONTH=' + hoursRange.month.number + ';BYDAY=' + hoursRange.day.abbr + ';BYSETPOS=' + hoursRange.rank.number;
              }
              recur = ical.Recur.fromString(strRRule);
              p = new ical.Property('rrule');
              p.setValue(recur);
              vevent.addProperty(p);
            }
            vevent.addPropertyWithValue('description', description);
            vevent.addPropertyWithValue('priority', '1');
          }

          // Server iCalendar parse seems to want Time with a particular date (year, month, day)
          // Or at least default year, month, day don't parse on server side
          // But we are doing recurrence based on day of week, so what particular date?
          // The date of the firs t day selected?  Today?

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
      //TODO: Issue multiple time the timezone in the calendar.
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

      _.forEach(calendar.getAllSubcomponents("vevent"), function (vevent) {
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
          _.forEach(eventDays.split(','), function (eventDay) { //TODO: Use object instead?
            _.forEach(hoursRange.days, function (day) {
              if (eventDay.substring(0, 2).toUpperCase() == day.label.substring(0, 2).toUpperCase()) {
                day.active = true;
              }
            });
          });
        } else if (summary === 'holiday') {
          hoursRange.exactDate = true;
          var description = vevent.getFirstPropertyValue('description').split(";");
          hoursRange.name = description[0];
          if (description.length > 3) {
            hoursRange.month = findMonthByNumber(description[1]);
            hoursRange.rank = findRankByNumber(description[2]);
            hoursRange.day = findDayByAbbr(description[3]);
            hoursRange.exactDate = false;
          }
          hoursRange.date = moment(hoursRange.starttime).format("YYYY-MM-DD");
          if (dtstart.hour === 0 && dtstart.minute === 0 && dtend.hour === 23 && dtend.minute === 59) {
            hoursRange.allDay = true;
            hoursRange.starttime = undefined;
            hoursRange.endtime = undefined;
          }
          //TODO: Read the recurrence
          rrule = vevent.getFirstPropertyValue('rrule');
          if (rrule && rrule.freq == 'YEARLY') {
            hoursRange.recurAnnually = true;
          }
          holidayRanges.push(hoursRange);
        }
      });
      return {
        hours: hoursRanges,
        holidays: holidayRanges
      };
    }
  }
})();
