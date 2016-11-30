import { IPickupGroup, IMember } from 'modules/huron/features/callPickup/services/callPickupGroup';
import { CallPickupGroupService } from 'modules/huron/features/callPickup/services/callPickupGroup.service';
//import { USER_REAL_USER } from 'modules/huron/members';

class CallPickupSetupAssistantCtrl implements ng.IComponentController {

  //Call Pickup group name
  public name: string = '';
  private isNameValid: boolean = false;

  //Call pickup group members
  public selectedMembers: IMember[] = [];
  private isValidMember: boolean = false;

  public animation: string = 'slide-left';
  private index: number = 0;
  private createLabel: string = '';
  public isUniqueName: boolean;
  public saveNumbers: string[] = [];
  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private $modal,
              private $element: ng.IRootElementService,
              private $translate: ng.translate.ITranslateService,
              private CallPickupGroupService: CallPickupGroupService,
              private $state: ng.ui.IStateService,
              private Notification,
              ) {
    this.createLabel = this.$translate.instant('callPickup.createHelpText');
    this.Notification.failureTimeout = 2000;
  }

  public getLastIndex(): number {
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
      case 1:
        let memberDefined: boolean = !(this.selectedMembers.length < 2);
        let helpText = this.$element.find('div.btn-helptext.helptext-btn--right');
        if (memberDefined && this.isValidMember) {
          //Show helpText
          helpText.addClass('active');
          helpText.addClass('enabled');
        } else {
          //Hide helpText
          helpText.removeClass('active');
          helpText.removeClass('enabled');
        }
        return memberDefined && this.isValidMember;
      default:
        return true;
    }
  }

  public previousPage(): void {
    this.animation = 'slide-right';
    this.$timeout(() => {
      if (this.index === this.getLastIndex()) {
        //Change the green arrow button to a blue one
        let arrowButton = this.$element.find('button.btn--circle.btn--primary.btn--right');
        arrowButton.removeClass('saveCallPickup');
        //Hide helpText
        let helpText = this.$element.find('div.btn-helptext.helptext-btn--right');
        helpText.removeClass('active');
        helpText.removeClass('enabled');
      }
      this.index--;
    });
  }

  public nextPage(): void {
      this.animation = 'slide-left';
      this.index++;
      if (this.index === this.getLastIndex()) {
        //Change the blue arrow button to a green one
        let arrowButton = this.$element.find('button.btn--circle.btn--primary.btn--right');
        arrowButton.addClass('saveCallPickup');
      }
      if (this.index === this.getLastIndex() + 1) {
        this.saveCallPickup();
        this.index--;
      }
  }

  public nextText(): string {
    return this.createLabel;
  }

  public evalKeyPress(keyCode: number): void {
    const ESCAPE_KEY = 27;
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
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
      default:
        break;
    }
  }

  public enterNextPage(keyCode: number): void {
    if (keyCode === 13 && this.nextButton() === true) {
      this.nextPage();
    }
  }

  public onUpdateName(name: string, isValid: boolean): void {
    this.name = name;
    this.isNameValid = isValid;
  }

  public onUpdateMember(member: IMember[], isValidMember: boolean): void {
    this.selectedMembers = member;
    this.isValidMember = isValidMember;
  }

  public saveCallPickup(): void {
    let scope = this;
    _.forEach(this.selectedMembers, function(member) {
      _.forEach(member.saveNumbers, function(number){
        scope.saveNumbers.push(number.uuid);
      });
    });
    let callPickupGroup: IPickupGroup = <IPickupGroup> {
      name: this.name,
      members: this.saveNumbers,
    };
    this.CallPickupGroupService.saveCallPickupGroup(callPickupGroup).then(
      (data) => {
        this.Notification.success('callPickup.successSave', { callPickupName: data.name });
        this.$state.go('huronfeatures');
      },
      (error) => {
        let message = '';
        if (error
          && _.has(error, 'data')
          && _.has(error.data, 'errorMessage')) {
            message = error.data.errorMessage;
        }
        this.Notification.error('callPickup.errorSave', { message: message });
      });
  }

  public cancelModal(): void {
    this.$modal.open({
      templateUrl: 'modules/huron/features/callPickup/callPickupCancelModal.html',
      type: 'dialog',
    });
  }
}

export class CallPickupSetupAssistantComponent implements ng.IComponentOptions {
  public controller = CallPickupSetupAssistantCtrl;
  public templateUrl = 'modules/huron/features/callPickup/callPickupSetupAssistant.html';
}
