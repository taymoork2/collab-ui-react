import { CommonReportService } from '../commonReportServices/commonReport.service';
import { ReportConstants } from '../commonReportServices/reportConstants.service';
import {
  ITimespan,
  ITimeSliderFunctions,
} from '../partnerReportInterfaces';

class ReportSliderCtrl {
  public options: ITimespan[];
  public updateFunctions: ITimeSliderFunctions;
  public selected: ITimespan;

  /* @ngInject */
  constructor(
    // cannot access breakpoint when rootscope is typed with ng.IRootScopeService
    private $rootScope,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {
    const vm = this;
    this.translateSlider = (index: number): string => {
      return vm.dateArray[index].date;
    };
  }

  // breakpoint checking for screen sizes
  public screenSmall(): boolean {
    return this.screenXSmall() || this.$rootScope.breakpoint === 'screen-sm';
  }

  public screenXSmall(): boolean {
    return this.$rootScope.breakpoint === 'screen-xs';
  }

  // Slider Controls
  public translateSlider: Function;
  public startDate: boolean = false;
  public endDate: boolean = false;
  public optionPicker: boolean = false;
  public readonly dateArray: any[] = this.CommonReportService.getReturnLineGraph(this.ReportConstants.THREE_MONTH_FILTER, { date: '' });
  public ceil: number = this.ReportConstants.YEAR;
  public floor: number = 0;
  private _min: number = this.ReportConstants.TWENTY_FOUR_WEEKS;
  private _max: number = this.ReportConstants.YEAR;

  public isCustom(): boolean {
    return this.selected.value === this.ReportConstants.CUSTOM_FILTER.value;
  }

  public toggleMinDate(): void {
    this.startDate = !this.startDate;
  }

  public toggleMaxDate(): void {
    this.endDate = !this.endDate;
  }

  public toggleOptionPicker(): void {
    this.optionPicker = !this.optionPicker;
  }

  public setMin(index: number): void {
    this._min = index;
    this.sliderUpdate();
    this.startDate = !this.startDate;
  }

  public setMax(index: number): void {
    this._max = index;
    this.sliderUpdate();
    this.endDate = !this.endDate;
  }

  // getter/setter for _selected, _min, and _max
  public get min(): number {
    return this._min;
  }

  public set min(min: number) {
    this._min = min;
    this.sliderUpdate();
  }

  public get max(): number {
    return this._max;
  }

  public set max(max: number) {
    this._max = max;
    this.sliderUpdate();
  }

  public updateSmallScreen(option: ITimespan): void {
    this.selected = option;
    this.update();
    this.optionPicker = !this.optionPicker;
  }

  public update(): void {
    if (this.selected.value === this.ReportConstants.CUSTOM_FILTER.value) {
      this.sliderUpdate();
    } else if (this.updateFunctions) {
      this.updateFunctions.update();
    }
  }

  private sliderUpdate(): void {
    if (this.updateFunctions && this.updateFunctions.sliderUpdate) {
      this.updateFunctions.sliderUpdate(this._min, this._max);
    }
  }
}

export class ReportSliderComponent implements ng.IComponentOptions {
  public template = require('modules/core/partnerReports/reportSlider/reportSlider.tpl.html');
  public controller = ReportSliderCtrl;
  public bindings = {
    selected: '=',
    options: '<',
    updateFunctions: '<',
  };
}
