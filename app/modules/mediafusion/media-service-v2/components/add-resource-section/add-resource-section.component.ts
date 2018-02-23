import { AddResourceSectionService } from './add-resource-section.service';
import { Notification } from 'modules/core/notifications/notification.service';

export class AddResourceSectionController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private AddResourceSectionService: AddResourceSectionService,
    private Notification: Notification,
  ) { }

  public addResourceSection = {
    title: 'common.cluster',
  };

  public clusterList: string[] = [];
  public form: ng.IFormController;
  public onlineNodeList: string[] = [];
  public offlineNodeList: string[] = [];
  public enteredCluster: string = '';
  public hostName: string = '';
  public helpText: string;
  public ipCheck: string;
  public ipError: boolean = false;
  public iponlineCheck: string = '';
  public ipofflineCheck: string = '';
  public selectedCluster: string = '';
  public selectPlaceHolder: string;
  public clusterExist: boolean = false;
  public clusterExistError: string;
  private onClusterUpdate?: Function;
  private onDataUpdate?: Function;
  private onHostUpdate?: Function;

  public $onInit(): void {
    //this.firstTimeSetup = (this.$state.current.name === 'services-overview');
    this.selectPlaceHolder = this.$translate.instant('mediaFusion.easyConfig.existingCluster');
    this.AddResourceSectionService.updateClusterLists().then((clusterList) => {
      this.clusterList = clusterList;
      if (_.isFunction(this.onDataUpdate)) {
        this.onDataUpdate({ someData: { clusterlist: this.clusterList } });
      }
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
    });
    this.onlineNodeList = this.AddResourceSectionService.onlineNodes();
    this.offlineNodeList = this.AddResourceSectionService.offlineNodes();
    /*this.$q.all({
      proPackEnabled: this.ProPackService.hasProPackPurchased(),
    }).then((toggles) => {
      this.proPackEnabled = toggles.proPackEnabled;
    });*/
  }

  public validateHostName() {
    if (_.isFunction(this.onHostUpdate)) {
      this.onHostUpdate({ someData: { hostName: this.hostName } });
    }
    if ((this.onlineNodeList.indexOf(this.hostName) > -1)) {
      this.iponlineCheck = this.$translate.instant('mediaFusion.add-resource-dialog.serverOnline');
      this.ipError = true;
    } else if ((this.offlineNodeList.indexOf(this.hostName) > -1)) {
      this.iponlineCheck = this.$translate.instant('mediaFusion.add-resource-dialog.serverOffline');
      this.ipError = true;
    } else {
      this.ipError = false;
      this.ipCheck = '';
    }
  }

  public validateClusterName() {
    if (_.isFunction(this.onClusterUpdate)) {
      this.onClusterUpdate({ someData: { clusterName: this.enteredCluster } });
    }
    if ((this.clusterList.indexOf(this.enteredCluster) > -1)) {
      this.clusterExist = true;
      this.clusterExistError = this.$translate.instant('mediaFusion.easyConfig.clusterExistError');
    } else {
      this.clusterExist = false;
      this.helpText = this.$translate.instant('mediaFusion.easyConfig.clusterHelpText');
    }
  }

}

export class AddResourceSectionComponent implements ng.IComponentOptions {
  public controller = AddResourceSectionController;
  public template = require('./add-resource-section.tpl.html');
  public bindings = {
    onDataUpdate: '&?',
    onHostUpdate: '&?',
    onClusterUpdate: '&?',
  };
}
