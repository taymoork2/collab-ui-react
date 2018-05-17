import { ProPackSettingSection } from '../proPackSettingSection';

export class ExternalCommunicationSettingController {

  private _isBlockExternalCommunication: boolean = false;
  public isBlockExternalCommunicationSettingLoaded: boolean = false;
  public isProPackPurchased: boolean = false;

  private orgId: string;

  /* @ngInject */
  constructor(
    private $q,
    private AccountOrgService,
    private Authinfo,
    private ProPackService,
    private Notification,
  ) {
  }

  public $onInit() {
    this.orgId = this.Authinfo.getOrgId();
    this.loadSetting();
  }

  private loadSetting() {
    const promises = {
      blockExternalCommunication: this.AccountOrgService.getBlockExternalCommunication(this.orgId),
      proPackPurchased: this.ProPackService.hasProPackPurchasedOrNotEnabled(),
    };

    this.$q.all(promises)
      .then((response) => {
        this.blockExternalCommunicationSettingLoaded(response.blockExternalCommunication);
        this.isProPackPurchased = response.proPackPurchased;
      })
      .catch(_.noop);
  }

  private blockExternalCommunicationSettingLoaded(blockExternalCommunication: boolean) {
    this._isBlockExternalCommunication = blockExternalCommunication;
    this.isBlockExternalCommunicationSettingLoaded = true;
  }

  public get isBlockExternalCommunication(): boolean {
    return this._isBlockExternalCommunication;
  }

  public set isBlockExternalCommunication(value: boolean) {
    this._isBlockExternalCommunication = value;
    this.updateBlockExternalCommunicationSetting();
  }

  public updateBlockExternalCommunicationSetting() {
    if (this._isBlockExternalCommunication !== undefined) {
      this.AccountOrgService.setBlockExternalCommunication(this.orgId, this._isBlockExternalCommunication)
        .then(() => {
          this.Notification.success('firstTimeWizard.messengerExternalCommunicationSuccess');
        })
        .catch((response) => {
          this.Notification.errorWithTrackingId(response, 'firstTimeWizard.messengerExternalCommunicationError');
        });
    }
  }
}

export class ExternalCommunicationSetting extends ProPackSettingSection {

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('externalCommunication', proPackPurchased);
  }
}

export class ExternalCommunicationSettingComponent implements ng.IComponentOptions {
  public controller = ExternalCommunicationSettingController;
  public template = require('./externalCommunicationSetting.tpl.html');
}
