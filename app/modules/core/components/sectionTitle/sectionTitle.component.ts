export interface IActionItem {
  actionKey: string;
  actionFunction: Function;
}

class SectionTitle implements ng.IComponentController {
  private showActions: boolean;
  private actionList: IActionItem[];
  private asButton: boolean;
  private onActionClick?: Function;

  public $onInit(): void {
    this.asButton = !!this.asButton || this.shouldShowArrow();
  }

  public shouldShowActions(): boolean {
    return (_.get(this.actionList, 'length') && (_.isUndefined(this.showActions) || this.showActions)) || this.shouldShowArrow();
  }

  public shouldShowArrow(): boolean {
    return _.isFunction(this.onActionClick);
  }
}

export class SectionTitleComponent implements ng.IComponentOptions {
  public template = require('./sectionTitle.tpl.html');
  public controller = SectionTitle;
  public bindings = {
    titleKey: '@',
    titleKeyValues: '@',
    showActions: '<',
    actionList: '<',
    asButton: '<',
    onActionClick: '&?',
  };
}
