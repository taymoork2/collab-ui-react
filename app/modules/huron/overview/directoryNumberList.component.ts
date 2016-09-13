export interface IDirectoryNumber {
  dnUsage: string,
  uuid: string,
  pattern: string,
  userDnUuid?: string,
  altDnUuid?: string,
  altDnPattern?: string,
  dnSharedUsage?: string
}

class DirectoryNumberListCtrl {

  public numberOfLines: number=5;
  public directoryNumbers: Array<Object>;

  public showMoreClicked(): void {
    this.numberOfLines = undefined;
  }

  public showLessClicked(): void {
    this.numberOfLines = 5;
  }

  public showMoreButton(): boolean {
    return (this.directoryNumbers.length > 5 && this.numberOfLines == 5);
  }

  public showLessButton(): boolean {
    return (this.directoryNumbers.length > 5 && this.numberOfLines == undefined);
  }
}

angular
  .module('Huron')
  .component('directoryNumberList', {
    templateUrl: 'modules/huron/overview/directoryNumberList.html',
    controller: DirectoryNumberListCtrl,
    bindings: {
      directoryNumbers: '<',
      directoryNumberSref: '@',
    },
  })
