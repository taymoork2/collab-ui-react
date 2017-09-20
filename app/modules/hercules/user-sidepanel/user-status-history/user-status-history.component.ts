import includes = require('lodash/includes');
import filter = require('lodash/filter');
import { Notification } from 'modules/core/notifications';
import map = require('lodash/map');
import forEach = require('lodash/forEach');
import find = require('lodash/find');
import take = require('lodash/take');
import some = require('lodash/some');
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { USSService } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';

class UserStatusHistoryCtrl implements ng.IComponentController {
  public readonly numEntriesToShow = 20;
  public serviceId: HybridServiceId;
  public historyEntries: any[];
  private readonly userId;
  private readonly eventTypes = ['AddEntitlement', 'RemoveEntitlement', 'AddUserResourceGroup', 'RemoveUserResourceGroup', 'SetUserStatus'];

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private Authinfo,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private Notification: Notification,
    private ResourceGroupService: ResourceGroupService,
    private USSService: USSService,
  ) {
    this.userId = (this.$stateParams.currentUser && this.$stateParams.currentUser.id) || this.$stateParams.currentPlace.cisUuid;
    this.historyEntries = [];
  }

  public $onChanges() {
    this.USSService.getUserJournal(this.userId, this.Authinfo.getOrgId(), 100, this.serviceId)
      .then(entries => {
        const filteredEntries = filter(<any[]>entries, entry => {
          return includes(this.eventTypes, entry.entry.type) && entry.entry.payload.serviceId === this.serviceId;
        });
        this.historyEntries = map(take(filteredEntries, this.numEntriesToShow), this.decorateEntry.bind(this));
        this.setHomedConnectors();
        this.setResourceGroups();
      }).catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  private decorateEntry(e) {
    const entry = e.entry;
    entry.timestamp = this.HybridServicesI18NService.getLocalTimestamp(e.time, 'lll (z)');
    if (entry.type === 'SetUserStatus') {
      entry.payload.entitled = true;
      entry.status = this.USSService.decorateWithStatus(entry.payload);
    }
    return entry;
  }

  private setHomedConnectors() {
    if (some(this.historyEntries, entry => { return entry.payload.clusterId; })) {
      this.HybridServicesClusterService.getAll()
        .then(clusterList => {
          forEach(this.historyEntries, entry => {
            entry.homedCluster = find(clusterList, { id: entry.payload.clusterId });
            if (entry.homedCluster) {
              entry.homedConnector = find(entry.homedCluster.connectors, { id: entry.payload.connectorId });
            }
          });
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }
  }

  private setResourceGroups() {
    const addResourceGroupEntries = filter(this.historyEntries, entry => {
      return entry.type === 'AddUserResourceGroup';
    });
    if (addResourceGroupEntries.length === 0) {
      return;
    }
    this.ResourceGroupService.getAll().then(resourceGroups => {
      forEach(addResourceGroupEntries, entry => {
        entry.resourceGroup = find(<any[]>resourceGroups, group => {
          return group.id === entry.payload.resourceGroupId;
        });
      });
    }).catch(error =>  {
      this.Notification.errorWithTrackingId(error, 'firstTimeWizard.fmsResourceGroupsLoadFailed');
    });
  }
}

export class UserStatusHistoryComponent implements ng.IComponentOptions {
  public controller = UserStatusHistoryCtrl;
  public template = require('modules/hercules/user-sidepanel/user-status-history/user-status-history.html');
  public bindings = {
    serviceId: '<',
  };
}
