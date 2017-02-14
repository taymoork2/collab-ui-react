import { IPickupGroup, IMember, ICallPickupNumbers, IMemberNumber, ICardMemberCheckbox } from 'modules/huron/features/callPickup/services/callPickupGroup';
import { CallPickupGroupService } from 'modules/huron/features/callPickup/services/callPickupGroup.service';
import { Member } from 'modules/huron/members';

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

  // edit mode specific data
  public callPickupId: string;
  public title: string;
  public huronFeaturesUrl: string = 'huronfeatures';
  public isLoading: boolean = false;
  public callPickup: IPickupGroup;
  public saveInProcess: boolean = false;
  public form: ng.IFormController;
  public originalCallPickupGroup: IPickupGroup;
  private callPickupProperties: Array<string> = ['name', 'notificationTimer', 'playSound', 'displayCallingPartyId', 'displayCalledPartyId'];
  /* @ngInject */
  constructor(private $timeout: ng.ITimeoutService,
              private $modal,
              private $q,
              private $element: ng.IRootElementService,
              private $translate: ng.translate.ITranslateService,
              private $stateParams,
              private CallPickupGroupService: CallPickupGroupService,
              private $state: ng.ui.IStateService,
              private Notification,
              private FeatureMemberService,
              ) {
    this.createLabel = this.$translate.instant('callPickup.createHelpText');
    this.Notification.failureTimeout = 2000;
    this.callPickupId = _.get<string>(this.$stateParams.feature, 'id');
    this.title = _.get<string>(this.$stateParams.feature, 'cardName');
  }

  public $onInit(): void {
    if (this.$state.current.name === 'callpickupedit' && !this.callPickupId) {
      this.$state.go(this.huronFeaturesUrl);
    }
    this.isLoading = true;
    this.CallPickupGroupService.getCallPickupGroup(this.callPickupId).then(callPickupGroup => {
      this.callPickup = <IPickupGroup>_.pick( callPickupGroup, this.callPickupProperties);
      _.extend(this.callPickup, { numbers : _.map(callPickupGroup.numbers, 'uuid') });
      this.originalCallPickupGroup = callPickupGroup;
      this.populateSelectedMembers(callPickupGroup);
    });
  }

  public populateSelectedMembers(callPickup: IPickupGroup): void {
    let scope = this;
    scope.selectedMembers = [];
    let promises: Array<ng.IPromise<IMemberNumber[]>> = [];
    _.forEach(callPickup.members, function (member: Member) {
      let memberData: IMember = {
        member: member,
        picturePath: '',
        checkboxes: [],
        saveNumbers: [],
      };
      scope.FeatureMemberService.getMemberPicture(member.uuid).then(
        avatar => memberData.picturePath = avatar.thumbnailSrc,
      );
      scope.selectedMembers.push(memberData);
    });
    _.forEach(scope.selectedMembers, function(mem: IMember) {
      let promise = scope.CallPickupGroupService.getMemberNumbers(mem.member.uuid);
      promises.push(promise);
    });
    scope.$q.all(promises).then((memberNumbers: Array<IMemberNumber[]>) => {
      let index = 0;
      _.forEach(scope.selectedMembers, function (member: IMember) {
        member.checkboxes = scope.CallPickupGroupService.createCheckBoxes(member, memberNumbers[index]);
        index++;
      });
      _.forEach(callPickup.numbers, function (number: any) {
        let member = _.find(scope.selectedMembers, (member: IMember) => member.member.uuid === number.memberUuid);
        let cb = _.find(member.checkboxes, (checkbox: ICardMemberCheckbox) => (checkbox.label.split('&')[0].trim() === number.internal.trim()));
        if (cb) {
          cb.value = true;
        }
        let saveNum: ICallPickupNumbers = {
          uuid: number.uuid,
          internalNumber: number.internal,
        };
        if (_.some(member.saveNumbers, saveNum) === false) {
          member.saveNumbers.push(saveNum);
        }
      });
    })
    .finally( function() {
      scope.isLoading = false;
      });
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

  public setCallPickupNotificationTimer(seconds: number) {
    this.callPickup.notificationTimer = seconds;
    this.checkForChanges();
  }

  public setNotifications(playSound: boolean, displayCalledParty: boolean, displayCallingParty: boolean) {
    this.callPickup.playSound = playSound;
    this.callPickup.displayCalledPartyId = displayCalledParty;
    this.callPickup.displayCallingPartyId = displayCallingParty;
    this.checkForChanges();
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
    this.checkForChanges();
  }

  public setCallPickupName(name: string, isValid: boolean): void {
    this.callPickup.name = name;
    this.isNameValid = isValid;
    this.checkForChanges();
  }

  public onUpdateMember(member: IMember[], isValidMember: boolean): void {
    this.selectedMembers = member;
    this.isValidMember = isValidMember;
    this.checkForChanges();
  }

  public onEditUpdateMember(savedCallPickup: IPickupGroup) {
    this.callPickup = savedCallPickup;
    this.checkForChanges();
  }

  public updateCallPickup(): void {
    this.callPickup.members = this.callPickup.numbers;
    this.callPickup = <IPickupGroup>_.omit(this.callPickup, 'numbers');
    this.CallPickupGroupService.updateCallPickup(this.callPickupId, this.callPickup)
    .then(() => {
      this.Notification.success('callPickup.successUpdate', {
      callPickupName: this.callPickup.name,
      });
      this.$state.go(this.huronFeaturesUrl);
    },
    (error) => {
      let message = '';
      if (error
          && _.has(error, 'data')
          && _.has(error.data, 'errorMessage')) {
            message = error.data.errorMessage;
          }
      this.Notification.error('callPickup.errorUpdate', { message: message });
      })
    .finally( () => {
      this.saveInProcess = false;
      this.resetForm();
    });
  }

  public saveCallPickup(): void {
    this.saveInProcess = true;
    let scope = this;
    _.forEach(this.selectedMembers, function (member) {
      _.forEach(member.saveNumbers, function (number) {
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
      })
      .finally( () => {
        this.saveInProcess = false;
      });
  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public onCancel(): void {
    this.callPickup = this.CallPickupGroupService.getOriginalConfig();
    this.populateSelectedMembers(this.originalCallPickupGroup);
    this.resetForm();
  }

  public cancelModal(): void {
    this.$modal.open({
      templateUrl: 'modules/huron/features/callPickup/callPickupCancelModal.html',
      type: 'dialog',
    });
  }
  private checkNameValidity(): boolean {
    if ((!this.isNameValid && this.callPickup.name !== this.originalCallPickupGroup.name)) {
      return false;
    }
    return true;
  }

  private checkMemberValidity(): boolean {
    if (this.selectedMembers.length < 2 || !this.CallPickupGroupService.verifyLineSelected(this.selectedMembers)) {
      return false;
    }
    return true;
  }

  private checkForChanges(): void {
    let scope = this;
    this.$timeout(function () {
      if (!scope.checkNameValidity() || !scope.checkMemberValidity()) {
        scope.form.$setValidity('', false, scope.form);
        scope.form.$setDirty();
      } else if (scope.CallPickupGroupService.matchesOriginalConfig(scope.callPickup)) {
        scope.resetForm();
      } else {
        scope.form.$setValidity('', true, scope.form);
        scope.form.$setDirty();
      }
    });
  }
}

export class CallPickupSetupAssistantComponent implements ng.IComponentOptions {
  public controller = CallPickupSetupAssistantCtrl;
  public templateUrl = 'modules/huron/features/callPickup/callPickupSetupAssistant.html';
}
