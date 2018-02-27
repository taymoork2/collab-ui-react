import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.service';

/* @ngInject */
export function OverviewAutoAssignNotificationFactory(
  AutoAssignTemplateService: AutoAssignTemplateService,
) {

  function createNotification(): IOverviewPageNotification {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: true,
      dismiss: () => {},
      link: () => {
        AutoAssignTemplateService.gotoEditAutoAssignTemplate({
          isEditTemplateMode: false,
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
