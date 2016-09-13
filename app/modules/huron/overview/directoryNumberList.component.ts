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
  public hideShowMoreButton: boolean=false;

  public showMoreClicked(): void {
    this.hideShowMoreButton = true;
    this.numberOfLines = undefined;
  }

  public showMoreButton(): boolean {
    if (this.directoryNumbers.length > this.numberOfLines && !this.hideShowMoreButton)
      return true;
    else
      return false;
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
