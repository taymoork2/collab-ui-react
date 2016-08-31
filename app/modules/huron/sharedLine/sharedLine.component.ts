import {
  SharedLineUser,
  User,
  SharedLineDevice,
} from './sharedLine';

class SharedLineCtrl {
  public selected: SharedLineUser;
  public sharedLineUsers: SharedLineUser[];
  public sharedLineEndpoints: SharedLineDevice[];
  public oneAtATime: boolean = true;

  public selectSharedLineUserFn: Function;
  public getUserListFn: Function;
  public isSingleDeviceFn: Function;
  public disassociateSharedLineUserFn: Function;

  public getUserList(filter: string): void {
    this.getUserListFn({
      viewValue: filter,
    });
  }

  public selectSharedLineUser(user: User): void {
    this.selectSharedLineUserFn({
      user: user,
    });
  }

  public isSingleDevice(userUuid: string): boolean {
    return this.isSingleDeviceFn({
      sharedLineEndpoints: this.sharedLineEndpoints,
      uuid: userUuid,
    })
  }

  public disassociateSharedLineUser(user: SharedLineUser, batchDelete: boolean): void {
    this.disassociateSharedLineUserFn({
      userInfo: user,
      batchDelete: batchDelete
    })
  }
}

class SharedLineComponent implements ng.IComponentOptions {
  public controller = SharedLineCtrl;
  public templateUrl = 'modules/huron/sharedLine/sharedLine.html';
  public bindings: { [binding: string]: string } = {
    selected: '<',
    sharedLineUsers: '<',
    sharedLineEndpoints: '<',
    oneAtATime: '<',
    selectSharedLineUserFn: '&',
    getUserListFn: '&',
    isSingleDeviceFn: '&',
    disassociateSharedLineUserFn: '&'
  };

}

export default angular
  .module('huron.shared-line', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
  ])
  .component('ucSharedLine', new SharedLineComponent())
  .name;