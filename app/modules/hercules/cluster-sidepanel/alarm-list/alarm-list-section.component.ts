import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';

export class AlarmListSectionComponentCtrl implements ng.IComponentController {

  public alarms: IConnectorAlarm[];
  private connectorType: string;
  private newLink: string;

  private severityIconMap = {
    critical: 'icon icon-error',
    error: 'icon icon-priority',
    warning: 'icon icon-warning',
    alert: 'icon icon-info',
  };

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
  ) {}

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { alarms } = changes;
    if (alarms && alarms.currentValue) {
      this.alarms = _.map(this.sortAlarmsBySeverity(alarms.currentValue), (alarm) => this.HybridServicesExtrasService.translateResourceAlarm(alarm));
    }
  }

  public sortAlarmsBySeverity(alarms: IConnectorAlarm[]): IConnectorAlarm[] {
    enum SortOrder {
      'critical' = 0,
      'error' = 1,
      'warning' = 2,
      'alert' = 3,
    }

    return _.sortBy(alarms, alarm => {
      return SortOrder[alarm.severity];
    });
  }

  public getSeverityIcon(severity: string): string {
    if (!this.severityIconMap[severity]) {
      return 'icon icon-warning';
    }
    return this.severityIconMap[severity];
  }

  public goToAlarm(alarm: any): void {
    if (this.newLink === 'true') {
      this.$state.go('hybrid-services-connector-sidepanel.alarm-details', {
        alarm: alarm,
      });
    } else if (this.connectorType === 'c_mgmt' || this.connectorType === 'c_cal' || this.connectorType === 'c_ucmc') {
      this.$state.go('expressway-cluster-sidepanel.alarm-details', {
        alarm: alarm,
      });
    } else if (this.connectorType === 'hds_app') {
      this.$state.go('hds-cluster-details.alarm-details', {
        alarm: alarm,
      });
    } else if (this.connectorType === 'mf_mgmt') {
      this.$state.go('media-cluster-details.alarm-details', {
        alarm: alarm,
      });
    } else if (this.connectorType === 'ept') {
      this.$state.go('private-trunk-sidepanel.alarm-details', {
        alarm: alarm,
      });
    }
  }
}

export class AlarmListSectionComponent implements ng.IComponentOptions {
  public controller = AlarmListSectionComponentCtrl;
  public template = require('modules/hercules/cluster-sidepanel/alarm-list/alarm-list-section.html');
  public bindings = {
    alarms: '<',
    connectorType: '<',
    newLink: '<',
  };
}
