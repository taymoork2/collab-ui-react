export class CrIconInfoController implements ng.IComponentController {
  public tooltipTrigger: string;
  public tooltipPlacement: string;

  public $onInit(): void {
    this.tooltipTrigger = this.tooltipTrigger || 'focus mouseenter';
    this.tooltipPlacement = this.tooltipPlacement || 'top';
  }
}

export class CrIconInfoComponent implements ng.IComponentOptions {
  public controller = CrIconInfoController;
  public template = require('./cr-icon-info.html');
  public bindings = {
    l10nTooltip: '@',
    tooltipTrigger: '@?',
    tooltipPlacement: '@?',
  };
}
