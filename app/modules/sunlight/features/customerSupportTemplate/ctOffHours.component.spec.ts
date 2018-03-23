import ctOffHoursComponentModule from './ctOffHours.component';

describe('In ctOffHoursComponent, The controller', () => {

  let controller;
  const businessHours = getJSONFixture('sunlight/json/features/chatTemplateCreation/businessHoursSchedule.json');
  const selectedDaysByDefault = businessHours.selectedDaysByDefault;
  const defaultTimeZone = businessHours.defaultTimeZone;
  const startTimeOptions = businessHours.startTimeOptions;
  const defaultTimings = businessHours.defaultTimings;

  beforeEach(function () {
    this.initModules ('Sunlight', ctOffHoursComponentModule);
    this.injectDependencies (
      'TemplateWizardService',
      'CTService',
    );

    this.TemplateWizardService.setSelectedMediaType('chat');
    this.TemplateWizardService.setInitialState();

    this.compileComponent('ct-off-hours-component', {
      dismiss: 'dismiss()',
    });

    controller = this.controller;
  });

  afterEach(function () {
    controller = this.TemplateWizardService = this.CTService = undefined;
  });

  afterAll(function () {
    this.selectedDaysByDefault = this.defaultTimeZone = this.defaultDayPreview = this.startTimeOptions = this.defaultTimings = this.businessHours = this.deSelectAllDays = undefined;
  });
  const deSelectAllDays = function () {
    _.forEach(controller.days, function (day, key) {
      if (day.isSelected) {
        controller.setDayAndValidate(key);
      }
    });
  };

  function setTimings(startTime) {
    expect(controller.timings).toEqual(defaultTimings);
    controller.timings.startTime = startTime;
    controller.setEndTimeOptions();
  }

  const getStringOfLength = function (length) {
    return Array(length + 1).join('a');
  };

  function setTimezone(timeZoneValue) {
    controller.scheduleTimeZone = _.find(controller.CTService.getTimezoneOptions(), {
      value: timeZoneValue,
    });
  }

  it('should set off hours message and business hours by default', () => {
    expect(controller.template.configuration.pages.offHours.message).toEqual('careChatTpl.offHoursDefaultMessage');
    expect(controller.template.configuration.pages.offHours.schedule.open24Hours).toBe(true);
    expect(controller.isOffHoursMessageValid).toBe(true);
    expect(controller.isBusinessHoursDisabled).toBe(false);
    expect(_.map(_.filter(controller.days, 'isSelected'), 'label')).toEqual(selectedDaysByDefault);
    expect(_.map(controller.timings, 'value')).toEqual(['08:00', '16:00']);
    expect(controller.scheduleTimeZone).toEqual(defaultTimeZone);
  });

  it('should set days', function () {
    deSelectAllDays();
    expect(controller.isBusinessHoursDisabled).toBe(true);
    expect(_.map(_.filter(controller.days, 'isSelected'), 'label')).toEqual([]);
    controller.setDayAndValidate(1); // set Monday
    controller.setDayAndValidate(6); // set Saturday
    expect(_.map(_.filter(controller.days, 'isSelected'), 'label')).toEqual(['Monday', 'Saturday']);
    expect(controller.daysPreview).toEqual('Monday, Saturday');
  });

  it('should set the offHoursValid as false if no days are selected', function () {
    deSelectAllDays();
    expect(controller.isBusinessDaySelected).toBe(undefined);
    expect(controller.isOffHoursPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.offHoursValid).toBe(false);
  });

  it('should set the offHoursValid as false if off hours message is more than 250 characters', function () {
    controller.TemplateWizardService.template.configuration.pages.offHours.message = getStringOfLength(251);
    expect(controller.isOffHoursPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.offHoursValid).toBe(false);
  });

  it('should set the offHoursValid as false if off hours message contains invalid characters', function () {
    controller.template.configuration.pages.offHours.message = '<';
    expect(controller.isOffHoursPageValid()).toBe(false);
    expect(controller.TemplateWizardService.pageValidationResult.offHoursValid).toBe(false);
  });

  it('should select start time and end time correctly if startTime is less than endTime', function () {
    expect(_.map(controller.startTimeOptions, 'label')).toEqual(startTimeOptions);
    const startTime = {
      label: '09:00 AM',
      value: '09:00',
    };
    const oldEndTime = controller.timings.endTime;
    setTimings(startTime);
    expect(controller.timings).toEqual({
      startTime: startTime,
      endTime: oldEndTime,

    });
  });

  it('should select start time and end time correctly if startTime is greater than endTime', function () {
    expect(_.map(controller.startTimeOptions, 'label')).toEqual(startTimeOptions);
    const startTime = {
      label: '05:00 PM',
      value: '17:00',
    };
    const endTime = {
      label: '05:30 PM',
      value: '17:30',
    };
    setTimings(startTime);
    expect(controller.timings).toEqual({
      startTime: startTime,
      endTime: endTime,
    });
  });

  it('should select end time as 11:59 PM if start time is 11:30 PM', function () {
    expect(_.map(controller.startTimeOptions, 'label')).toEqual(startTimeOptions);
    const startTime = {
      label: '11:30 PM',
      value: '23:30',
    };
    const endTime = {
      label: '11:59 PM',
      value: '23:59',
    };
    setTimings(startTime);
    expect(controller.timings).toEqual({
      startTime: startTime,
      endTime: endTime,
    });
  });

  it('should update templateJSON with the offHours data', function () {
    const expectedTemplate: any = {
      enabled: true,
      message: 'careChatTpl.offHoursDefaultMessage',
      schedule: {
        businessDays: ['Monday', 'Friday'],
        open24Hours: false,
        timings: {
          startTime: '10:30 AM',
          endTime: '05:30 PM',
        },
        timezone: 'America/Nassau',
      },
    };

    controller.TemplateWizardService.template.configuration.pages.offHours.schedule.open24Hours = false;
    deSelectAllDays();
    controller.setDayAndValidate(1); // set Monday
    controller.setDayAndValidate(5); // set Saturday
    const startTime = {
      label: '10:30 AM',
      value: '10:30',
    };
    const endTime = {
      label: '05:30 PM',
      value: '17:30',
    };
    setTimings(startTime);
    controller.timings.endTime = endTime;
    setTimezone('America/Nassau');
    controller.setOffHoursData();
    expect(JSON.stringify(controller.template.configuration.pages.offHours)).toEqual(JSON.stringify(expectedTemplate));
  });
});
