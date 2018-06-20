import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class OverviewHuntGroupMisconfigNotification {

  public createNotification($state, huntGroupId, huntGroupName): IOverviewPageNotification {
    return {
      badgeText: 'common.urgent',
      badgeType: 'alert',
      canDismiss: false,
      dismiss: () => {},
      link: () => {
        $state.go('huntgroupedit', {
          feature: {
            id: huntGroupId,
            cardName: huntGroupName,
          },
        });
      },
      linkText: 'homePage.goToEditNow',
      name: 'huntGroupMisconfigured',
      text: 'huronHuntGroup.misconfigured',
      textValues: {
        huntGroupName: huntGroupName,
      },
    };
  }
}

export default angular
  .module('Core')
  .service('OverviewHuntGroupMisconfigNotification', OverviewHuntGroupMisconfigNotification)
  .name;
