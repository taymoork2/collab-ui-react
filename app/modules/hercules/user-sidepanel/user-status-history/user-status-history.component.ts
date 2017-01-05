import includes = require('lodash/includes');
import filter = require('lodash/filter');
import { Notification } from 'modules/core/notifications';
import map = require('lodash/map');
import uniq = require('lodash/uniq');
import forEach = require('lodash/forEach');
import find = require('lodash/find');
import take = require('lodash/take');

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
    private FusionUtils,
    private ClusterService,
    private ResourceGroupService,
  ) {
    this.userId = this.$stateParams.currentUser.id;
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
    entry.timestamp = this.FusionUtils.getLocalTimestamp(e.time, 'lll (z)');
    if (entry.type === 'SetUserStatus') {
      entry.payload.entitled = true;
      entry.status = this.USSService.decorateWithStatus(entry.payload);
    }
    return entry;
  }

  private setHomedConnectors() {
    let uniqueConnectorIds = uniq(map(this.historyEntries, entry => {
      return entry.payload.connectorId;
    }));
    forEach(uniqueConnectorIds, connectorId => {
      if (connectorId) {
        this.ClusterService.getConnector(connectorId).then(connector => {
          forEach(this.historyEntries, entry => {
            if (entry.payload.connectorId === connectorId) {
              entry.homedConnector = connector;
            }
          });
        });
      }
    });
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
