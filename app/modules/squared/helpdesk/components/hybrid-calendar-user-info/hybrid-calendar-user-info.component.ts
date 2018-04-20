import { IUserStatusWithExtendedMessages } from 'modules/hercules/services/uss.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

class HelpDeskHybridCalendarUserInfoComponentCtrl implements ng.IComponentController {

  public status: IUserStatusWithExtendedMessages;
  public clusterName: string;
  public hostName: string;
  public preferredWebExSite: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Userservice,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { status, user } = changes;

    if (status && status.currentValue) {
      this.status = status.currentValue;
      if (this.status.connectorId && this.status.owner !== 'ccc') {
        this.getClusterAndNode(this.status.connectorId);
      }
      if (this.status.owner === 'ccc') {
        this.clusterName = this.$translate.instant('common.ciscoCollaborationCloud');
      }
    }
    if (user && user.currentValue) {
      this.preferredWebExSite = this.Userservice.getPreferredWebExSiteForCalendaring(user.currentValue);
    }

  }

  private getClusterAndNode(connectorId) {
    this.HybridServicesClusterService.getHomedClusternameAndHostname(connectorId)
      .then((data) => {
        this.hostName = data.hostname || this.$translate.instant('common.notFound');
        this.clusterName = data.clustername || this.$translate.instant('common.notFound');
      })
      .catch(() => {
        this.hostName = this.$translate.instant('common.notFound');
        this.clusterName = this.$translate.instant('common.notFound');
      });
  }

}

export class HelpDeskHybridCalendarUserInfoComponent implements ng.IComponentOptions {
  public controller = HelpDeskHybridCalendarUserInfoComponentCtrl;
  public template = require('./hybrid-calendar-user-info.template.html');
  public bindings = {
    status: '<',
    user: '<',
  };
}
