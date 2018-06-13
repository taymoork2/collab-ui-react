import { IToolkitModalService } from 'modules/core/modal';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export class ReactivateUserLinkCtrl implements ng.IComponentController {

  public userId: string;
  public service: HybridServiceId;
  public callback: Function;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) { }

  public $onInit(): void {
  }

  public openModal() {
    this.$modal.open({
      template: '<reactivate-user-modal user-id="\'' + this.userId + '\'" service="\'' + this.service + '\'" class="modal-content" dismiss="$dismiss()" close="$close()"></reactivate-user-modal>',
      type: 'dialog',
    }).result.then(() => {
      this.callback();
    });
  }
}

export class ReactivateUserModalLinkComponent implements ng.IComponentOptions {
  public controller = ReactivateUserLinkCtrl;
  public template = require('modules/hercules/user-sidepanel/reactivate-user-modal/reactivate-user-modal-link/reactivate-user-modal-link.component.html');
  public bindings = {
    userId: '<',
    service: '<',
    callback: '&',
  };
}
