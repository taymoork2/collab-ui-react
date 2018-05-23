import { LinkingOriginator } from '../../../account-linking/account-linking.interface';
import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class LinkedSiteNotification {

  public createNotification($state: ng.ui.IStateService): IOverviewPageNotification {
    return {
      badgeText: 'homePage.todo',
      badgeType: 'success',
      canDismiss: false,
      dismiss: () => {
      },
      link: () => $state.go('site-list.linked', { originator: LinkingOriginator.Banner }, { reload: false }),
      linkText: 'accountLinking.notification.linkText',
      name: 'linkedsite',
      text: 'accountLinking.notification.infoText',
    };
  }

}

export default angular
  .module('Accountlinking')
  .service('LinkedSiteNotification', LinkedSiteNotification)
  .name;
