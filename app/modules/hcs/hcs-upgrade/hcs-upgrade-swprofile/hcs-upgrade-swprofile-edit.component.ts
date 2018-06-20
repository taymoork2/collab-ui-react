import { ISoftwareProfile } from 'modules/hcs/hcs-shared';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

export class HcsUpgradeSwprofileEditCtrl implements ng.IComponentController {

  public back: boolean = true;
  public backState: string = 'hcs.swprofilelist';
  public swprofile: ISoftwareProfile;
  public saveSwprofile: ISoftwareProfile;
  public selectedProfile: ISoftwareProfile;
  public form: ng.IFormController;
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    if (this.form) {
      this.form.$setPristine();
    }
  }

  public saveSoftwareProfile(): void {
    this.form.$setPristine();
    this.HcsUpgradeService.updateSoftwareProfile(this.selectedProfile)
      .then(() => {
        this.Notification.success('hcs.softwareProfiles.successupdate');
        this.$state.go('hcs.swprofile-edit', { swprofile: this.selectedProfile }, { reload: true });
      })
      .catch(e => {
        this.Notification.error(e.message, 'hcs.softwareProfiles.errorupdate');
      });

  }

  public setSoftwareProfile(swprofile: ISoftwareProfile): void {
    this.selectedProfile = swprofile;
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
