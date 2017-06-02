import './deviceSettings.scss';

class DeviceSettings implements ng.IComponentController {
  public ownerType: string;
  public ownerId: string;
  public deviceList: any;

  private upgradeChannelOptions;
  private shouldShowUpgradeChannel;
  private selectedUpgradeChannel;
  private updatingUpgradeChannel;
  private unsupportedDeviceTypeForUpgradeChannel: string;

  private shouldShowGuiSettings;
  private guiSettingsEnabled;
  private updatingGuiSettings;
  private unsupportedDeviceTypeForGuiSettings: string;

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
      .then(() => {
        this.Notification.success('deviceOverviewPage.channelUpdated');
      })
      .catch(error => {
        this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
        this.resetSelectedUpgradeChannel();
      })
      .finally(() => {
        this.updatingUpgradeChannel = false;
      });
  }

  public onSaveGuiSettings() {
    this.updatingGuiSettings = true;
    this.CsdmConfigurationService.updateRuleForPlace(this.ownerId, 'gui_settings', this.guiSettingsEnabled)
      .then(() => {
        this.Notification.success('deviceSettings.guiSettingsUpdated');
      })
      .catch(error => {
        this.Notification.errorResponse(error, 'deviceOverviewPage.failedToSaveChanges');
        this.resetGuiSettingsEnabled();
      })
      .finally(() => {
        this.updatingGuiSettings = false;
      });
  }

  private fetchAsyncSettings(): void {
    this.FeatureToggleService.csdmPlaceUpgradeChannelGetStatus().then(placeUpgradeChannel => {
      if (placeUpgradeChannel) {
        let firstUnsupportedDevice = _.find(this.deviceList || [], (d: any) => d.productFamily !== 'Cloudberry');
        if (firstUnsupportedDevice) {
          this.unsupportedDeviceTypeForUpgradeChannel = firstUnsupportedDevice.product;
        }
        this.CsdmUpgradeChannelService.getUpgradeChannelsPromise().then(channels => {
          this.shouldShowUpgradeChannel = channels.length > 1;
          if (this.shouldShowUpgradeChannel) {
            this.upgradeChannelOptions = _.map(channels, (channel: string) => {
              return this.getUpgradeChannelObject(channel);
            });
            this.resetSelectedUpgradeChannel();
          }
        });
      }
    });

    this.FeatureToggleService.csdmPlaceGuiSettingsGetStatus().then(placeGuiSettings => {
      if (placeGuiSettings) {
        let firstUnsupportedDevice = _.find(this.deviceList || [], (d: any) => d.productFamily !== 'Cloudberry');
        if (firstUnsupportedDevice) {
          this.unsupportedDeviceTypeForGuiSettings = firstUnsupportedDevice.product;
        }
        this.shouldShowGuiSettings = true;
        this.resetGuiSettingsEnabled();
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

  private resetGuiSettingsEnabled() {
    this.CsdmConfigurationService.getRuleForPlace(this.ownerId, 'gui_settings').then(rule => {
      this.guiSettingsEnabled = rule.value;
    }).catch(() => {
      this.guiSettingsEnabled = true;
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
