import { ExternalTransferService } from './externaltransfer.service';
import { ISite, HuronSiteService } from 'modules/huron/sites';
import { Notification } from 'modules/core/notifications';

interface ITransferOptions {
  label: string;
  value: boolean | null;
}

class ExternalTransferCtrl implements ng.IComponentController {

  private on: string;
  private off: string;
  public options: ITransferOptions[];
  public memberType: string;
  public memberId: string;
  public selected: ITransferOptions;
  public form: ng.IFormController;
  public saveInProcess: boolean = false;
  public loading: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ExternalTransferService: ExternalTransferService,
    private HuronSiteService: HuronSiteService,
    private Authinfo,
    private Notification: Notification,

  ) { }

  public $onInit(): void {
    this.on = this.$translate.instant('common.on');
    this.off = this.$translate.instant('common.off');
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;

    this.getOrgSetting()
      .then(orgExtTransfer => {
        this.options = this.populateDropdownSettings(this.getSetting(orgExtTransfer.allowExternalTransfer));
      }).then(() => {
        return this.ExternalTransferService.getDefaultSetting(this.memberId, this.memberType)
          .then(userExtTransfer => {
            this.selected = _.find(this.options, { value: userExtTransfer });
          });
      }).finally(() => this.loading = false);
  }

  public reset() {
    this.loadSettings();
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public save(): void {
    this.ExternalTransferService.updateSettings(this.memberId, this.memberType, this.selected.value).then(() => {
      this.saveInProcess = false;
      this.reset();
      this.Notification.success('serviceSetupModal.externalTransfer.success');
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'serviceSetupModal.externalTransfer.error');
    });
  }

  private populateDropdownSettings(state: string): ITransferOptions[] {
    const option: ITransferOptions[] = [];
    option.push({
      label: this.$translate.instant('serviceSetupModal.externalTransfer.orgSetting', {
        state: state,
      }),
      value: null,
    }, {
      label: this.$translate.instant('serviceSetupModal.externalTransfer.alwaysAllow'),
      value: true,
    }, {
      label: this.$translate.instant('serviceSetupModal.externalTransfer.neverAllow'),
      value: false,
    });
    return option;
  }

  private getSetting(orgExtTransfer: boolean) {
    if (orgExtTransfer) {
      return this.on;
    } else {
      return this.off;
    }
  }

  public getOrgSetting(): ng.IPromise<ISite> {
    return this.HuronSiteService.getSite(this.Authinfo.getOrgId());
  }
}

export class ExternalTransferComponent implements ng.IComponentOptions {
  public controller = ExternalTransferCtrl;
  public template = require('modules/huron/externaltransfer/externaltransfer.html');
  public bindings = {
    memberType: '@',
    memberId: '<',
  };
}
