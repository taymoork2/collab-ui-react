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
  public isDiabled: boolean = false;
  public onlinenode: boolean = false;
  public offlinenode: boolean = false;
  public iponlineCheck: string = '';
  public ipofflineCheck: string = '';
  public selectedCluster: string = '';
  public selectPlaceHolder: string;
  public clusterExist: boolean = false;
  public clusterExistError: string;
  private onClusterNameUpdate?: Function;
  private onClusterListUpdate?: Function;
  private onHostNameUpdate?: Function;

  public $onInit(): void {
    this.AddResourceSectionService.updateClusterLists().then((clusterList) => {
      this.clusterList = clusterList;
      if (_.isFunction(this.onClusterListUpdate)) {
        this.onClusterListUpdate({ response: { clusterlist: this.clusterList } });
      }
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
    });
    if (this.clusterList.length === 0) {
      this.isDiabled = true;
      this.selectPlaceHolder = this.$translate.instant('mediaFusion.easyConfig.noCluster');
    } else {
      this.isDiabled = false;
      this.selectPlaceHolder = this.$translate.instant('mediaFusion.easyConfig.existingCluster');
    }
    this.onlineNodeList = this.AddResourceSectionService.onlineNodes();
    this.offlineNodeList = this.AddResourceSectionService.offlineNodes();
  }

  public validateHostName() {
    if (_.isFunction(this.onHostNameUpdate)) {
      this.onHostNameUpdate({ response: { hostName: this.hostName } });
    }
    if (_.includes(this.onlineNodeList, this.hostName)) {
      this.onlinenode = true;
      this.offlinenode = false;
    } else if (_.includes(this.offlineNodeList, this.hostName)) {
      this.onlinenode = false;
      this.offlinenode = true;
    } else {
      this.onlinenode = false;
      this.offlinenode = false;
    }
  }

  public validateClusterName () {
    if (_.isFunction(this.onClusterNameUpdate)) {
      this.onClusterNameUpdate({ response: { clusterName: this.enteredCluster } });
    }
    return this.clusterExist = (_.includes(this.clusterList, this.enteredCluster)) ? true : false;
  }

}

export class AddResourceSectionComponent implements ng.IComponentOptions {
  public controller = AddResourceSectionController;
  public template = require('./add-resource-section.tpl.html');
  public bindings = {
    onClusterListUpdate: '&?',
    onClusterNameUpdate: '&?',
    onHostNameUpdate: '&?',
  };
}
