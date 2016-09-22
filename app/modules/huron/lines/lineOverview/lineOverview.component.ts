import { CallForwardAll, CallForwardBusy } from '../../callForward/callForward';
import { BLOCK_CALLERID_TYPE, CUSTOM_COMPANY_TYPE, CallerIdConfig, CallerIdOption } from '../../callerId';
import { SharedLineUser, User, SharedLineDevice } from '../../sharedLine';
import { LineService, LineConsumerType, LINE_CHANGE, Line } from '../services';
import { LineOverviewService, LineOverviewData } from './index';
import { DirectoryNumberOptionsService } from '../../directoryNumber';
import { IActionItem } from '../../../core/components/sectionTitle/sectionTitle.component';

class LineOverview implements ng.IComponentController {
  private ownerType: string;
  private ownerId: string;
  private ownerName: string;
  private numberId: string;
  private consumerType: LineConsumerType;

  public form: ng.IFormController;
  public saveInProcess: boolean = false;
  public actionList: IActionItem[];
  public showActions: boolean = false;
  public deleteConfirmation: string;

  // Directory Number properties
  public esnPrefix: string;
  public internalIsWarn: boolean;
  public internalNumbers: string[];
  public internalWarnMsg: string;
  public externalNumbers: string[];
  public showExtensions: boolean;

  // Call Forward properties
  public voicemailEnabled: boolean;
  public callForwardAll: CallForwardAll;
  public callForwardBusy: CallForwardBusy;

  // Simultaneous Calls properties
  public incomingCallMaximum: number;

  // Caller Id Component Properties
  public callerIdOptions: Array<Object> = [];
  public callerIdSelected: Object;
  public customCallerIdName: string;
  public customCallerIdNumber: string;
  public blockedCallerId_label: string;
  public companyCallerId_label: string;
  public custom_label: string;

  //SharedLine Properties
  public selectedUser: SharedLineUser;
  public sharedLineEndpoints: SharedLineDevice[];
  public devices: string[];
  public sharedLineUsers: SharedLineUser[];
  public selectedUsers: SharedLineUser[];

  // Data from services
  public lineOverviewData: LineOverviewData;
  public lineOverviewDataCopy: LineOverviewData;

  /* @ngInject */
  constructor(
    private LineOverviewService: LineOverviewService,
    private LineService: LineService,
    private DirectoryNumberOptionsService: DirectoryNumberOptionsService,
    private $translate: ng.translate.ITranslateService,
    private $scope: ng.IScope,
    private $state,
    private $modal,
    private Notification,
    private Config
  ) {
    this.blockedCallerId_label = $translate.instant('callerIdPanel.blockedCallerId');
    this.companyCallerId_label = $translate.instant('callerIdPanel.companyCallerId');
    this.custom_label = 'Custom';
  }

  public $onInit(): void {
    this.initActions();
    this.initConsumerType();
    this.initDirectoryNumber();
    this.initCallForward();
    this.initCallerId();
  }

  private initActions(): void {
    this.actionList = [{
      actionKey: 'directoryNumberPanel.deleteLineTitle',
      actionFunction: () => {
        this.deleteLine();
      },
    }];
  }

  private initDirectoryNumber(): void {
    this.showExtensions = true;
    this.DirectoryNumberOptionsService.getInternalNumberOptions()
      .then(numbers => {
        this.internalNumbers = numbers;
        this.LineOverviewService.getLineOverviewData(this.consumerType, this.ownerId, this.numberId)
          .then(lineOverviewData => {
            this.lineOverviewData = lineOverviewData;
            this.lineOverviewDataCopy = this.cloneLineOverviewData(lineOverviewData);
            this.showActions = this.setShowActionsFlag(this.lineOverviewData.line);
            if (!this.lineOverviewData.line.uuid) { // new line, grab first available internal number
              this.lineOverviewData.line.internal = this.internalNumbers[0];
              this.form.$setDirty();
            }
          });
      });

    this.LineOverviewService.getEsnPrefix().then(esnPrefix => this.esnPrefix = esnPrefix);
    this.DirectoryNumberOptionsService.getExternalNumberOptions().then(numbers => this.externalNumbers = numbers);
  }

  private initCallForward(): void {
    this.voicemailEnabled = true;
    this.callForwardAll = new CallForwardAll();
    this.callForwardBusy = new CallForwardBusy();
  }

  public setDirectoryNumbers(internalNumber: string, externalNumber: string): void {
    this.lineOverviewData.line.internal = internalNumber;
    this.lineOverviewData.line.external = externalNumber;
  }

  public setCallForward(callForwardAll: CallForwardAll, callForwardBusy: CallForwardBusy): void {
    this.callForwardAll = callForwardAll;
    this.callForwardBusy = callForwardBusy;
  }

  public setSimultaneousCalls(incomingCallMaximum: number): void {
    this.lineOverviewData.line.incomingCallMaximum = incomingCallMaximum;
  }

  public setCallerId(callerIdSelected, callerIdName, callerIdNumber): void {
    this.customCallerIdName = callerIdName;
    this.customCallerIdNumber = callerIdNumber;
    this.callerIdSelected = callerIdSelected;
  }

  public onCancel(): void {
    if (!this.lineOverviewData.line.uuid) {
      this.$state.go(this.$state.$current.parent.name);
    } else {
      this.lineOverviewData = this.cloneLineOverviewData(this.lineOverviewDataCopy);
      this.resetForm();
    }
  }

  public getUserList(): User[] { ///TODO -- services
    let users: User[] = [];
    return users;
  }

  public selectSharedLineUser(userInfo: SharedLineUser): void {
    this.selectedUser = undefined;

    if (this.isValidSharedLineUser(userInfo)) {
      this.selectedUsers.push(userInfo);
      this.sharedLineUsers.push(userInfo);
    }
  }

  public saveLine() {
    this.saveInProcess = true;
    // TODO (jlowery): Figure out what exactly has changed and only update those things
    if (this.lineOverviewData.line.uuid) {
      this.LineOverviewService.updateLine(this.consumerType, this.ownerId, this.lineOverviewData.line.uuid, this.lineOverviewData.line)
        .then( () => {
          this.$scope.$emit(LINE_CHANGE);
          this.lineOverviewDataCopy = this.cloneLineOverviewData(this.lineOverviewData);
          this.Notification.success('directoryNumberPanel.success');
        })
        .catch( (response) => this.Notification.errorResponse(response, 'directoryNumberPanel.error'))
        .finally( () => {
          this.saveInProcess = false;
          this.resetForm();
        });
    } else {
      this.LineOverviewService.createLine(this.consumerType, this.ownerId, this.lineOverviewData.line)
        .then( (line) => {
          this.$scope.$emit(LINE_CHANGE);
          this.lineOverviewData.line = line;
          this.lineOverviewDataCopy = this.cloneLineOverviewData(this.lineOverviewData);
          this.showActions = this.setShowActionsFlag(line);
          this.Notification.success('directoryNumberPanel.success');
        })
        .catch( (response) => this.Notification.errorResponse(response, 'directoryNumberPanel.error'))
        .finally( () => {
          this.saveInProcess = false;
          this.resetForm();
        });
    }
  }

  public deleteLine() {
    this.deleteConfirmation = this.$translate.instant('directoryNumberPanel.deleteConfirmation', {
        line: this.lineOverviewData.line.internal,
        user: this.ownerName,
      });
    this.$modal.open({
      templateUrl: 'modules/huron/lines/lineOverview/lineDelete.html',
      scope: this.$scope,
      type: 'dialog',
    }).result.then( () => {
      if (!this.lineOverviewData.line.primary) {
        return this.LineService.deleteLine(this.consumerType, this.ownerId, this.lineOverviewData.line.uuid)
          .then( () => {
            this.$scope.$emit(LINE_CHANGE);
            this.Notification.success('directoryNumberPanel.disassociationSuccess');
            this.$state.go(this.$state.$current.parent.name);
          })
          .catch( (response) => this.Notification.errorResponse(response, 'directoryNumberPanel.error'));
      }
    });
  }

  private isValidSharedLineUser(userInfo: SharedLineUser): boolean {
    let isVoiceUser = false;
    let isValidUser = true;

    _.forEach(userInfo.entitlements, e => {

      if (e === this.Config.entitlements.huron) {
        isVoiceUser = true;
      }
    });

    if (!isVoiceUser || userInfo.uuid === this.$state.currentUser.id) {
      // Exclude users without Voice service to be shared line User
      // Exclude current user
      if (!isVoiceUser) {
        this.Notification.error('sharedLinePanel.invalidUser', {
          user: userInfo.name,
        });
      }
      isValidUser = false;
    }

    if (isValidUser) {
      // Exclude selection of already selected users
      _.forEach(this.selectedUsers, function (user) {
        if (user.uuid === userInfo.uuid) {
          isValidUser = false;
        }
      });
      if (isValidUser) {
        //Exclude current sharedLine users
        _.forEach(this.sharedLineUsers, function (user) {
          if (user.uuid === userInfo.uuid) {
            isValidUser = false;
          }
        });
      }
    }
    return isValidUser;
  }

  public isSingleDevice(): Boolean {
    return true;
  }

  public disassociateSharedLineUser(): void {

  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  private initCallerId(): void {
    this.callerIdOptions.push(new CallerIdOption(this.custom_label, new CallerIdConfig(null, '',  null, CUSTOM_COMPANY_TYPE)));
    this.callerIdOptions.push(new CallerIdOption(this.blockedCallerId_label, new CallerIdConfig(null, this.$translate.instant('callerIdPanel.blockedCallerIdDescription'), null, BLOCK_CALLERID_TYPE)));
  }

  private cloneLineOverviewData(lineOverviewData: LineOverviewData): LineOverviewData {
    return _.cloneDeep(lineOverviewData);
  }

  private setShowActionsFlag(line: Line): boolean {
    return (line.uuid && !line.primary);
  }

  private initConsumerType(): void {
    switch (this.ownerType) {
      case 'place': {
        this.consumerType = LineConsumerType.PLACES;
        break;
      }
      default: {
        this.consumerType = LineConsumerType.USERS;
      }
    }
  }
}

export class LineOverviewComponent implements ng.IComponentOptions {
  public controller = LineOverview;
  public templateUrl = 'modules/huron/lines/lineOverview/lineOverview.html';
  public bindings = <{ [binding: string]: string }>{
    ownerType: '@',
    ownerId: '@',
    ownerName: '@',
    numberId: '@',
  };
}
