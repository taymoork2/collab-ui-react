'use strict';

fdescribe('Service: AACalendarService', function () {
  var AAICalService, ical;
  // require('jasmine-collection-matchers');
  var starttime, endtime;
  var defaultRange = {
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

  var months = [{
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

  var days = [{
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

  var ranks = [{
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

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AAICalService_, _ical_) {
    AAICalService = _AAICalService_;
    ical = _ical_;
    var date = new Date();
    starttime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), '8', 0, 0);
    endtime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), '17', 0, 0);

  }));

  describe('createCalendar', function () {
    it('should return a new calendar object from ical', function () {
      var calendar = AAICalService.createCalendar();
      expect(calendar).toBeDefined();
      expect(calendar).toEqual(new ical.Component('vcalendar'));
    });
  });

  describe('getDefaultRange', function () {
    it('should return the default range', function () {
      var range = AAICalService.getDefaultRange();
      expect(range).toBeDefined();
      expect(range).toEqual(defaultRange);
    });
  });

  describe('getMonths', function () {
    it('should return the months', function () {
      var actual = AAICalService.getMonths();
      expect(actual).toBeDefined();
      expect(actual).toEqual(months);
    });
  });

  describe('findMonthByNumber', function () {
    it('should return the january', function () {
      var month = AAICalService.findMonthByNumber(1);
      expect(month).toBeDefined();
      expect(month.number).toBe(1);
    });

    it('should return undefined, invalid month number', function () {
      expect(AAICalService.findMonthByNumber(0)).toBeUndefined();
      expect(AAICalService.findMonthByNumber(13)).toBeUndefined();
    });
  });

  describe('getDays', function () {
    it('should return the days', function () {
      var actual = AAICalService.getDays();
      expect(actual).toBeDefined();
      expect(actual).toEqual(days);
    });
  });

  describe('findDayByAbbr', function () {
    it('should return the monday', function () {
      expect(AAICalService.findDayByAbbr('MO')).toEqual(days[0]);
    });

    it('should return the weekday', function () {
      expect(AAICalService.findDayByAbbr('MO,TU,WE,TH,FR')).toEqual(days[7]);
    });

    it('should return the weekend', function () {
      expect(AAICalService.findDayByAbbr('SA,SU')).toEqual(days[8]);
    });

    it('should return undefined', function () {
      expect(AAICalService.findDayByAbbr('TT')).toBeUndefined();
    });
  });

  describe('getRanks', function () {
    it('should return the ranks', function () {
      var actual = AAICalService.getRanks();
      expect(actual).toBeDefined();
      expect(actual).toEqual(ranks);
    });
  });

  describe('findRankByNumber', function () {
    it('should return the january', function () {
      var rank = AAICalService.findRankByNumber(2);
      expect(rank).toBeDefined();
      expect(rank.number).toBe(2);
    });

    it('should return undefined, invalid month number', function () {
      expect(AAICalService.findRankByNumber(0)).toBeUndefined();
      expect(AAICalService.findRankByNumber(5)).toBeUndefined();
    });
  });

  describe('addHoursRange - getHoursRanges', function () {
    it('add valid hours range to the calendar and should get the same range', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.starttime = starttime;
      range.endtime = endtime;
      AAICalService.addHoursRange('open', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toEqual(range);
    });

    it('add hours range without days to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.starttime = starttime;
      range.endtime = endtime;
      AAICalService.addHoursRange('open', calendar, range);
      expect(calendar).toEqual(AAICalService.createCalendar());
    });

    it('add hours range without start time to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;

      range.endtime = endtime;
      AAICalService.addHoursRange('open', calendar, range);
      expect(calendar).toEqual(AAICalService.createCalendar());
    });

    it('add hours range without end time to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.starttime = starttime;

      AAICalService.addHoursRange('open', calendar, range);
      expect(calendar).toEqual(AAICalService.createCalendar());
    });

    it('add multiple valid hours ranges to the calendar and should get the same ranges', function () {
      var calendar = AAICalService.createCalendar();
      var range1 = AAICalService.getDefaultRange();
      range1.days[0].active = true;
      range1.days[1].active = true;
      range1.days[2].active = true;
      range1.days[3].active = true;
      range1.days[4].active = true;
      range1.starttime = starttime;
      range1.endtime = endtime;
      AAICalService.addHoursRange('open', calendar, range1);
      var range2 = AAICalService.getDefaultRange();
      range2.days[5].active = true;
      range2.days[6].active = true;
      range2.starttime = starttime;
      range2.endtime = endtime;
      AAICalService.addHoursRange('open', calendar, range2);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(2);
      expect(rangeFromCalendar[0]).toEqual(range1);
      expect(rangeFromCalendar[1]).toEqual(range2);
    });

    it('add an exact date holiday and get back holiday range with all day selected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Christmas',
        date: '2016-12-25',
        allDay: true,
        exactDate: true
      };

      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].date).toEqual(range.date);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toBeUndefined();
    });

    it('add an exact date holiday and get back holiday range with all day unselected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Christmas',
        date: '2016-12-25',
        starttime: starttime,
        endtime: endtime,
        exactDate: true
      };

      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].date).toEqual(range.date);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toBeUndefined();
    });

    it('add an exact date holiday and get back holiday range with yearly recurrence', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Christmas',
        date: '2016-12-25',
        allDay: true,
        exactDate: true,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].date).toEqual(range.date);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with all day selected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        month: AAICalService.getMonths()[10],
        day: AAICalService.findDayByAbbr('TH'),
        rank: AAICalService.getRanks()[3],
        allDay: true,
        exactDate: false
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with all day unselected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        month: AAICalService.getMonths()[10],
        day: AAICalService.findDayByAbbr('TH'),
        rank: AAICalService.getRanks()[3],
        starttime: starttime,
        endtime: endtime,
        exactDate: false
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with yearly recurrence', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        month: AAICalService.getMonths()[10],
        day: AAICalService.findDayByAbbr('TH'),
        rank: AAICalService.getRanks()[3],
        allDay: true,
        exactDate: false,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });

    it('add an not exact date holiday and get back holiday range with yearly recurrence (last friday of may)', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Last friday of May',
        month: AAICalService.getMonths()[4],
        day: AAICalService.findDayByAbbr('FR'),
        rank: AAICalService.getRanks()[4],
        allDay: true,
        exactDate: false,
        recurAnnually: true
      };
      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toBeDefined();
      expect(rangeFromCalendar[0].name).toEqual(range.name);
      expect(rangeFromCalendar[0].month).toEqual(range.month);
      expect(rangeFromCalendar[0].day).toEqual(range.day);
      expect(rangeFromCalendar[0].rank).toEqual(range.rank);
      expect(rangeFromCalendar[0].allDay).toEqual(range.allDay);
      expect(rangeFromCalendar[0].exactDate).toEqual(range.exactDate);
      expect(rangeFromCalendar[0].recurAnnually).toEqual(range.recurAnnually);
    });
  });
});
