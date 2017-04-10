import reportSlider from './index';

describe('Component: reportSlider', () => {
  beforeEach(function () {
    this.initModules(reportSlider);
    this.injectDependencies('$componentController', '$rootScope', '$scope', 'CommonReportService', 'ReportConstants');

    this.ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');

    this.options = _.cloneDeep(this.defaults.altTimeFilter);
    this.updateFunctions = {
      sliderUpdate: jasmine.createSpy('sliderUpdate'),
      update: jasmine.createSpy('update'),
    };

    this.$rootScope.breakpoint = this.ctrlData.SCREEN_LG;

    this.controller = this.$componentController('reportSlider', {
      $scope: this.$scope,
      $rootScope: this.$rootScope,
    }, {
      selected: this.options[0],
      options: this.options,
      updateFunctions: this.updateFunctions,
    });
  });

  it('should start with expected defaults', function () {
    expect(this.controller.translateSlider).toEqual(jasmine.any(Function));
    expect(this.controller.startDate).toBeFalsy();
    expect(this.controller.endDate).toBeFalsy();
    expect(this.controller.optionPicker).toBeFalsy();
    expect(this.controller.dateArray).toEqual(this.CommonReportService.getReturnLineGraph(this.ReportConstants.THREE_MONTH_FILTER, { date: '' }));
    expect(this.controller.ceil).toEqual(this.ReportConstants.YEAR);
    expect(this.controller.floor).toEqual(0);
    expect(this.controller.min).toEqual(this.ReportConstants.TWENTY_FOUR_WEEKS);
    expect(this.controller.max).toEqual(this.ReportConstants.YEAR);
  });

  it('screenSmall - should only return true for small and extra small screens', function () {
    expect(this.controller.screenSmall()).toBeFalsy();
    this.$rootScope.breakpoint = this.ctrlData.SCREEN_MD;
    expect(this.controller.screenSmall()).toBeFalsy();
    this.$rootScope.breakpoint = this.ctrlData.SCREEN_SM;
    expect(this.controller.screenSmall()).toBeTruthy();
    this.$rootScope.breakpoint = this.ctrlData.SCREEN_XS;
    expect(this.controller.screenSmall()).toBeTruthy();
  });

  it('screenXSmall - should only return true for extra small screens', function () {
    expect(this.controller.screenXSmall()).toBeFalsy();
    this.$rootScope.breakpoint = this.ctrlData.SCREEN_MD;
    expect(this.controller.screenXSmall()).toBeFalsy();
    this.$rootScope.breakpoint = this.ctrlData.SCREEN_SM;
    expect(this.controller.screenXSmall()).toBeFalsy();
    this.$rootScope.breakpoint = this.ctrlData.SCREEN_XS;
    expect(this.controller.screenXSmall()).toBeTruthy();
  });

  it('toggleMinDate - should toggle the startDate menu', function () {
    this.controller.toggleMinDate();
    expect(this.controller.startDate).toBeTruthy();
  });

  it('toggleMaxDate - should toggle the endDate menu', function () {
    this.controller.toggleMaxDate();
    expect(this.controller.endDate).toBeTruthy();
  });

  it('toggleOptionPicker - should toggle the optionPicker menu', function () {
    this.controller.toggleOptionPicker();
    expect(this.controller.optionPicker).toBeTruthy();
  });

  it('setMin - should set min and toggle startDate', function () {
    this.controller.setMin(5);
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalled();
    expect(this.controller.startDate).toBeTruthy();
    expect(this.controller.min).toEqual(5);
  });

  it('min - changing the min value should also call the slider updated', function () {
    this.controller.min = 6;
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalled();
  });

  it('setMax - should set min and toggle endDate', function () {
    this.controller.setMax(40);
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalled();
    expect(this.controller.endDate).toBeTruthy();
    expect(this.controller.max).toEqual(40);
  });

  it('max - changing the max value should also call the slider updated', function () {
    this.controller.max = 45;
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalled();
  });

  it('updateSmallScreen - should update the selected option on small screens and toggle optionPicker', function () {
    this.controller.updateSmallScreen(this.options[1]);
    expect(this.controller.selected).toEqual(this.options[1]);
    expect(this.updateFunctions.update).toHaveBeenCalled();
    expect(this.controller.optionPicker).toBeTruthy();
  });

  it('update - should only call the slider update if the custom filter is set', function () {
    this.controller.update();
    expect(this.updateFunctions.update).toHaveBeenCalledTimes(1);
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalledTimes(0);

    this.controller.selected = this.options[this.options.length - 1];
    this.controller.update();
    expect(this.updateFunctions.update).toHaveBeenCalledTimes(1);
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalledTimes(1);
  });

  it('sliderUpdate - should call the external sliderUpdate', function () {
    this.controller.sliderUpdate();
    expect(this.updateFunctions.sliderUpdate).toHaveBeenCalled();
  });

  describe('isCustom - ', function () {
    it('should return false when custom option is not selected', function() {
      expect(this.controller.isCustom()).toBeFalsy();
    });

    it('should return true when custom option is selected', function() {
      this.controller.selected = this.options[this.options.length - 1];
      expect(this.controller.isCustom()).toBeTruthy();
    });
  });
});
