import { CtBaseController } from './ctBase.controller';

class CtOffHoursController extends CtBaseController {

  /* @ngInject*/
  constructor(
    public $stateParams: ng.ui.IStateParamsService,
    public TemplateWizardService,
    public $translate: ng.translate.ITranslateService,
    public CTService,
  ) {
    super($stateParams, TemplateWizardService, CTService, $translate);
  }


  public days;
  public isBusinessHoursDisabled = false;
  public daysPreview;
  public isBusinessDaySelected = true;
  public isOffHoursMessageValid = true;
  public timezoneOptions = this.CTService.getTimezoneOptions();
  public startTimeOptions = this.CTService.getTimeOptions();
  public timings = this.CTService.getDefaultTimes();
  public scheduleTimeZone = this.CTService.getDefaultTimeZone();
  public endTimeOptions = this.CTService.getEndTimeOptions(this.timings.startTime);

  private setDayPreview(): void {
    const firstSelectedDayIndex = _.findIndex(this.days, 'isSelected');
    const lastSelectedDayIndex = _.findLastIndex(this.days, 'isSelected');

    this.isBusinessHoursDisabled = firstSelectedDayIndex === -1;

    if (!this.isBusinessHoursDisabled) {
      const isDiscontinuous = _.some(
        _.slice(this.days, firstSelectedDayIndex, lastSelectedDayIndex + 1), {
          isSelected: false,
        });
      this.daysPreview = this.CTService.getPreviewDays(this.days, !isDiscontinuous, firstSelectedDayIndex, lastSelectedDayIndex);
    }
  }

  public setEndTimeOptions(): void {
    this.endTimeOptions = this.CTService.getEndTimeOptions(this.timings.startTime);
    if (this.timings.endTime.value < this.endTimeOptions[0].value) {
      this.timings.endTime = this.endTimeOptions[0];
    }
  }

  public setDayAndValidate(index): void {
    this.days[index].isSelected = !this.days[index].isSelected;
    this.isBusinessDaySelected = _.find(this.days, 'isSelected');
    this.setDayPreview();
    this.setOffHoursData();
    this.isOffHoursPageValid();

  }

  private populateViewModal(): void {
    this.timings.startTime.label = this.template.configuration.pages.offHours.schedule.timings.startTime;
    this.timings.endTime.label = this.template.configuration.pages.offHours.schedule.timings.endTime;
    this.scheduleTimeZone = this.CTService.getTimeZone(this.template.configuration.pages.offHours.schedule.timezone);
    const businessDays = this.template.configuration.pages.offHours.schedule.businessDays;
    this.days = _.map(this.CTService.getDays(), function (day: any) {
      const selectedDay: any = day;
      selectedDay.isSelected = _.includes(businessDays, day.label);
      return selectedDay;
    });
  }

  private setOffHoursWarning(): void {
    this.isOffHoursMessageValid = this.TemplateWizardService.template.configuration.pages.offHours.message !== '';
  }

  public setOffHoursData(): void {
    this.template.configuration.pages.offHours.enabled = true;
    this.template.configuration.pages.offHours.schedule.businessDays = _.map(_.filter(this.days, 'isSelected'), 'label');
    this.template.configuration.pages.offHours.schedule.timings.startTime = this.timings.startTime.label;
    this.template.configuration.pages.offHours.schedule.timings.endTime = this.timings.endTime.label;
    this.template.configuration.pages.offHours.schedule.timezone = this.scheduleTimeZone.value;
  }

  public isOffHoursPageValid(): boolean {
    this.setOffHoursWarning();
    if (this.TemplateWizardService.isValidField(this.TemplateWizardService.template.configuration.pages.offHours.message,
        this.lengthValidationConstants.multiLineMaxCharLimit) && this.isBusinessDaySelected &&
      this.TemplateWizardService.isInputValid(this.TemplateWizardService.template.configuration.pages.offHours.message)) {
      this.TemplateWizardService.pageValidationResult.offHoursValid = true;
      return true;
    }
    this.TemplateWizardService.pageValidationResult.offHoursValid = false;
    return false;
  }

  public $onInit(): void {
    this.populateViewModal();
    this.isOffHoursPageValid();
  }

}

export class CtOffHoursComponent implements ng.IComponentOptions {
  public controller = CtOffHoursController;
  public template = require('modules/sunlight/features/customerSupportTemplate/wizardPagesComponent/ctOffHours.tpl.html');

}

export default angular
  .module('Sunlight')
  .component('ctOffHoursComponent', new CtOffHoursComponent())
  .name;
