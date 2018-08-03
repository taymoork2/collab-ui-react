import { Notification } from 'modules/core/notifications';
import { FtswConfigService, RialtoService, RialtoSite } from 'modules/call/bsft/shared';

class BsftSettingsModalCtrl implements ng.IComponentController {
  public dismiss;
  public step = 0;
  public formInvalid;
  public editing: boolean;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private FtswConfigService: FtswConfigService,
    private RialtoService: RialtoService,
    private Authinfo,
  ) {}

  public setModalInvalid(invalid) {
    this.formInvalid = invalid;
  }

  public onNext() {
    switch (this.step) {
      case 0:
        this.$scope.$broadcast('bsftSettingsNext');
        this.step++;
        break;
      case 1:
        this.$scope.$broadcast('bsftLicenseAllocationNext');
        this.step++;
        break;
      case 2:
        this.$scope.$broadcast('bsftNumbersNext');
        this.step++;
        break;
      case 3:
        this.$scope.$broadcast('bsftNumbersNext');
        this.save();
        break;
      default:
        break;
    }

  }

  public onBack() {
    this.step--;
  }

  public save() {
    const newSite = this.FtswConfigService.getCurentSite();
    if (newSite !== undefined) {
      this.RialtoService.getCustomer(this.Authinfo.getOrgId())
        .then(response => this.RialtoService.saveSite(response.rialtoId, new RialtoSite(newSite)))
        .then(() => {
          this.dismiss();
          this.Notification.success('Site created');
        });
    }
  }

  public getNextText() {
    switch (this.step) {
      case 0:
        return this.$translate.instant('broadCloud.wizardButton.nextAssignLicenses');
      case 1:
        return this.$translate.instant('broadCloud.wizardButton.nextAddNumbers');
      case 2:
        return this.$translate.instant('broadCloud.wizardButton.nextAssignNumbers');
      case 3:
        return this.$translate.instant('broadCloud.wizardButton.saveLocation');
      default:
        break;
    }
  }

}

export class BsftSettingsModalComponent implements ng.IComponentOptions {
  public controller = BsftSettingsModalCtrl;
  public template = require('modules/call/bsft/modal/bsft-settings-modal.component.html');
  public bindings = {
    dismiss: '&',
    editing: '<',
  };
}
