import { IToolkitModalService } from 'modules/core/modal';

export class Office365ReAuthorizationSectionController implements ng.IComponentController {
  public reAuthorizationSection = {
    title: 'hercules.office365ReAuthorizationComponent.title',
  };

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) {}

  public authorize(): void {
    this.$modal.open({
      template: '<office-365-setup-modal class="modal-content" first-time="true" close="$close()" dismiss="$dismiss()"></office-365-setup-modal>',
      type: 'full',
    });
  }
}

export class Office365ReAuthorizationSectionComponent implements ng.IComponentOptions {
  public controller = Office365ReAuthorizationSectionController;
  public template = require('./office-365-re-authorization-section.html');
}
