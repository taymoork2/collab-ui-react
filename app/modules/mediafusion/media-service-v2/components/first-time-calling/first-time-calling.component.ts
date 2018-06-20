import { IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { FirstTimeCallingService } from './first-time-calling.service';
import * as moment from 'moment';

export class FirstTimeCallingController implements ng.IComponentController {

  public clusterState: string;
  public clusterName: string;
  public clusterStateValue: string;
  public clusterStateMsg: string;
  public callType: string;
  public callTypeUrl: string;
  public caller: string;
  public callee: string;
  public callParticipants: string [] = [];
  public callStartTime: string;
  public loading: boolean = false;
  public callExists: boolean = false;
  public retry: boolean = false;

  /* @ngInject */
  constructor(
    private $modalInstance: ng.ui.bootstrap.IModalInstanceService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private FirstTimeCallingService: FirstTimeCallingService,
    public cluster: IExtendedClusterFusion,
    public spark: boolean,
  ) { this.$onInit(); }

  public headerOptions = [{
    value: 0,
    label: this.$translate.instant('mediaFusion.easyConfig.testsparkcalls'),
  }, {
    value: 1,
    label: this.$translate.instant('mediaFusion.easyConfig.verifysipcalls'),
  }];
  public participant = this.$translate.instant('mediaFusion.easyConfig.participant');
  public headerSelected = this.headerOptions[0];

  public $onInit() {
    if (this.spark) {
      this.headerSelected = this.headerOptions[0];
      this.callType = 'Cisco Webex';
      this.callTypeUrl = 'SPARK';
    } else {
      this.headerSelected = this.headerOptions[1];
      this.callType = 'SIP';
      this.callTypeUrl = 'CMR';
    }
    this.clusterName = this.cluster.name.replace(/\W/g, '').toLowerCase();
    this.clusterStatus();
  }

  public clusterStatus() {
    if (this.cluster.extendedProperties.maintenanceMode === 'on') {
      this.clusterStateValue = 'maintain';
      this.clusterStateMsg = this.$translate.instant('mediaFusion.easyConfig.mainteancemodemsg', {
        callType: this.callType,
      });
    } else if (this.cluster.extendedProperties.upgradeState === 'upgrading') {
      this.clusterStateValue = 'upgrading';
      this.clusterStateMsg = this.$translate.instant('mediaFusion.easyConfig.upgrademsg');
    } else {
      this.clusterState = this.cluster.extendedProperties.servicesStatuses[0].state.name;
    }

    if (this.clusterState === 'operational') {
      this.clusterStateValue = 'operational';
      this.clusterStateMsg = '';
      this.loading = true;
      this.firstTimeCallDetails();
    } else if (this.clusterState === 'impaired') {
      _.forEach(this.cluster.connectors, (connector) => {
        if ('running' === connector.state) {
          this.clusterStateValue = 'operational';
          this.clusterStateMsg = '';
          this.loading = true;
          this.firstTimeCallDetails();
        } else {
          this.clusterStateValue = 'outage';
        }
      });
    } else {
      this.clusterStateValue = 'outage';
      this.clusterStateMsg = this.$translate.instant('mediaFusion.easyConfig.unoperationalmsg', {
        callType: this.callType,
      });
    }
  }

  public firstTimeCallDetails() {
    this.FirstTimeCallingService.getServiceStatus(this.clusterName, this.callTypeUrl).then(response => {
      if (response.callStartTime !== '') {
        this.callStartTime = moment.utc(response.callStartTime).format('YYYY-MM-DD HH:mm:ss');
        this.callStartTime = this.callStartTime + ' ' + this.$translate.instant('mediaFusion.easyConfig.utc');
      }
      this.callParticipants = response.clientTypes;
    })
      . finally( () => {
        if (this.callParticipants.length === 0 && !this.retry) {
          this.$timeout( () => {
            this.retry = true;
            this.firstTimeCallDetails();
          }, 60000);
        } else if (this.callParticipants.length !== 0) {
          this.loading = false;
          this.callExists = true;
        } else if (this.callParticipants.length === 0 && this.retry) {
          this.callParticipants.length = 5;
          this.loading = false;
          this.callExists = false;
        }
      });
  }

  public closeSetupModal() {
    this.$modalInstance.dismiss();
  }

}

export class FirstTimeCallingComponent implements ng.IComponentOptions {
  public controller = FirstTimeCallingController;
  public template = require('./first-time-calling.html');
}
