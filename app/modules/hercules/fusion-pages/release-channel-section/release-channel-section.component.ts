import { Notification } from 'modules/core/notifications';

interface ISelectOption {
  label: string;
  value: string;
}

class ReleaseChannelSectionController implements ng.IComponentController {
  public static restrictedChannels: string[] = ['beta', 'latest'];

  public releaseChannelSelected: ISelectOption;
  public releaseChannelOptions: Array<ISelectOption> = [{
    label: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
    value: 'stable',
  }];

  public releaseChannelTexts: any = {
    title: 'hercules.releaseChannelSection.releaseChannelHeader',
  };
  public localizedCurrentChannelName: string;
  public localizedStableChannelName: string = this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable');

  public showResetSection: boolean = false;
  public type: undefined | 'cluster' | 'resource-group' = undefined;
  private data: any = {};

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
    private Notification: Notification,
    private ResourceGroupService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let { cluster, resourceGroup } = changes;
    // Best effort to warn the developer that one should not used both cluster and resource-group attributes
    if (cluster && cluster.currentValue && resourceGroup && resourceGroup.currentValue) {
      this.$log.error('You cannot use the cluster and group attributes at the same time');
      return;
    }
    if (cluster && cluster.currentValue) {
      this.processCluster(cluster.currentValue);
    }
    if (resourceGroup && resourceGroup.currentValue) {
      this.processResourceGroup(resourceGroup.currentValue);
    }
  }

  private processCluster(cluster): ng.IPromise<any> {
    this.data = cluster;
    this.type = 'cluster';
    return this.populateReleaseChannelOptions()
      .then(() => this.setSelectedReleaseChannelOption(cluster.releaseChannel));
  }

  private processResourceGroup(resourceGroup): ng.IPromise<any> {
    this.data = resourceGroup;
    this.type = 'resource-group';
    return this.populateReleaseChannelOptions()
      .then(() => this.setSelectedReleaseChannelOption(resourceGroup.releaseChannel));
  }

  private populateReleaseChannelOptions(): ng.IPromise<any> {
    // Reset releaseChannelOptions
    this.releaseChannelOptions = [{
      label: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
      value: 'stable',
    }];
    // The function below gets all allowed channels for the current org,
    // nothing specific to a resource group. Bad naming.
    return this.ResourceGroupService.getAllowedChannels()
      .then(channels => {
        _.forEach(ReleaseChannelSectionController.restrictedChannels, restrictedChannel => {
          if (_.includes(channels, restrictedChannel)) {
            this.releaseChannelOptions.push({
              label: this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${restrictedChannel}`),
              value: restrictedChannel,
            });
          }
        });
      })
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.genericFailure'));
  }

  public releaseChannelChanged(): void {
    const oldReleaseChannel = this.data.releaseChannel;
    this.$modal.open({
      resolve: {
        data: () => this.data,
        releaseChannel: () => this.releaseChannelSelected.value,
        type: () => this.type,
      },
      controller: 'ChangeReleaseChannelDialogController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/fusion-pages/change-release-channel-dialog/change-release-channel-dialog.html',
      type: 'dialog',
    })
    .result
    .then(() => {
      this.data.releaseChannel = this.releaseChannelSelected.value;
    })
    .catch(() => this.setSelectedReleaseChannelOption(oldReleaseChannel));
  }

  public resetReleaseChannel(): ng.IPromise<any> {
    return this.$q.resolve()
      .then(() => {
        if (this.type === 'cluster') {
          return this.FusionClusterService.setReleaseChannel(this.data.id, 'stable');
        } else if (this.type === 'resource-group') {
          return this.ResourceGroupService.setReleaseChannel(this.data.id, 'stable');
        }
      })
      .then(() => {
        this.releaseChannelSelected = this.releaseChannelOptions[0];
        this.showResetSection = false;
        this.Notification.success('hercules.resourceGroupSettings.releaseChannelSection');
      })
      .catch(error => this.Notification.errorWithTrackingId(error, 'hercules.genericFailure'));
  }

  public isDisabled(): boolean {
    return this.releaseChannelOptions.length < 2 ||
      this.clusterSettingsButHasResourceGroup() ||
      this.expresswaySettings();
  }

  public clusterSettingsButHasResourceGroup(): boolean {
    return this.type === 'cluster' && this.data.resourceGroupId;
  }

  public expresswaySettings(): boolean {
    return this.type === 'cluster' && !this.data.resourceGroupId && this.data.targetType === 'c_mgmt';
  }

  private setSelectedReleaseChannelOption(releaseChannel): void {
    this.releaseChannelSelected = _.find(this.releaseChannelOptions, {
      value: releaseChannel.toLowerCase(),
    });
    if (!this.releaseChannelSelected) {
      this.showResetSection = true;
      this.localizedCurrentChannelName = this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${releaseChannel}`);
    }
  }
}

export class ReleaseChannelSectionComponent implements ng.IComponentOptions {
  public controller = ReleaseChannelSectionController;
  public templateUrl = 'modules/hercules/fusion-pages/release-channel-section/release-channel-section.tpl.html';
  public bindings = {
    cluster: '<',
    resourceGroup: '<',
  };
}

export default angular
  .module('Hercules')
  .component('releaseChannelSection', new ReleaseChannelSectionComponent())
  .name;
