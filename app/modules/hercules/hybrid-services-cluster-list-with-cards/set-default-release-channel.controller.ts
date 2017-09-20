import { FmsOrgSettings } from 'modules/hercules/services/fms-org-settings.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';

interface IOptions {
  label: string;
  value: string;
}

export class SetDefaultReleaseChannelController {
  private restrictedChannels = ['beta', 'latest'];
  private saving = false;

  public releaseChannelSelected: IOptions | undefined = undefined;
  public releaseChannelOptions: IOptions[] = [{
    label: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.stable'),
    value: 'stable',
  }];

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $modalInstance: ng.ui.bootstrap.IModalInstanceService,
    private $translate: ng.translate.ITranslateService,
    private unassignedClusters: any[],
    private FmsOrgSettings: FmsOrgSettings,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private ResourceGroupService: ResourceGroupService,
  ) {
    this.getDefaultReleaseChannel = this.getDefaultReleaseChannel.bind(this);
    this.populateReleaseChannelOptions()
      .then(this.getDefaultReleaseChannel);
  }

  public isDisabled(): boolean {
    return this.saving || this.releaseChannelSelected === undefined;
  }

  public saveReleaseChannel(channel: string): ng.IPromise<void> {
    this.saving = true;
    return this.FmsOrgSettings.set({
      expresswayClusterReleaseChannel: channel,
    })
      .then(_.partial(this.updateAllUnassignedClusters.bind(this), channel))
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.fusion.defaultReleaseChannelModal.error');
        return this.$q.reject(error);
      })
      .then(this.$modalInstance.close)
      .finally(() => {
        this.saving = false;
      });
  }

  private updateAllUnassignedClusters(releaseChannel: string) {
    const promises = _.map(this.unassignedClusters, (cluster) => {
      return this.HybridServicesClusterService.setClusterInformation(cluster.id, { releaseChannel: releaseChannel });
    });
    return this.$q.all(promises);
  }

  private getDefaultReleaseChannel(): ng.IPromise<void> {
    return this.FmsOrgSettings.get()
      .then((data) => {
        this.releaseChannelSelected = _.find(this.releaseChannelOptions, {
          value: data.expresswayClusterReleaseChannel.toLowerCase(),
        });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.fusion.defaultReleaseChannelModal.error');
      });
  }

  private populateReleaseChannelOptions(): ng.IPromise<void> {
    return this.ResourceGroupService.getAllowedChannels()
      .then((channels) => {
        _.forEach(this.restrictedChannels, (restrictedChannel) => {
          if (_.includes(channels, restrictedChannel)) {
            this.releaseChannelOptions.push({
              label: this.$translate.instant('hercules.fusion.add-resource-group.release-channel.' + restrictedChannel),
              value: restrictedChannel,
            });
          }
        });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }
}
