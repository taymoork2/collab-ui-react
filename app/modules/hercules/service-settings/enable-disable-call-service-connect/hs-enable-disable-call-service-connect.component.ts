import { Notification } from 'modules/core/notifications/notification.service';

class HsEnableDisableCallServiceConnectComponentCtrl implements ng.IComponentController {

  public serviceIsEnabled;
  private onCallServiceConnectEnabled: Function;
  private onCallServiceConnectDisabled: Function;

  private saving = false;

  /* @ngInject */
  constructor(
    private $modal,
    private Notification: Notification,
    private ServiceDescriptor,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {

    const { serviceIsEnabled } = changes;
    if (serviceIsEnabled && serviceIsEnabled.currentValue) {
      this.serviceIsEnabled = serviceIsEnabled.currentValue;
    }
  }

  public flipStatus(): void {
    if (this.serviceIsEnabled) {
      this.confirmDisable();
    } else {
      this.confirmEnable();
    }
  }

  private confirmEnable(): void {
    this.saving = true;
    this.ServiceDescriptor.enableService('squared-fusion-ec')
      .then(() => {
        this.Notification.success('hercules.notifications.connect.connectEnabled');
        this.onCallServiceConnectEnabled();
      })
      .catch((response) => {
        this.Notification.errorWithTrackingId(response, 'hercules.errors.failedToEnableConnect');
      })
      .finally(() => {
        this.saving = false;
      });
  }

  private confirmDisable(): void {
    this.saving = true;

    this.$modal.open({
      templateUrl: 'modules/hercules/service-settings/enable-disable-call-service-connect/confirm-disable-csc-dialog.html',
      type: 'dialog',
    })
      .result
      .then(() => {
        this.ServiceDescriptor.disableService('squared-fusion-ec')
          .then(() => {
            this.Notification.success('hercules.notifications.connect.connectDisabled');
            this.onCallServiceConnectDisabled();
          })
          .catch((response) => {
            this.Notification.errorWithTrackingId(response, 'hercules.error.failedToDisableConnect');
          });
      })
      .finally(() => {
        this.saving = false;
      });

  }

}

export class HsEnableDisableCallServiceConnectComponent implements ng.IComponentOptions {
  public controller = HsEnableDisableCallServiceConnectComponentCtrl;
  public templateUrl = 'modules/hercules/service-settings/enable-disable-call-service-connect/hs-enable-disable-call-service-connect.html';
  public bindings = {
    serviceIsEnabled: '<',
    onCallServiceConnectEnabled: '&',
    onCallServiceConnectDisabled: '&',
  };
}
