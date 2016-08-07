class DirectoryNumberCtrl {

  private $onInit(): void {

  }
}

export default angular
  .module('huron.directory-number', [

  ])
  .component('directoryNumber', {
    controller: DirectoryNumberCtrl,
    templateUrl: 'modules/huron/lines/directoryNumber/directoryNumber.tpl.html',
    bindings: {
    },
  })
  .name;
