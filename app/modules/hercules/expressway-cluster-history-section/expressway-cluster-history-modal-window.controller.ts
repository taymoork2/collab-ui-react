import { HybridServicesAuditLogService, IExpresswayClusterHistory, IExpresswayClusterHistoryItem } from 'modules/hercules/services/hybrid-services-audit-log.service';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';

export class ExpresswayClusterHistoryModalWindowController {

  public formattedData: IExpresswayClusterHistoryItem[];
  public loading = true;
  public errorMessage;

  /* @ngInject */
  constructor(
    private HybridServicesAuditLogService: HybridServicesAuditLogService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private clusterId: string,
    public clusterName: string,
  ) {
    this.loadCluster(this.clusterId);
  }

  public getLocalizedTimeAndDate(timestamp) {
    return this.HybridServicesI18NService.getLocalTimestamp(timestamp);
  }

  private loadCluster(clusterId: string) {
    this.loading = true;
    this.HybridServicesAuditLogService.getFormattedExpresswayClusterHistory(clusterId)
      .then((data: IExpresswayClusterHistory) => {
        if (data.items) {
          this.formattedData = data.items;
        }
      })
      .catch((error) => {
        if (error.data && error.data.message) {
          this.errorMessage = error.data.message;
        }
      })
      .finally(() => {
        this.loading = false;
      });

  }

}

angular
  .module('Hercules')
  .controller('ExpresswayClusterHistoryModalWindowController', ExpresswayClusterHistoryModalWindowController);
