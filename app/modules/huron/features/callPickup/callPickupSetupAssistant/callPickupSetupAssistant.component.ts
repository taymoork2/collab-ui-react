class CallPickupSetupAssistantCtrl implements ng.IComponentController {

  //Call Pickup group name
  public name: string = '';
  private isNameValid: boolean = false;

  public animation: string = 'slide-left';
  private index: number = 0;
  private createLabel: string = '';

  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private $modal,
              private $translate: ng.translate.ITranslateService
              ) {
    this.createLabel = this.$translate.instant('callPickup.createHelpText');
  }

  public get lastIndex(): number {
    return 1;
  }

  public getPageIndex(): number {
    return this.index;
  }

  public previousButton(): any {
    if (this.index === 0) {
      return 'hidden';
    }
    return true;
  }

  public nextButton(): any {
    switch (this.index) {
      case 0:
        return this.name !== '' && this.isNameValid;
      default:
        return true;
    }
  }

  public previousPage(): void {
    this.animation = 'slide-right';
    this.$timeout(() => {
      this.index--;
    });
  }

  public nextPage(): void {
    this.animation = 'slide-left';
    this.$timeout(() => {
      this.index++;
    });
  }

  public nextText(): string {
    return this.createLabel;
  }

  public evalKeyPress(keyCode: number): void {
    const ESCAPE_KEY = 27;
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const ENTER_KEY = 13;
    switch (keyCode) {
      case ESCAPE_KEY:
        this.cancelModal();
        break;
      case RIGHT_ARROW:
        if (this.nextButton() === true) {
          this.nextPage();
        }
        break;
      case LEFT_ARROW:
        if (this.previousButton() === true) {
          this.previousPage();
        }
        break;
      case ENTER_KEY:
        if (this.nextButton() === true) {
          this.nextPage();
        }
        break;
      default:
        break;
    }
  }

  public onUpdateName(name: string, isValid: boolean): void {
    this.name = name;
    this.isNameValid = isValid;
  }

  public cancelModal(): void {
    this.$modal.open({
      templateUrl: 'modules/huron/features/callPickup/callPickupSetupAssistant/callPickupCancelModal.html',
      type: 'dialog',
    });
  }
}

export class CallPickupSetupAssistantComponent implements ng.IComponentOptions {
  public controller = CallPickupSetupAssistantCtrl;
  public templateUrl = 'modules/huron/features/callPickup/callPickupSetupAssistant/callPickupSetupAssistant.html';
}
