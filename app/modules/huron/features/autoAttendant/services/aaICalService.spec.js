'use strict';

describe('Service: AACalendarService', function () {
  var AAICalService, ical;
  // require('jasmine-collection-matchers');
  var starttime, endtime;
  var defaultRange = {
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

  describe('addHoursRange - getHoursRanges', function () {
    it('add valid hours range to the calendar and should get the same range', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.days[5].active = true;
      range.days[6].active = true;
      range.starttime = new Date(starttime);
      range.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0].days).toEqual(range.days);
      expect(rangeFromCalendar[0].starttime.toString()).toEqual(starttime.toString());
      expect(rangeFromCalendar[0].endtime.toString()).toEqual(endtime.toString());
    });

    it('add valid hours range to the calendar and should get the same range (case today is a closed day)', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.days[0].active = true;
      range.days[1].active = true;
      range.days[2].active = true;
      range.days[3].active = true;
      range.days[4].active = true;
      range.days[5].active = true;
      range.days[6].active = true;
      //Today is a closed day
      var today = AAICalService.findDayByIndex(starttime.getDay(), range.days);
      today.active = false;
      range.starttime = new Date(starttime);
      range.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0].days).toEqual(range.days);
      expect(rangeFromCalendar[0].starttime.toString()).toEqual(moment(starttime).add(1, 'day').toDate().toString());
      expect(rangeFromCalendar[0].endtime.toString()).toEqual(moment(endtime).add(1, 'day').toDate().toString());
    });

    it('add hours range without days to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.starttime = new Date(starttime);
      range.endtime = new Date(endtime);
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

      range.endtime = new Date(endtime);
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
      range.starttime = new Date(starttime);

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
      range1.starttime = new Date(starttime);
      range1.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range1);
      var range2 = AAICalService.getDefaultRange();
      range2.days[5].active = true;
      range2.days[6].active = true;
      range2.starttime = new Date(starttime);
      range2.endtime = new Date(endtime);
      AAICalService.addHoursRange('open', calendar, range2);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).hours;
      expect(rangeFromCalendar.length).toEqual(2);
    });

    it('add holiday and get back holiday range with all day selected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        date: '2016-11-25',
        allDay: true
      };

      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0].allDay).toEqual(true);
    });

    it('add holiday and get back holiday range with all day unselected', function () {
      var calendar = AAICalService.createCalendar();
      var range = {
        name: 'Thanksgiving',
        date: '2016-11-25',
        allDay: false,
        starttime: starttime,
        endtime: endtime
      };

      AAICalService.addHoursRange('holiday', calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw).holidays;
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0].allDay).toEqual(undefined);
    });

  });
});
