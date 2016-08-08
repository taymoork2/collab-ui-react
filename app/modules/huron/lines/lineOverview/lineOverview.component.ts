import directoryNumber from '../directoryNumber/directoryNumber.component';

class LineOverviewCtrl {

  private $onInit(): void {

  }
}

export default angular
  .module('huron.line-overview', [
    directoryNumber,
  ])
  .component('lineOverview', {
    controller: LineOverviewCtrl,
    templateUrl: 'modules/huron/lines/lineOverview/lineOverview.tpl.html',
    bindings: {
      ownerType: '@',
    },
  })
  .name;
