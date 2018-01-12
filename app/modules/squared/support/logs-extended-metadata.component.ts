import './logs-extended-metadata.scss';

class LogsExtendedMetadataCtrl implements ng.IComponentController {

  public metadata;

  /* @ngInject*/
  constructor(
    private Notification,
  ) {}

  public $onInit () {
    this.populate();
  }

  private populate (): void {
    this.metadata = JSON.stringify(this.metadata, null, 4);
  }

  public clipboardSuccess (): void {
    this.Notification.success('common.copiedToClipboard');
  }

  public clipboardError(e): void {
    this.Notification.error('common.unableToCopy');
    e.clearSelection();
  }
}
/**
 * Logs Extended Metadata Component used for expanding log json
 */
export class LogsExtendedMetadata implements ng.IComponentOptions {
  public controller = LogsExtendedMetadataCtrl;
  public template = require('./logs-extended-metadata.tpl.html');
  public bindings = {
    dismiss: '&', // used in html
    metadata: '<',
  };
}

export default angular
  .module('Squared')
  .component('logsExtendedMetadata', new LogsExtendedMetadata());
