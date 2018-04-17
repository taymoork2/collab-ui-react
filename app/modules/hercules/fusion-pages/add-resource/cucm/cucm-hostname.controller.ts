import { KeyCodes } from 'modules/core/accessibility';

export class CucmHostnameController {

  public hostname: string = '';
  public validationMessages: { required: string, minlength: string };
  public minLength: number = 3;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $stateParams: ng.ui.IStateParamsService,
  ) {
    this.validationMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      minlength: this.$translate.instant('common.invalidMinLength', {
        min: this.minLength,
      }),
    };
  }

  public next() {
    this.$stateParams.wizard.next({
      cucm: {
        hostname: this.hostname,
      },
    });
  }

  public canGoNext() {
    return this.hostname && this.hostname.length >= this.minLength;
  }

  public handleKeypress(event) {
    if (event.keyCode === KeyCodes.ENTER && this.canGoNext()) {
      this.next();
    }
  }
}

angular
  .module('Hercules')
  .controller('CucmHostnameController', CucmHostnameController);
