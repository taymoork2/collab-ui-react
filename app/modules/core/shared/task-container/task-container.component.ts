export class TaskContainerComponent implements ng.IComponentOptions {
  public template = require('./task-container.html');
  public transclude = {
    details: 'taskContainerDetails',
    panelList: 'taskContainerPanelList',
    panelHeader: '?taskContainerPanelHeader',
  };
}
