import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export function OverviewAutoAssignNotificationFactory() {

  function createNotification($state: ng.ui.IStateService): IOverviewPageNotification {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => {},
      link: () => {
        $state.go('users.manage.edit-auto-assign-template-modal', {
          prevState: 'users.manage.picker',
        });
      },
      linkText: 'homePage.autoAssignLink',
      name: 'autoassign',
      text: 'homePage.autoAssignText',
    };
  }

  return {
    createNotification,
  };
}
