export interface IActionItem {
  actionKey: string;
  actionFunction: Function;
}

class SectionTitle implements ng.IComponentController {
  private showActions: boolean;
  private actionList: IActionItem[];
  private asButton: boolean;
  private onActionClick: Function;

  public $onInit(): void {
    this.asButton = (_.isString(this.asButton) ? (this.asButton.toLowerCase() !== 'false') : !!this.asButton) || this.shouldShowArrow();
  }

  public shouldShowActions(): boolean {
    return (_.get(this.actionList, 'length') && (_.isUndefined(this.showActions) || this.showActions)) || this.shouldShowArrow();
  }

  public shouldShowArrow(): boolean {
    return !_.isUndefined(this.onActionClick) && _.isFunction(this.onActionClick);
  }
}

angular.module('Core')
  .component('sectionTitle', {
    template: require('modules/core/components/sectionTitle/sectionTitle.tpl.html'),
    controller: SectionTitle,
    bindings: {
      titleKey: '@',
      titleKeyValues: '@',
      showActions: '<',
      actionList: '<',
      asButton: '<',
      onActionClick: '&?',
    },
  });
