import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

interface IAlarms {
  severity: 'critical' | 'error' | 'warning' | 'alert';
  title: string;
  description: string;
  key: string;
}

class HsCloudAlarmsDropdownComponentCtrl implements ng.IComponentController {
  private serviceId: HybridServiceId;

  public open = false;
  public alarms: IAlarms[] = [];

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    private $window: ng.IWindowService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
  ) {}

  public $onInit() {
    this.handleClick = this.handleClick.bind(this);
    this.HybridServicesExtrasService.getAlarms(this.serviceId)
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

  public getNumberCSSClass() {
    if (this.alarms.length === 0) {
      return '';
    } else if (_.some(this.alarms, alarm => { return alarm.severity === 'error' || alarm.severity === 'critical'; } )) {
      return 'alert';
    } else if (_.some(this.alarms, { severity: 'warning' })) {
      return 'warning';
    } else {
      return 'success';
    }
  }

  public getBadgeCSSClass(severity) {
    switch (severity) {
      case 'warning':
        return 'warning';
      case 'critical':
      case 'error':
        return 'alert';
      default:
        return 'success';
    }
  }
}

export class HsCloudAlarmsDropdownComponent implements ng.IComponentOptions {
  public controller = HsCloudAlarmsDropdownComponentCtrl;
  public templateUrl = 'modules/hercules/notifications/cloud-alarms-dropdown/hs-cloud-alarms-dropdown.component.html';
  public bindings = {
    serviceId: '<',
  };
}
