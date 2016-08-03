export interface IDirectoryNumber {
  dnUsage: string,
  uuid: string,
  pattern: string,
  userDnUuid: string,
  altDnUuid: string,
  altDnPattern: string,
  dnSharedUsage: string
}

class DirectoryNumberListCtrl {}

angular
  .module('Huron')
  .component('directoryNumberList', {
    templateUrl: 'modules/huron/overview/directoryNumberList.tpl.html',
    controller: DirectoryNumberListCtrl,
    bindings: {
      directoryNumbers: '<'
    }
  })
