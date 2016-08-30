import directoryNumber from '../../directoryNumber/directoryNumber.component';
import callForward from '../../callForward/callForward.component';
import simultaneousCalls from '../../simultaneousCalls/simultaneousCalls.component';
import {
  CallForwardAll,
  CallForwardBusy
} from '../../callForward/callForward';
import callerId from '../../callerId/callerId.component';
import { BLOCK_CALLERID_TYPE, 
  DIRECT_LINE_TYPE, 
  COMPANY_CALLERID_TYPE, 
  CUSTOM_COMPANY_TYPE } from '../../callerId/callerId';

import sharedLine from '../../sharedLine/sharedLine.component';
import {
  SharedLineUser,
  User,
  SharedLineDevice,
} from '../../sharedLine/sharedLine';

interface IDirectoryNumber {
  uuid: string,
  pattern: string,
}

class LineOverviewCtrl {

  static CISCOUC: string = 'ciscouc';
  public form: ng.IFormController;

  // Directory Number properties
  public esnPrefix: string;
  public internalIsWarn: boolean;
  public internalNumber: IDirectoryNumber;
  public internalOptions: IDirectoryNumber[];
  public internalWarnMsg: string;
  public externalNumber: IDirectoryNumber;
  public externalOptions: IDirectoryNumber[];
  public showExtensions: boolean;

  // Call Forward properties
  public voicemailEnabled: boolean;
  public callForwardAll: CallForwardAll;
  public callForwardBusy: CallForwardBusy;

  // Simultaneous Calls properties
  public incomingCallMaximum: number = 8;
  
  //callerId Component Properties
  public callerIdOptions: Array<Object> = [];
  public callerIdSelected: Object;
  public customCallerIdName: string;
  public customCallerIdNumber: string;
  public blockedCallerId_label: string;
  public companyCallerId_label: string;
  public custom_label: string;

  //SharedLine
  public selected: SharedLineUser = undefined;
  public sharedLineEndpoints: SharedLineDevice[];
  public devices: string[];
  public sharedLineUsers: SharedLineUser[];
  public selectedUsers: SharedLineUser[];
  //SharedLine

  public translate: ng.translate.ITranslateService;

  constructor(private CallerId, private $translate) {
    this.blockedCallerId_label = $translate.instant('callerIdPanel.blockedCallerId');
    this.companyCallerId_label = $translate.instant('callerIdPanel.companyCallerId');
    this.custom_label = 'Custom';
    this.translate = $translate;
  }

  private $onInit(): void {
    this.initDirectoryNumber();
    this.initCallForward();
    this.initCallerId();
  }

  private initDirectoryNumber(): void {
    this.showExtensions = true;
  }

  private initCallForward(): void {
    this.voicemailEnabled = true;
    this.callForwardAll = new CallForwardAll();
    this.callForwardBusy = new CallForwardBusy();
  }

  public setDirectoryNumbers(internalNumber: IDirectoryNumber, externalNumber: IDirectoryNumber): void {
    this.internalNumber = internalNumber;
    this.externalNumber = externalNumber;
  }

  public resetLineSettings(): void {
    this.resetForm();
  }

  public setCallForward(callForwardAll: CallForwardAll, callForwardBusy: CallForwardBusy): void {
    this.callForwardAll = callForwardAll;
    this.callForwardBusy = callForwardBusy;
  }

  public setSimultaneousCalls(incomingCallMaximum: number): void {
    this.incomingCallMaximum = incomingCallMaximum;
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
    this.callerIdOptions.push(this.CallerId.constructCallerIdOption(this.blockedCallerId_label, BLOCK_CALLERID_TYPE, this.translate.instant('callerIdPanel.blockedCallerIdDescription'), '', null));
  }

  public updateCallerId(callerIdSelected, callerIdName, callerIdNumber): void {
    this.customCallerIdName = callerIdName;
    this.customCallerIdNumber = callerIdNumber;
    this.callerIdSelected = callerIdSelected;
  }
}

export default angular
  .module('huron.line-overview', [
    directoryNumber,
    callForward,
    simultaneousCalls,
    callerId,
    sharedLine,
  ])
  .component('lineOverview', {
    controller: LineOverviewCtrl,
    templateUrl: 'modules/huron/lines/lineOverview/lineOverview.tpl.html',
    bindings: {
      ownerType: '@',
    },
  })
  .name;
