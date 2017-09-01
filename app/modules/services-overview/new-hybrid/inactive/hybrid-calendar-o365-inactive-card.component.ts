import { IToolkitModalService } from 'modules/core/modal';

class HybridCalendarO365InactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private ModalService,
  ) {}

  public openPrerequisites(): void {
    this.ModalService.open({
      hideDismiss: true,
      title: 'Not implemented yet',
      message: '¯\_(ツ)_/¯',
      close: this.$translate.instant('common.close'),
    });
  }

  public openSetUp(): void {
    this.$modal.open({
      template: '<office-365-setup-modal class="modal-content" close="$close()" dismiss="$dismiss()"></office-365-setup-modal>',
      type: 'full',
    });
  }
}

export class HybridCalendarO365InactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarO365InactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header inactive-card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span>[Office 365]</span>
      </div>
      <div class="inactive-card_content">
        <p translate="servicesOverview.cards.hybridCalendar.description"></p>
      </div>
      <div class="inactive-card_footer">
        <p><a href ng-click="$ctrl.openPrerequisites()" translate="servicesOverview.genericButtons.prereq"></a></p>
        <p><button class="btn btn--primary" ng-click="$ctrl.openSetUp()" translate="servicesOverview.genericButtons.setup"></button></p>
      </div>
    </article>
  `;
}
