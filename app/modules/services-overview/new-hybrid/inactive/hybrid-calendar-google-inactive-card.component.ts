import { CloudConnectorService } from 'modules/hercules/services/calendar-cloud-connector.service';

class HybridCalendarGoogleInactiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private CloudConnectorService: CloudConnectorService,
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
    this.CloudConnectorService.openSetupModal()
      .then((response) => {
        // TODO: refresh page
        window.console.info('success openSetUp Exchange', response);
      });
  }
}

export class HybridCalendarGoogleInactiveCardComponent implements ng.IComponentOptions {
  public controller = HybridCalendarGoogleInactiveCardController;
  public template = `
    <article>
      <div class="inactive-card_header inactive-card_header--stretched">
        <h4 translate="servicesOverview.cards.hybridCalendar.title"></h4>
        <span>[Google]</span>
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
