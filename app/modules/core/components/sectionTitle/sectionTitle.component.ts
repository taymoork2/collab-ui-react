export interface IActionItem {
  actionKey: string;
  actionFunction: Function;
}

class SectionTitle implements ng.IComponentController {
  private showActions: boolean;
  private actionList: IActionItem[];

  public shouldShowActions(): boolean {
    return _.get(this.actionList, 'length') && (_.isUndefined(this.showActions) || this.showActions);
  }
}

angular.module('Core')
  .component('sectionTitle', {
    templateUrl: 'modules/core/components/sectionTitle/sectionTitle.tpl.html',
    controller: SectionTitle,
    bindings: {
      titleKey: '@',
      showActions: '<',
      actionList: '<',
    },
  });
