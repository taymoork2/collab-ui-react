import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class OverviewEVAMissingDefaultSpaceNotification {

  public createNotification($state, eva, linkText, text, owner): IOverviewPageNotification {
    return {
      badgeText: 'common.warning',
      badgeType: 'warning',
      canDismiss: true,
      dismiss: function () {},
      link: function () {
        $state.go('care.expertVirtualAssistant', {
          isEditFeature: true,
          template: eva,
        });
      },
      linkText: linkText,
      name: 'evaMissingDefaultSpaceNotification',
      text: text,
      textValues: {
        name: eva.name,
        owner: owner,
      },
    };
  }
}

export default angular
  .module('Sunlight')
  .service('OverviewEVAMissingDefaultSpaceNotification', OverviewEVAMissingDefaultSpaceNotification)
  .name;
