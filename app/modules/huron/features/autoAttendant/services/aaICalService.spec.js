'use strict';

describe('Service: AACalendarService', function () {
  var AAICalService, ical;
  // require('jasmine-collection-matchers');

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

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_AAICalService_, _ical_) {
    AAICalService = _AAICalService_;
    ical = _ical_;
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
      range.starttime = new Date(2015, 7, 14, 8, 30, 0);
      range.endtime = new Date(2015, 7, 14, 17, 0, 0);
      AAICalService.addHoursRange(calendar, range);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw);
      expect(rangeFromCalendar.length).toEqual(1);
      expect(rangeFromCalendar[0]).toEqual(range);
    });

    it('add hours range without days to the calendar and should add nothing to the calendar', function () {
      var calendar = AAICalService.createCalendar();
      var range = AAICalService.getDefaultRange();
      range.starttime = new Date(2015, 7, 14, 8, 30, 0);
      range.endtime = new Date(2015, 7, 14, 17, 0, 0);
      AAICalService.addHoursRange(calendar, range);
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
      range.endtime = new Date(2015, 7, 14, 17, 0, 0);
      AAICalService.addHoursRange(calendar, range);
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
      range.starttime = new Date(2015, 7, 14, 8, 30, 0);
      AAICalService.addHoursRange(calendar, range);
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
      range1.starttime = new Date(2015, 7, 14, 8, 30, 0);
      range1.endtime = new Date(2015, 7, 14, 17, 0, 0);
      AAICalService.addHoursRange(calendar, range1);
      var range2 = AAICalService.getDefaultRange();
      range2.days[5].active = true;
      range2.days[6].active = true;
      range2.starttime = new Date(2015, 7, 14, 10, 0, 0);
      range2.endtime = new Date(2015, 7, 14, 19, 20, 0);
      AAICalService.addHoursRange(calendar, range2);
      var calendarRaw = {};
      calendarRaw.scheduleData = calendar.toString();
      var rangeFromCalendar = AAICalService.getHoursRanges(calendarRaw);
      expect(rangeFromCalendar.length).toEqual(2);
      expect(rangeFromCalendar[0]).toEqual(range1);
      expect(rangeFromCalendar[1]).toEqual(range2);
    });
  });
});
