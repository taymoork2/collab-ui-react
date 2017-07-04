class SelectCalendarServiceController implements ng.IComponentController {
  public selected: any;
  public nameChangeEnabled: boolean;

  /* @ngInject */
  constructor(
    private $modalInstance,
    private FeatureToggleService,
  ) {
    this.FeatureToggleService.atlas2017NameChangeGetStatus().then((toggle: boolean): void => {
      this.nameChangeEnabled = toggle;
    });
  }

  public proceed(): void {
    this.$modalInstance.close(this.selected);
  }
}

export default angular
  .module('Hercules')
  .controller('SelectCalendarServiceController', SelectCalendarServiceController)
  .name;
