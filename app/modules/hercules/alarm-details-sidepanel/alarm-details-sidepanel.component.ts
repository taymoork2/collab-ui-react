import { IAlarm } from 'modules/hercules/herculesInterfaces';

interface IAlarmModified extends IAlarm {
  alarmSolutionElements: any[];
}

export class AlarmDetailsSidepanelCtrl implements ng.IComponentController {
  public alarm: IAlarmModified;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private FusionClusterStatesService,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('hercules.hybridServicesConnectorSidepanel.alarmDetails');
    this.$rootScope.$broadcast('displayNameUpdated');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    let alarm = changes['alarm'];
    if (alarm && alarm.currentValue) {
      this.init(alarm.currentValue);
    }
  }

  public getAlarmSeverityCssClass = this.FusionClusterStatesService.getAlarmSeverityCssClass;

  // This hack should be removed once FMS starts using the correct format for alarm timestamps.
  public parseDate = timestamp => {
    const unix = moment.unix(timestamp);
    return unix.isValid() ? unix.format() : moment(timestamp).format();
  }

  private init(alarm: IAlarmModified) {
    if (alarm.solution) {
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
    }
    this.alarm = alarm;
  }
}

export class AlarmDetailsSidepanelComponent implements ng.IComponentOptions {
  public controller = AlarmDetailsSidepanelCtrl;
  public templateUrl = 'modules/hercules/alarm-details-sidepanel/alarm-details-sidepanel.html';
  public bindings = {
    alarm: '<',
  };
}
