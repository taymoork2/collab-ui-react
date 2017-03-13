import includes = require('lodash/includes');
import filter = require('lodash/filter');
import { Notification } from 'modules/core/notifications';
import map = require('lodash/map');
import forEach = require('lodash/forEach');
import find = require('lodash/find');
import take = require('lodash/take');
import some = require('lodash/some');

class UserStatusHistoryCtrl implements ng.IComponentController {
  public readonly numEntriesToShow = 20;
  public serviceId: string;
  public historyEntries: any[];
  private readonly userId;
  private readonly eventTypes = ['AddEntitlement', 'RemoveEntitlement', 'AddUserResourceGroup', 'RemoveUserResourceGroup', 'SetUserStatus'];

  /* @ngInject */
  constructor(
    private USSService,
    private $stateParams,
    private Authinfo,
    private Notification: Notification,
    private HybridServicesUtils,
    private FusionClusterService,
    private ResourceGroupService,
  ) {
    this.userId = (this.$stateParams.currentUser && this.$stateParams.currentUser.id) || this.$stateParams.currentPlace.cisUuid;
    this.historyEntries = [];
  }

  public $onChanges() {
    this.USSService.getUserJournal(this.userId, this.Authinfo.getOrgId(), 100, this.serviceId)
      .then(entries => {
        let filteredEntries = filter(<any[]>entries, entry => {
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
    let entry = e.entry;
    entry.timestamp = this.HybridServicesUtils.getLocalTimestamp(e.time, 'lll (z)');
    if (entry.type === 'SetUserStatus') {
      entry.payload.entitled = true;
      entry.status = this.USSService.decorateWithStatus(entry.payload);
    }
    return entry;
  }

  private setHomedConnectors() {
    if (some(this.historyEntries, entry => { return entry.payload.clusterId; })) {
      this.FusionClusterService.getAll()
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
    let addResourceGroupEntries = filter(this.historyEntries, entry => {
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
  public templateUrl = 'modules/hercules/user-sidepanel/user-status-history/user-status-history.html';
  public bindings = {
    serviceId: '<',
  };
}
