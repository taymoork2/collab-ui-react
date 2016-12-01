import { CommonReportService } from '../commonReportServices/commonReport.service';
import { ReportConstants } from '../commonReportServices/reportConstants.service';
import {
  ITimespan,
  ITimeSliderFunctions,
} from '../partnerReportInterfaces';

class ReportSliderCtrl {
  public options: Array<ITimespan>;
  public updateFunctions: ITimeSliderFunctions;
  public selected: ITimespan;

  /* @ngInject */
  constructor(
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {
    let vm = this;
    this.translateSlider = (index: number): string => {
      return vm.dateArray[index].date;
    };
  }

  // Slider Controls
  public translateSlider: Function;
  public slider: boolean = false;
  public readonly dateArray: Array<any> = this.CommonReportService.getReturnLineGraph(this.ReportConstants.THREE_MONTH_FILTER, { date: '' });
  public ceil: number = this.ReportConstants.YEAR;
  public floor: number = 1;
  private _min: number = this.ReportConstants.TWELVE_WEEKS;
  private _max: number = this.ReportConstants.YEAR;

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

  public update(): void {
    if (this.selected.value === this.ReportConstants.CUSTOM_FILTER.value) {
      this.slider = true;
      this.sliderUpdate();
    } else if (this.updateFunctions) {
      this.slider = false;
      this.updateFunctions.update();
    }
  }

  private sliderUpdate(): void {
    if (this.updateFunctions && this.updateFunctions.sliderUpdate) {
      this.updateFunctions.sliderUpdate(this._min, this._max);
    }
  }
}

angular.module('Core')
  .component('reportSlider', {
    templateUrl: 'modules/core/partnerReports/reportSlider/reportSlider.tpl.html',
    controller: ReportSliderCtrl,
    bindings: {
      selected: '=',
      options: '<',
      updateFunctions: '<',
    },
});
