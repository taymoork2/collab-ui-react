import { SettingSetupInitService } from 'modules/call/settings/settings-setup-init/settings-setup-init.service';

class SettingSetupInitCtrl {
  public selected: number;

  /* @ngInject */
  constructor(
    private SettingSetupInitService: SettingSetupInitService,
    private $scope: ng.IScope,
  ) {}

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
  public template = require('modules/call/settings/settings-setup-init/settings-setup-init.component.html');
  public bindings = {
    ftsw: '<',
  };
}
