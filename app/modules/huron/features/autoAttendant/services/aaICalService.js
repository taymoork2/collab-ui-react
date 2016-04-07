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
      getTwoLetterDays: getTwoLetterDays,
      getRanks: getRanks,
      addHoursRange: addHoursRange,
      getHoursRanges: getHoursRanges,
      getDefaultDayHours: getDefaultDayHours
    };

    return service;

    /////////////////////

    function createCalendar() {
      var calendar = new ical.Component('vcalendar');
      setTz(calendar);
      return calendar;
    }

    function getDefaultRange(type) {
      if (type !== 'holiday') {
        return {
          days: [{
            label: 'Monday',
            index: 1,
            active: false
          }, {
            label: 'Tuesday',
            index: 2,
            active: false
          }, {
            label: 'Wednesday',
            index: 3,
            active: false
          }, {
            label: 'Thursday',
            index: 4,
            active: false
          }, {
            label: 'Friday',
            index: 5,
            active: false
          }, {
            label: 'Saturday',
            index: 6,
            active: false
          }, {
            label: 'Sunday',
            index: 0,
            active: false
          }]
        };
      } else {
        return [];
      }

    }

    function getTwoLetterDays() {
      return ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    }

    function getRanks() {
      return [{
        label: 'ranks.first',
        index: 0,
        number: 1
      }, {
        label: 'ranks.second',
        index: 1,
        number: 2
      }, {
        label: 'ranks.third',
        index: 2,
        number: 3
      }, {
        label: 'ranks.fourth',
        index: 3,
        number: 4
      }, {
        label: 'ranks.last',
        index: -1,
        number: -1
      }];
    }

    function findRankByNumber(number) {
      return _.find(getRanks(), function (rank) {
        if (number == rank.number) {
          return rank;
        }
      });
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
            var date = getNextOpenDate(hoursRange.days);
            date.seconds(0);
            date.hours(hoursRange.starttime.getHours());
            date.minutes(hoursRange.starttime.getMinutes());
            hoursRange.starttime = new Date(date.toDate());
            date.hours(hoursRange.endtime.getHours());
            date.minutes(hoursRange.endtime.getMinutes());
            hoursRange.endtime = new Date(date.toDate());
          } else if (type === 'holiday') {
            vevent.addPropertyWithValue('summary', 'holiday');
            var startDate, endDate;
            var description = hoursRange.name;
            if (hoursRange.exactDate) {
              startDate = moment(hoursRange.date, 'YYYY-MM-DD').toDate();
              endDate = moment(hoursRange.date, 'YYYY-MM-DD').toDate();
            } else {
              //Find the first occurrence of the rule
              startDate = getNextOccurrenceHolidays(hoursRange).toDate();
              endDate = new Date(startDate);
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
              //Set the rule in the calendar
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
          // The date of the first day selected?  Today?

          var p = getiCalDateTime(calendar, 'dtstart', hoursRange.starttime);
          vevent.addProperty(p);

          p = getiCalDateTime(calendar, 'dtend', hoursRange.endtime);
          vevent.addProperty(p);

          // add event to calendar
          calendar.addSubcomponent(vevent);
        }
      }
    }

    function getNextOpenDate(days) {
      var flag = _.each(days, function (day) {
        if (day.active) {
          return true;
        }
      });
      if (flag) {
        var date = moment();
        while (!findDayByIndex(date.day(), days).active) {
          date.add(1, 'day');
        }
        return date;
      }
    }

    function findDayByIndex(dayIndex, days) {
      return _.find(days, function (day) {
        if (dayIndex == day.index) {
          return day;
        }
      });
    }

    function getNextOccurrenceHolidays(hoursRange) {
      var date;
      var dayOfWeek = hoursRange.day.index;
      if (hoursRange.rank.index == -1) {
        //Set the date to the last of the <month>
        date = moment({
          month: hoursRange.month.index + 1,
          date: 0
        });

        //Find the last <dayOfWeek> of this month for the current year
        while (date.day() != dayOfWeek && date.month() == hoursRange.month.index) {
          date.subtract(1, 'day');
        }

        //If the date is in the past,
        if (moment().diff(date, 'day') > 0) {
          date = moment({
            month: hoursRange.month.index + 1,
            date: 0,
            year: moment().year() + 1
          });
          //Find the last <dayOfWeek> of this month for next year.
          while (date.day() != dayOfWeek && date.month() == hoursRange.month.index) {
            date.subtract(1, 'day');
          }
        }
      } else {
        //Set the date to the 1st of the <month>
        date = moment({
          month: hoursRange.month.index,
          date: 1
        });

        //Find the first <dayOfWeek> of this month for this year.
        while (date.day() != dayOfWeek && date.month() == hoursRange.month.index) {
          date.add(1, 'day');
        }
        //Apply the rank if it is not the weekday option
        date.add(hoursRange.rank.index, 'week');

        //If the date is in the past,
        if (moment().diff(date, 'day') > 0) {
          date = moment({
            month: hoursRange.month.index,
            date: 1,
            year: moment().year() + 1
          });

          //Find the first <dayOfWeek> of this month for this year.
          while (date.day() != dayOfWeek && date.month() == hoursRange.month.index) {
            date.add(1, 'day');
          }
          //Apply the rank if it is not the weekday option
          date.add(hoursRange.rank.index, 'week');
        }
      }
      //Force moment to proceed the date
      date = moment({
        year: date.year(),
        month: date.month(),
        date: date.date()
      });
      date.format('YYYY-MM-DD');
      return date;
    }

    function getTz(calendar) {
      var timezoneComp = calendar.getFirstSubcomponent('vtimezone');
      var tzid = timezoneComp.getFirstPropertyValue('tzid');

      return new ical.Timezone({
        component: timezoneComp,
        tzid: tzid
      });
    }

    function setTz(calendar) {
      var tz = 'UTC/GMT';
      var timezoneComp = new ical.Component('vtimezone');
      timezoneComp.addPropertyWithValue('tzid', tz);
      timezoneComp.addPropertyWithValue('x-lic-location', tz);
      calendar.addSubcomponent(timezoneComp);
    }

    function getiCalDateTime(calendar, dateType, time) {
      var timezone = getTz(calendar);
      var p = new ical.Property(dateType);
      p.setValue(new ical.Time({
        year: time.getFullYear(),
        month: (time.getMonth() + 1),
        day: time.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: 0,
        isDate: false
      }));
      p.setParameter('tzid', timezone.tzid);
      return p;
    }

    function getHoursRanges(calendarRaw) {
      var icsStr = calendarRaw.scheduleData;

      var jcalData = ical.parse(icsStr);
      var calendar = new ical.Component(jcalData);

      var hoursRanges = [];
      var holidayRanges = [];

      _.forEach(calendar.getAllSubcomponents("vevent"), function (vevent) {

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
          _.forEach(eventDays.split(','), function (eventDay) { //Use object instead?
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
            hoursRange.month = {};
            hoursRange.month.number = parseInt(description[1]);
            hoursRange.month.index = hoursRange.month.number - 1;
            hoursRange.rank = findRankByNumber(description[2]);
            hoursRange.day = {};
            hoursRange.day.abbr = description[3];
            hoursRange.day.index = getTwoLetterDays().indexOf(description[3]);
            hoursRange.exactDate = false;
          }
          hoursRange.date = moment(hoursRange.starttime).format("YYYY-MM-DD");
          if (dtstart.hour === 0 && dtstart.minute === 0 && dtend.hour === 23 && dtend.minute === 59) {
            hoursRange.allDay = true;
            hoursRange.starttime = undefined;
            hoursRange.endtime = undefined;
          }
          //Read the recurrence
          rrule = vevent.getFirstPropertyValue('rrule');
          if (rrule && rrule.freq == 'YEARLY') {
            hoursRange.recurAnnually = true;
          }
          holidayRanges.push(hoursRange);
        }

      });
      holidayRanges.sort(function (holiday1, holiday2) {
        var date1 = moment(holiday1.date, 'YYYY-MM-DD');
        if (holiday1.exactDate && holiday1.recurAnnually) {
          date1.year(moment().year());
          if (moment().diff(date1, 'day') > 0) {
            date1.year(date1.year() + 1);
          }
        }
        if (!holiday1.exactDate && holiday1.recurAnnually) {
          date1 = getNextOccurrenceHolidays(holiday1);
        }
        holiday1.date = date1.format('YYYY-MM-DD');
        var date2 = moment(holiday2.date, 'YYYY-MM-DD');
        if (holiday2.exactDate && holiday2.recurAnnually) {
          date2.year(moment().year());
          if (moment().diff(date2, 'day') > 0) {
            date2.year(date2.year() + 1);
          }
        }
        if (!holiday2.exactDate && holiday2.recurAnnually) {
          date2 = getNextOccurrenceHolidays(holiday2);
        }
        holiday2.date = date2.format('YYYY-MM-DD');
        return date1.diff(date2);
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
