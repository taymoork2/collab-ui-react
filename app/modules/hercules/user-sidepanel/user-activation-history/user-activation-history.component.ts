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
import { USSService, IUserAssignment } from 'modules/hercules/services/uss.service';
import { HybridServiceId, IConnector } from 'modules/hercules/hybrid-services.types';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';

class UserActivationHistoryCtrl implements ng.IComponentController {
  public readonly numEntriesToShow = 30;
  public serviceId: HybridServiceId;
  public historyEntries: any[];
  private readonly userId;
  private readonly eventTypes = ['UpdateConfigureStatus', 'DeleteUserAssignment', 'DeleteUserService', 'AddUserService', 'SetAssignmentState', 'UpdateDiscoverStatus', 'AssignUser', 'UpdateUserStatus', 'SetUserActivationRetry', 'RequestUserReactivation', 'UpdateUserResourceGroupWithReactivate', 'UpdateUserResourceGroup', 'DeleteUserResourceGroup', 'DeleteUserResourceGroupWithReactivate'];

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
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
    this.USSService.getUserActivationHistory(this.userId, this.Authinfo.getOrgId(), 100, this.serviceId)
      .then(entries => {
        const filteredEntries = filter(<any[]>entries, entry => {
          return includes(this.eventTypes, entry.record.payload.type) && entry.record.payload.service === this.serviceId;
        });
        this.historyEntries = map(take(filteredEntries, this.numEntriesToShow), this.decorateRecord.bind(this));
        this.decorateAssignments();
        this.setResourceGroups();
      }).catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  private decorateRecord(e) {
    const entry = e.record;
    entry.timestamp = this.HybridServicesI18NService.getLocalTimestamp(e.time, 'lll (z)');
    switch (entry.payload.type) {
      case 'UpdateUserStatus':
        entry.payload.entitled = true;
        entry.title = this.$translate.instant('hercules.userActivationHistory.types.UpdateUserStatus', {
          status: this.$translate.instant('hercules.activationStatus.' + this.USSService.decorateWithStatus(entry.payload)),
        });
        break;
      case 'SetUserActivationRetry':
        entry.title = this.$translate.instant('hercules.userActivationHistory.types.SetUserActivationRetry', {
          retryAt: this.HybridServicesI18NService.getLocalTimestamp(entry.payload.retryAt, 'lll (z)'),
        });
        break;
      case 'UpdateDiscoverStatus':
      case 'SetAssignmentState':
      case 'UpdateConfigureStatus':
        entry.title = this.$translate.instant('hercules.userActivationHistory.types.' + entry.payload.type + '.' + entry.payload.status);
        break;
      default:
        entry.title = this.$translate.instant('hercules.userActivationHistory.types.' + entry.payload.type);
        break;
    }
    return entry;
  }

  private decorateAssignments() {
    if (some(this.historyEntries, entry => {
      return entry.payload.type === 'AssignUser'
        || entry.payload.type === 'UpdateDiscoverStatus'
        || entry.payload.type === 'SetAssignmentState'
        || entry.payload.type === 'DeleteUserAssignment'
        || entry.payload.type === 'UpdateConfigureStatus';
    })) {
      this.HybridServicesClusterService.getAll()
        .then(clusters => {
          const connectors: IConnector[] = _.chain(clusters)
            .map((cluster) => cluster.connectors)
            .flatten<IConnector>()
            .value();
          forEach(this.historyEntries, entry => {
            switch (entry.payload.type) {
              case 'AssignUser':
                entry.assignments = _.chain(<IUserAssignment[]>entry.payload.assignments)
                  .filter(assignment => _.find(connectors, { id: assignment.connectorId }))
                  .map(assignment => {
                    return {
                      assignment: assignment,
                      connector: _.find(connectors, { id: assignment.connectorId }),
                    };
                  }).value();
                entry.assignedCluster = _.find(clusters, { id: _.first(<IUserAssignment[]>entry.payload.assignments).clusterId });
                break;
              case 'UpdateDiscoverStatus':
              case 'SetAssignmentState':
              case 'DeleteUserAssignment':
              case 'UpdateConfigureStatus':
                entry.connector = _.find(connectors, { id: entry.payload.connectorId });
                entry.cluster = _.find(clusters, { id: entry.payload.clusterId });
                break;
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
      return entry.payload.type === 'UpdateUserResourceGroupWithReactivate' || entry.payload.type === 'UpdateUserResourceGroup';
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

export class UserActivationHistoryComponent implements ng.IComponentOptions {
  public controller = UserActivationHistoryCtrl;
  public template = require('modules/hercules/user-sidepanel/user-activation-history/user-activation-history.html');
  public bindings = {
    serviceId: '<',
  };
}
