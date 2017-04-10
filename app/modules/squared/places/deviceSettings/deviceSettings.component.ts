import './deviceSettings.scss';

class DeviceSettings implements ng.IComponentController {
  public ownerType: string;
  public supportsSettings: boolean;
  public ownerId: string;
  public deviceList: any;
  public showDeviceSettings = false;
  private upgradeChannelOptions;
  private shouldShowUpgradeChannel;
  private selectedUpgradeChannel;
  private updatingUpgradeChannel = false;
  private unsupportedDeviceType: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
    private CsdmUpgradeChannelService,
    private CsdmConfigurationService,
    private Notification,
  ) {}

  public $onInit(): void {
    this.fetchAsyncSettings();
  }

  public onSaveUpgradeChannel() {
    this.updatingUpgradeChannel = true;
    this.CsdmConfigurationService.updateRuleForPlace(this.ownerId, 'software_channel', this.selectedUpgradeChannel.value)
      .catch(error => {
        this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
        this.resetSelectedUpgradeChannel();
      })
      .finally(() => {
        this.updatingUpgradeChannel = false;
      });
  }

  private fetchAsyncSettings(): void {
    this.FeatureToggleService.cloudberryLyraConfigGetStatus().then(lyraConfig => {
      if (lyraConfig) {
        let firstUnsupportedDevice = _.find(this.deviceList || [], (d: any) => d.product); // TODO: Replace with sw version check once implemented
        if (firstUnsupportedDevice) {
          this.unsupportedDeviceType = firstUnsupportedDevice.product;
        }
        this.CsdmUpgradeChannelService.getUpgradeChannelsPromise().then(channels => {
          this.shouldShowUpgradeChannel = channels.length > 1;
          this.upgradeChannelOptions = _.map(channels, (channel: string) => {
            return this.getUpgradeChannelObject(channel);
          });
          this.showDeviceSettings = this.shouldShowUpgradeChannel;
          if (this.showDeviceSettings) {
            this.resetSelectedUpgradeChannel();
          }
        });
      }
    });
  }

  private resetSelectedUpgradeChannel() {
    this.CsdmConfigurationService.getRuleForPlace(this.ownerId, 'software_channel').then(rule => {
      this.selectedUpgradeChannel = this.getUpgradeChannelObject(rule.value);
    }).catch(() => {
      this.selectedUpgradeChannel = {
        label: 'Nothing Selected',
      };
    });
  }

  private getUpgradeChannelObject(channel) {
    let labelKey = 'CsdmStatus.upgradeChannels.' + channel;
    let label = this.$translate.instant('CsdmStatus.upgradeChannels.' + channel);
    if (label === labelKey) {
      label = channel;
    }
    return {
      label: label,
      value: channel,
    };
  }
}

export class DeviceSettingsComponent implements ng.IComponentOptions {
  public controller = DeviceSettings;
  public templateUrl = 'modules/squared/places/deviceSettings/deviceSettings.html';
  public bindings = <{ [binding: string]: string }>{
    ownerType: '@',
    ownerId: '<',
    deviceList: '<',
  };
}
