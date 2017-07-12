import { ExternalTransferService } from './externaltransfer.service';
import { ISite, HuronSiteService } from 'modules/huron/sites';
import { Notification } from 'modules/core/notifications';

class ExternalTransferCtrl implements ng.IComponentController {

  private alwaysAllow: string;
  private neverAllow: string;
  private orgSetting: string;
  private on: string;
  private off: string;
  private default: string;
  public options: string[];
  public memberType: string;
  public memberId: string;
  public selected: string;
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
    private $q: ng.IQService,
  ) { }

  public $onInit(): void {
    this.on = this.$translate.instant('common.on');
    this.off = this.$translate.instant('common.off');
    this.default = this.$translate.instant('common.default');
    this.alwaysAllow = this.$translate.instant('serviceSetupModal.externalTransfer.alwaysAllow');
    this.neverAllow = this.$translate.instant('serviceSetupModal.externalTransfer.neverAllow');
    this.loadSettings();
  }

  private loadSettings(): void {
    this.loading = true;
    this.options = [];
    this.$q.all({
      orgSetting: this.getOrgSetting(),
      defaultSetting: this.ExternalTransferService.getDefaultSetting(this.memberId, this.memberType),
    }).then(
      response => {
        const orgExtTransfer = _.get(response, 'orgSetting')['allowExternalTransfer'];
        this.orgSetting = this.$translate.instant('serviceSetupModal.externalTransfer.orgSetting', {
          state: this.getSetting(orgExtTransfer),
        });
        const userExtTransfer: string = <string>_.get(response, 'defaultSetting');
        switch (userExtTransfer) {
          case this.default:
            this.selected = this.orgSetting;
            break;
          case this.on:
            this.selected = this.alwaysAllow;
            break;
          case this.off:
            this.selected = this.neverAllow;
            break;
        }
        this.options.push(this.orgSetting, this.alwaysAllow, this.neverAllow);
        this.loading = false;
      });
  }

  public reset() {
    this.loadSettings();
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public save(): void {
    let allowExternalTransfer: string = '';
    switch (this.selected) {
      case this.alwaysAllow:
        allowExternalTransfer = this.on;
        break;
      case this.neverAllow:
        allowExternalTransfer = this.off;
        break;
      default:
        allowExternalTransfer = this.default;
        break;
    }
    this.ExternalTransferService.updateSettings(this.memberId, this.memberType, allowExternalTransfer).then(() => {
      this.saveInProcess = false;
      this.reset();
      this.Notification.success('serviceSetupModal.externalTransfer.success');
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'serviceSetupModal.externalTransfer.error');
    });
  }

  private getSetting(orgExtTransfer: string) {
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
  public templateUrl = 'modules/huron/externaltransfer/externaltransfer.html';
  public bindings = {
    memberType: '@',
    memberId: '<',
  };
}
