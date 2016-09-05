import simultaneousCalls from '../../simultaneousCalls';
import { CallForwardAll, CallForwardBusy } from '../../callForward/callForward';
import { BLOCK_CALLERID_TYPE, DIRECT_LINE_TYPE, COMPANY_CALLERID_TYPE, CUSTOM_COMPANY_TYPE } from '../../callerId';
import { SharedLineUser, User, SharedLineDevice } from '../../sharedLine/sharedLine';
import { LineService, LineConsumerType } from '../services';
import { LineOverviewService, LineOverviewData } from './index';
import { DirectoryNumberOptionsService } from '../../directoryNumber';

interface IDirectoryNumber {
  uuid: string,
  pattern: string,
}

class LineOverview {
  private ownerType: string;
  private ownerId: string;
  private numberId: string;
  private consumerType: LineConsumerType;

  static CISCOUC: string = 'ciscouc';
  public form: ng.IFormController;
  public saveInProcess: boolean = false;

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

  //Shared Line Properties
  public selected: SharedLineUser = undefined;
  public sharedLineEndpoints: SharedLineDevice[];
  public devices: string[];
  public sharedLineUsers: SharedLineUser[];
  public selectedUsers: SharedLineUser[];


  public translate: ng.translate.ITranslateService;

  // Data from services
  public lineOverviewData: LineOverviewData;
  public LineOverviewDataCopy: LineOverviewData;

  /* @ngInject */
  constructor(
    private LineOverviewService: LineOverviewService,
    private DirectoryNumberOptionsService: DirectoryNumberOptionsService,
    private $translate: ng.translate.ITranslateService,
    private $state,
    private CallerId,
    private Notification
  ) {
    this.blockedCallerId_label = $translate.instant('callerIdPanel.blockedCallerId');
    this.companyCallerId_label = $translate.instant('callerIdPanel.companyCallerId');
    this.custom_label = 'Custom';
  }

  private $onInit(): void {
    this.initConsumerType();
    this.initDirectoryNumber();
    this.initCallForward();
    this.initCallerId();
  }

  private initDirectoryNumber(): void {
    this.showExtensions = true;
    this.DirectoryNumberOptionsService.getInternalNumberOptions()
      .then(numbers => {
        this.internalNumbers = numbers;
        this.LineOverviewService.getLineOverviewData(this.consumerType, this.ownerId, this.numberId)
          .then(lineOverviewData => {
            this.lineOverviewData = lineOverviewData;
            // TODO (jlowery): Put this caching mechanism into a function.
            this.LineOverviewDataCopy = _.cloneDeep<LineOverviewData>(lineOverviewData);
            if (!this.lineOverviewData.line.uuid) { // new line, grab first available internal number
              this.lineOverviewData.line.internal = this.internalNumbers[0];
              this.form.$setDirty();
            }
          });
      })

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
      // TODO (jlowery): Put this caching mechanism into a function.
      this.lineOverviewData = _.cloneDeep<LineOverviewData>(this.LineOverviewDataCopy);
      this.resetForm();
    }
  }

  public getUserName(name: { givenName: string, familyName: string }, userId: string): string {
    var userName = '';
    userName = (name && name.givenName) ? name.givenName : '';
    userName = (name && name.familyName) ? (userName + ' ' + name.familyName).trim() : userName;
    userName = userName || userId;
    return userName;
  }

  public getUsersList(filter: string): User[] { ///TODO -- services
    var users: User[] = [];
    return users;
  }

  public selectSharedLineUser(user: User): void {
    var userInfo = {
      'uuid': user.uuid,
      'userName': user.userName,
      'userDnUuid': 'none',
      'entitlements': user.entitlements,
      'dnUsage': '',
      'name': this.getUserName(user.name, user.userName),
    };
    this.selected = undefined;

    if (this.isValidSharedLineUser(userInfo)) {
      this.selectedUsers.push(userInfo);
      this.sharedLineUsers.push(userInfo);
    }
  }

  private isValidSharedLineUser(userInfo: SharedLineUser): boolean {
    var isVoiceUser = false;
    var isValidUser = true;

    angular.forEach(userInfo.entitlements, function (e) {

      if (e === this.CISCOUC) {
        isVoiceUser = true;
      }
    });
    //TODO
    // if (!isVoiceUser || userInfo.uuid == this.currentUser.id) {
    //   // Exclude users without Voice service to be shared line User
    //   // Exclude current user
    //   if (!isVoiceUser) {
    //     Notification.error('sharedLinePanel.invalidUser', {
    //       user: userInfo.name
    //     });
    //   }
    //   isValidUser = false;
    // }
    if (isValidUser) {
      // Exclude selection of already selected users
      angular.forEach(this.selectedUsers, function (user) {
        if (user.uuid === userInfo.uuid) {
          isValidUser = false;
        }
      });
      if (isValidUser) {
        //Exclude current sharedLine users
        angular.forEach(this.sharedLineUsers, function (user) {
          if (user.uuid === userInfo.uuid) {
            isValidUser = false;
          }
        });
      }
    }
    return isValidUser;
  }

  private resetForm(): void {
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  private initCallerId(): void {
    this.callerIdOptions.push(this.CallerId.constructCallerIdOption(this.custom_label, CUSTOM_COMPANY_TYPE, '', null));
    this.callerIdOptions.push(this.CallerId.constructCallerIdOption(this.blockedCallerId_label, BLOCK_CALLERID_TYPE, this.$translate.instant('callerIdPanel.blockedCallerIdDescription'), '', null));
  }

  public saveLineSettings() {
    this.saveInProcess = true;
    // TODO (jlowery): Figure out what exactly has changed and only update those things
    this.LineOverviewService.updateLine(this.consumerType, this.ownerId, this.numberId, this.lineOverviewData.line)
      .then( () => this.Notification.success('directoryNumberPanel.success'))
      .catch( (response) => this.Notification.errorResponse(response, 'directoryNumberPanel.error'))
      .finally( () => {
        this.saveInProcess = false;
        this.resetForm();
      });
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
  public bindings: {[binding: string]: string} = {
    ownerType: '@',
    ownerId: '@',
    numberId: '@',
  };
}
