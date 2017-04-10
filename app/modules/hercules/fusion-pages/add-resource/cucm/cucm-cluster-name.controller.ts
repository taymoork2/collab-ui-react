export class CucmClusterNameController {

  public clusterName: string = '';
  public validationMessages: { required: string, minlength: string };
  public minLength: number = 1;
  public releaseChannel: string = 'stable';
  public provisioning: boolean;
  public clusterId: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $stateParams: ng.ui.IStateParamsService,
    private FusionClusterService,
    private Notification,
  ) {
    this.validationMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: this.minLength,
      }),
    };
    FusionClusterService.getOrgSettings()
      .then((settings) => {
        this.releaseChannel = settings.expresswayClusterReleaseChannel;
      });
  }

  public next() {
    this.provisionCluster()
      .then(() => {
        this.$stateParams.wizard.next({
          cucm: {
            clusterName: this.clusterName,
            clusterId: this.clusterId,
          },
        });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  public canGoNext() {
    return this.clusterName && this.clusterName.length >= this.minLength;
  }

  public handleKeypress(event) {
    if (event.keyCode === 13 && this.canGoNext()) {
      this.next();
    }
  }

  private provisionCluster() {
    this.provisioning = true;
    return this.FusionClusterService.preregisterCluster(this.clusterName, this.releaseChannel, 'ucm_mgmt')
      .then((cluster) => {
        this.clusterId = cluster.id;
      })
      .then(() => {
        let hostname = this.$stateParams.wizard.state().data.cucm.hostname;
        return this.FusionClusterService.addPreregisteredClusterToAllowList(hostname, 3600, this.clusterId);
      })
      .catch(() => {
        throw this.$translate.instant('hercules.addResourceDialog.cannotCreateCluster');
      })
      .finally(() => {
        this.provisioning = false;
      });
  }
}

angular
  .module('Hercules')
  .controller('CucmClusterNameController', CucmClusterNameController);
