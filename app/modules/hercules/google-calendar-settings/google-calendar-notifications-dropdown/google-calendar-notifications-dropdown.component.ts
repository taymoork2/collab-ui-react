interface IAlarms {
  severity: 'critical' | 'error' | 'warning' | 'alert';
  title: string;
  description: string;
  key: string;
}

class GoogleCalendarNotificationsDropdownCtrl implements ng.IComponentController {
  private serviceId = 'squared-fusion-gcal';

  public open = false;
  public alarms: IAlarms[] = [];

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    private $window: ng.IWindowService,
    private FusionClusterService,
  ) {}

  public $onInit() {
    this.handleClick = this.handleClick.bind(this);
    this.FusionClusterService.getAlarms(this.serviceId)
      .then((alarms: IAlarms[]) => {
        this.alarms = alarms;
      });
  }

  public $onDestroy() {
    this.$window.removeEventListener('click', this.handleClick);
  }

  public showDropdown() {
    this.$window.addEventListener('click', this.handleClick);
    this.open = true;
  }

  public hideDropdown() {
    this.open = false;
    this.$window.removeEventListener('click', this.handleClick);
  }

  public toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.alarms.length === 0) {
      return;
    }
    this.open = !this.open;
    if (this.open) {
      this.showDropdown();
    } else {
      this.hideDropdown();
    }
  }

  public handleClick(event) {
    event.stopPropagation();
    if (this.open && this.isTargetOutsideComponent(event.target)) {
      this.hideDropdown();
      this.$scope.$apply();
    }
  }

  private isTargetOutsideComponent(target) {
    let element = angular.element(target);
    let inside;
    while (element[0] !== undefined) {
      inside = element[0] === this.$element[0];
      if (inside) {
        return false;
      }
      element = element.parent();
    }
    return true;
  }

  public removeAlarm(event, alarm) {
    event.stopPropagation();
    this.alarms = _.without(this.alarms, alarm);
    if (this.alarms.length === 0 ) {
      this.hideDropdown();
    }
  }

  public getNumberCSSClass() {
    if (this.alarms.length === 0) {
      return '';
    } else if (_.every(this.alarms, { severity: 'warning' })) {
      return 'warning';
    } else {
      return 'alert';
    }
  }

  public getBadgeCSSClass(severity) {
    return severity === 'warning' ? 'warning' : 'alert';
  }
}

export class GoogleCalendarNotificationsDropdownComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarNotificationsDropdownCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-notifications-dropdown/google-calendar-notifications-dropdown.html';
}
