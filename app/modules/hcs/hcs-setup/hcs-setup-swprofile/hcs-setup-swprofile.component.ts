import { ISoftwareProfile, IApplicationVersion } from 'modules/hcs/hcs-shared/hcs-swprofile';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';

export class HcsSetupSwprofileController implements ng.IComponentController {
  public readonly MAX_LENGTH: number = 50;
  public profileSelected: ISoftwareProfile;
  public onChangeFn: Function;
  public placeholder: any;
  public hcsProfileForm: ng.IFormController;
  public errors: Object;
  public swprofile: ISoftwareProfile;
  public allVersions: IApplicationVersion[];
  public versions = {
    cucm: [ 'UCSInstall_UCOS_11.5.1.15074-1.sgn.iso', 'UCSInstall_UCOS_10.5.1.15074-1.sgn.iso',  'UCSInstall_UCOS_10.6.1.15074-1.sgn.iso'],
    imp: [ 'UCSInstall_CUP_12.0.1.11900-4.sgn.iso', 'UCSInstall_CUP_10.0.1.11900-4.sgn.iso', 'UCSInstall_CUP_10.5.1.11900-4.sgn.iso'],
    ucxn: ['UCSInstall_CUC_12.0.1.21900-10.sgn.iso', 'UCSInstall_CUC_11.0.1.21900-10.sgn.iso'],
    plm: ['	CiscoPrimeLM_64bitLnx_11.5.1.12900-4.sgn.iso', 'CiscoPrimeLM_64bitLnx_11.0.1.12900-4.sgn.iso'],
    cer: ['10.0'],
    expway: ['9.5'],
  };

  /* @ngInject */
  constructor(
    public $translate: ng.translate.ITranslateService,
    private HcsUpgradeService: HcsUpgradeService,
  ) {
  }

  public $onInit() {
    this.placeholder = {
      cucm: this.$translate.instant('hcs.softwareProfiles.cucmPlace'),
      imp: this.$translate.instant('hcs.softwareProfiles.impPlace'),
      ucxn: this.$translate.instant('hcs.softwareProfiles.ucxnPlace'),
      plm: this.$translate.instant('hcs.softwareProfiles.plmPlace'),
      cer: this.$translate.instant('hcs.softwareProfiles.cerPlace'),
      expway: this.$translate.instant('hcs.softwareProfiles.expwayPlace')};
    this.errors = {
      required: this.$translate.instant('common.invalidRequired'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_LENGTH,
      }),
    };

    this.listAppVersions();
  }

  public listAppVersions(): void {
    this.HcsUpgradeService.listAppVersions().then(resp => {
      this.allVersions = _.get(resp, 'applicationVersions');
    });
  }

  public processChange() {
    this.onChangeFn({
      profile: this.profileSelected,
    });
  }
}

export class HcsSetupSwprofileComponent implements ng.IComponentOptions {
  public controller = HcsSetupSwprofileController;
  public template = require('modules/hcs/hcs-setup/hcs-setup-swprofile/hcs-setup-swprofile.component.html');
  public bindings = {
    swprofile: '<',
    onChangeFn: '&',
  };
}
