export type ResourceType = 'cluster' | 'resource-group';

export class ChangeReleaseChannelDialogController {

  public releaseChannelName: string = this.$translate.instant(`hercules.fusion.add-resource-group.release-channel.${this.releaseChannel}`);

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $modalInstance,
    private $translate,
    private data,
    private releaseChannel,
    private type: ResourceType,
    private FusionClusterService,
    private Notification,
    private ResourceGroupService
  ) {}

  public confirmChange() {
    return this.$q.resolve()
      .then(() => {
        if (this.type === 'cluster') {
          return this.FusionClusterService.setReleaseChannel(this.data.id, this.releaseChannel);
        } else if (this.type === 'resource-group') {
          return this.ResourceGroupService.setReleaseChannel(this.data.id, this.releaseChannel);
        }
        return this.$q.reject();
      })
      .then((data) => {
        this.Notification.success('hercules.releaseChannelSection.groupReleaseChannelSaved');
        this.$modalInstance.close(data);
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }
}

angular
  .module('Hercules')
  .controller('ChangeReleaseChannelDialogController', ChangeReleaseChannelDialogController);
