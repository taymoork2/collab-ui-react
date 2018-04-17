import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { HybridServiceId, IServiceAlarm } from 'modules/hercules/hybrid-services.types';

class HsCloudAlarmsDropdownComponentCtrl implements ng.IComponentController {
  private serviceId: HybridServiceId;
  private poller: ng.IPromise<void> | undefined = undefined;
  private pollingInterval = 30 * 1000;

  public open = false;
  public alarms: IServiceAlarm[] = [];

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
  ) {
    this.getAlarms = this.getAlarms.bind(this);
  }

  public $onInit() {
    this.handleClick = this.handleClick.bind(this);
    this.getAlarms();
  }

  public $onDestroy() {
    this.$window.removeEventListener('click', this.handleClick);
    if (this.poller) {
      this.$timeout.cancel(this.poller);
    }
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

  private getAlarms() {
    if (this.serviceId === 'squared-fusion-o365') {
      this.serviceId = 'squared-fusion-cal';
    }
    this.HybridServicesExtrasService.getAlarms(this.serviceId)
      .then((alarms) => {
        this.alarms = alarms;
      })
      .finally(() => {
        this.poller = this.$timeout(this.getAlarms, this.pollingInterval);
      });
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
  public template = require('modules/hercules/notifications/cloud-alarms-dropdown/hs-cloud-alarms-dropdown.component.html');
  public bindings = {
    serviceId: '<',
  };
}
