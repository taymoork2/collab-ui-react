import { ISoftwareProfile } from 'modules/hcs/setup/hcs-setup';

export class HcsSetupSoftwareProfileController implements ng.IComponentController {
  public readonly MAX_LENGTH: number = 50;
  public profileSelected: ISoftwareProfile;
  public onChangeFn: Function;
  public placeholder: string[] = [];
  public hcsProfileForm: ng.IFormController;
  public errors: Object;
  public versions = {
    cucm: [ '11.0', '10.5', '10.0'],
    ucxn: ['10.0', '9.0'],
    plm: ['10.0', '9.0'],
    cer: ['10.0'],
    expway: ['9.5'],
  };

  /* @ngInject */
  constructor(
    public $translate: ng.translate.ITranslateService,
  ) {
  }

  public $onInit() {
    this.placeholder = [ this.$translate.instant('hcs.softwareProfiles.cucmPlace'), this.$translate.instant('hcs.softwareProfiles.ucxnPlace'), this.$translate.instant('hcs.softwareProfiles.plmPlace'), this.$translate.instant('hcs.softwareProfiles.cerPlace'), this.$translate.instant('hcs.softwareProfiles.expwayPlace')];
    this.errors = {
      required: this.$translate.instant('common.invalidRequired'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    };
  }

  public processChange() {
    this.onChangeFn({
      profile: this.profileSelected,
    });
  }
}

export class HcsSetupSoftwareProfileComponent implements ng.IComponentOptions {
  public controller = HcsSetupSoftwareProfileController;
  public template = require('modules/hcs/setup/hcs-setup-software-profile/hcs-setup-software-profile.component.html');
  public bindings = {
    onChangeFn: '&',
  };
}
