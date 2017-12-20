import { Notification } from 'modules/core/notifications/notification.service';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

class HsEnableDisableCallServiceConnectComponentCtrl implements ng.IComponentController {

  public serviceIsEnabled;
  public saving = false;
  private onCallServiceConnectEnabled: Function;
  private onCallServiceConnectDisabled: Function;

  /* @ngInject */
  constructor(
    private $modal,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {

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
    this.ServiceDescriptorService.enableService('squared-fusion-ec')
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
      template: require('modules/hercules/service-settings/enable-disable-call-service-connect/confirm-disable-csc-dialog.html'),
      type: 'dialog',
    })
      .result
      .then(() => {
        this.ServiceDescriptorService.disableService('squared-fusion-ec')
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

  public openPrerequisites(): void {
    this.$modal.open({
      controller: 'HybridCallPrerequisitesController',
      controllerAs: 'vm',
      template: require('modules/services-overview/new-hybrid/prerequisites-modals/hybrid-call-prerequisites-modal/hybrid-call-prerequisites.html'),
      resolve: {
        callServiceConnectOnly: () => true,
      },
    });
  }

}

export class HsEnableDisableCallServiceConnectComponent implements ng.IComponentOptions {
  public controller = HsEnableDisableCallServiceConnectComponentCtrl;
  public template = require('modules/hercules/service-settings/enable-disable-call-service-connect/hs-enable-disable-call-service-connect.html');
  public bindings = {
    serviceIsEnabled: '<',
    onCallServiceConnectEnabled: '&',
    onCallServiceConnectDisabled: '&',
  };
}
