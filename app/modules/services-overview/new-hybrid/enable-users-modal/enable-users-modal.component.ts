import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

import './enable-users-modal.scss';

class EnableUsersModalController implements ng.IComponentController {
  public close: Function;
  public dismiss: Function;
  public serviceId: HybridServiceId;
  public service: string;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: { serviceId: ng.IChangesObject<any> }) {
    if (changes.serviceId && changes.serviceId.currentValue) {
      if (changes.serviceId.currentValue !== 'undefined') { // Yes, AngularJS actually uses the string 'undefined' here, not the primitive value undefined
        this.service = this.$translate.instant(`hercules.serviceNames.${changes.serviceId.currentValue}`);
      } else {
        this.service = this.$translate.instant(`common.service`).toLowerCase();
      }
    }
  }

  public goToUsers(): void {
    this.dismiss();
    this.$state.go('users.list');
  }

  public manageUsers(): void {
    this.dismiss();
    this.$state.go('users.list')
      .then(() => {
        this.$state.go('users.manage.org');
      });
  }
}

export class EnableUsersModalComponent implements ng.IComponentOptions {
  public controller = EnableUsersModalController;
  public template = `
    <div class="modal-header">
      <h4 class="modal-title" translate="enableUsersModal.title"></h4>
    </div>
    <div class="modal-body">
      <h5 translate="enableUsersModal.subtitle" translate-values="{service: $ctrl.service}"></h5>
      <p translate="enableUsersModal.line1"></p>
      <ul>
        <li translate="enableUsersModal.item1" translate-value-onclick="$ctrl.goToUsers()" translate-compile></li>
        <li translate="enableUsersModal.item2" translate-value-onclick="$ctrl.manageUsers()" translate-compile></li>
      </ul>
      <p translate="enableUsersModal.line2"></p>
    </div>
    <div class="modal-footer">
      <button class="btn btn--primary" ng-click="$ctrl.close()">
        <span translate="common.done"></span>
      </button>
    </div>
  `;
  public bindings = {
    close: '&',
    dismiss: '&',
    serviceId: '<',
  };
}
