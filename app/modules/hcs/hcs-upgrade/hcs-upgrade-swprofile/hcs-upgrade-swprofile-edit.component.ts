import { ISoftwareProfile } from 'modules/hcs/hcs-shared';

export class HcsUpgradeSwprofileEditCtrl implements ng.IComponentController {

  public back: boolean = true;
  public backState: string = 'hcs.sftplist';
  public swprofile: ISoftwareProfile;
  public form: ng.IFormController;
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public $onInit() {
    if (this.form) {
      this.form.$setPristine();
    }
  }

  public saveSwProfile(): void {

  }

  public setSwProfile(): void {

  }

  public cancel(): void {
    this.$state.go('hcs.swprofilelist');
  }
}

export class HcsUpgradeSwprofileEditComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeSwprofileEditCtrl;
  public template = require('./hcs-upgrade-swprofile-edit.component.html');
  public bindings = {
    swprofile: '<',
  };
}
