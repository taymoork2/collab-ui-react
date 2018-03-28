import { IStateService } from 'angular-ui-router';
import { BulkAction, CsdmBulkService } from '../services/csdmBulk.service';
import { IComponentController, IComponentOptions } from 'angular';
import { Notification } from 'modules/core/notifications/notification.service';

class BulkDeleteCtrl implements IComponentController {
  private dismiss: Function;
  public title: string;
  private deleteEmptyPlaces: boolean;
  private reallyDelete: boolean;

  public get numberOfDevices() {
    return _.size(this.$state.params.selectedDevices);
  }

  /* @ngInject */
  constructor(private $state: IStateService,
              private CsdmBulkService: CsdmBulkService,
              private Notification: Notification,
              private $q) {
    this.title = this.$state.params.title;
  }

  public delete() {
    const bulkAction = new BulkAction(
      this.$q,
      this.CsdmBulkService,
      this.CsdmBulkService.delete.bind(this.CsdmBulkService,
        _.keys(this.$state.params.selectedDevices),
        this.deleteEmptyPlaces,
        this.reallyDelete),
      this.$state.params.devicesDeleted,
      this.$state.params.selectedDevices,
      'deviceBulk.deleted');
    this.$state.go('deviceBulkFlow.perform',
      {
        title: this.title,
        bulkAction: bulkAction,
      },
    );
  }

  public close() {
    this.dismiss();
    this.Notification.warning('deviceBulk.deletionCompletedXDeleted',
      {
        nDevices: '0',
        nTotalDevices: _.size(this.$state.params.selectedDevices),
      },
      'deviceBulk.deletionStoppedTitle');
  }
}

export class BulkDeleteComponent implements IComponentOptions {
  public controller = BulkDeleteCtrl;
  public template = require('modules/csdm/bulk/bulkDelete.html');
  public bindings = {
    dismiss: '&',
  };
}
