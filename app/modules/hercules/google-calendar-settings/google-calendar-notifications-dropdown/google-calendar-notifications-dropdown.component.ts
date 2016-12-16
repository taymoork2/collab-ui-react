interface IAlarms {
  severity: 'critical' | 'error' | 'warning' | 'alert';
  title: string;
  description: string;
}

class GoogleCalendarNotificationsDropdownCtrl implements ng.IComponentController {
  private serviceId = 'squared-fusion-gcal';

  public showDropdown = false;
  public alarms: IAlarms[] = [];

  /* @ngInject */
  constructor(
    private FusionClusterService,
  ) {}

  public $onInit() {
    this.FusionClusterService.getAlarms(this.serviceId)
      .then(data => {
        this.alarms = data.items;
      });
  }

  public toggleDropdown() {
    if (!this.showDropdown && this.alarms.length === 0) {
      return;
    }
    this.showDropdown = !this.showDropdown;
  }

  public removeAlarm(alarm) {
    this.alarms = _.without(this.alarms, alarm);
  }

  public getNumberCSSClass() {
    const allAreWarnings = _.every(this.alarms, { severity: 'warning' });
    if (this.alarms.length === 0) {
      return '';
    } else if (allAreWarnings) {
      return 'warning';
    } else {
      return 'alert';
    }
  }

  public getBadgeCSSClass(severity) {
    if (severity === 'warning') {
      return 'warning';
    } else {
      return 'alert';
    }
  }

  public shouldDisplayDropdown() {
    return this.showDropdown && this.alarms.length > 0;
  }
}

export class GoogleCalendarNotificationsDropdownComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarNotificationsDropdownCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-notifications-dropdown/google-calendar-notifications-dropdown.html';
}
