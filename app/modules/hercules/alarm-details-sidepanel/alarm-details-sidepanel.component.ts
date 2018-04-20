import { IExtendedConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';

interface IAlarmModified extends IExtendedConnectorAlarm {
  alarmSolutionElements: any[];
}

export class AlarmDetailsSidepanelCtrl implements ng.IComponentController {
  public alarm: IAlarmModified;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('hercules.hybridServicesConnectorSidepanel.alarmDetails');
    this.$rootScope.$broadcast('displayNameUpdated');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { alarm } = changes;
    if (alarm && alarm.currentValue) {
      this.init(alarm.currentValue);
    }
  }

  public getAlarmSeverityCssClass = this.HybridServicesClusterStatesService.getAlarmSeverityCSSClass;

  public parseDate = timestamp => moment(timestamp).format();

  private init(alarm: IAlarmModified) {
    if (alarm.key) {
      this.alarm = this.HybridServicesExtrasService.translateResourceAlarm(alarm) as IAlarmModified;
    }
    if (!alarm.key && alarm.solution) {
      alarm.alarmSolutionElements = [];
      if (_.size(alarm.solutionReplacementValues) > 0) {
        _.forEach(alarm.solution.split('%s'), (value, i) => {
          alarm.alarmSolutionElements.push({ text: value });
          const replacementValue = alarm.solutionReplacementValues[i];
          if (replacementValue) {
            alarm.alarmSolutionElements.push(replacementValue);
          }
        });
      } else {
        alarm.alarmSolutionElements.push({ text: this.alarm.solution });
      }
      this.alarm = alarm;
    }
  }
}

export class AlarmDetailsSidepanelComponent implements ng.IComponentOptions {
  public controller = AlarmDetailsSidepanelCtrl;
  public template = require('modules/hercules/alarm-details-sidepanel/alarm-details-sidepanel.html');
  public bindings = {
    alarm: '<',
  };
}
