class SelectCalendarServiceController implements ng.IComponentController {
  public selected: any;

  /* @ngInject */
  constructor(
    private $modalInstance,
  ) {}

  public proceed(): void {
    this.$modalInstance.close(this.selected);
  }
}

export default angular
  .module('Hercules')
  .controller('SelectCalendarServiceController', SelectCalendarServiceController)
  .name;
