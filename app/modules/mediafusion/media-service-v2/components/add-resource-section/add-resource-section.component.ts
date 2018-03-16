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
  public validNodeCheck: boolean = true;
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
      if (this.clusterList.length === 0) {
        this.isDiabled = true;
        this.selectPlaceHolder = this.$translate.instant('mediaFusion.easyConfig.noCluster');
      } else {
        this.isDiabled = false;
        this.selectPlaceHolder = this.$translate.instant('mediaFusion.easyConfig.existingCluster');
      }
    }).catch((error) => {
      this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
    });
    this.onlineNodeList = this.AddResourceSectionService.onlineNodes();
    this.offlineNodeList = this.AddResourceSectionService.offlineNodes();
  }

  public validateHostName() {
    this.validNodeCheck = (this.validateNode(this.hostName));
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
    if (_.isFunction(this.onHostNameUpdate)) {
      this.onHostNameUpdate({ response: { hostName: this.hostName, validNode: this.validNodeCheck, onlineNode: this.onlinenode, offlineNode: this.offlinenode  } });
    }
  }

  private validateNode(ip) {
    if (ip === '') {
      return true;
    } else {
      const regex = new RegExp(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|((?!:\/\/)([a-zA-Z0-9-]+\.)?[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}))$/g);
      return regex.test(ip);
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
