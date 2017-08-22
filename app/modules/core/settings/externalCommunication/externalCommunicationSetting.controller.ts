
interface IGetBlockExternalCommunicationResponse {
  blockExternalCommunications: boolean;
}

export class ExternalCommunicationSettingController {

  private _isBlockExternalCommunication: boolean;
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
      });
  }

  private blockExternalCommunicationSettingLoaded(response: ng.IHttpPromiseCallbackArg<IGetBlockExternalCommunicationResponse>) {
    if (_.has(response, 'data.blockExternalCommunications')) {
      this._isBlockExternalCommunication = _.get<boolean>(response, 'data.blockExternalCommunications');
      this.isBlockExternalCommunicationSettingLoaded = true;
    }
  }

  get isBlockExternalCommunication(): boolean {
    return this._isBlockExternalCommunication;
  }

  set isBlockExternalCommunication(value: boolean) {
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
