import { SettingSetupInitService } from 'modules/huron/settings/init/settingSetupInitService';

class SettingSetupInitCtrl {
  public selected: number;

  /* @ngInject */
  constructor(private SettingSetupInitService: SettingSetupInitService,
              private $scope: ng.IScope,
  ) {

  }

  public $onInit() {
    this.selected = this.SettingSetupInitService.getSelected();
    this.$scope.$watch(() => {
      return this.SettingSetupInitService.getSelected();
    }, value => {
      this.$scope.$emit('wizardNextButtonDisable', !value);
    });
  }
  public select(index: number): void {
    this.selected = index;
    this.SettingSetupInitService.setSelected(index);
  }
}

export class SettingSetupInitComponent implements ng.IComponentOptions {
  public controller = SettingSetupInitCtrl;
  public templateUrl = 'modules/huron/settings/init/settingSetupInit.html';
  public bindings = {
    ftsw: '<',
  };
}
