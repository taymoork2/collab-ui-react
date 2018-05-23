export class BotAuthorizationsController {
  public selectPlaceholder = this.$translate.instant('placesPage.botAuthorizations.selectRole');
  public roles: any;
  private _selectedRole: any;
  public isCollapsed = true;
  public accountQuery: string = '';
  public searchAccountResult: any[] = [];
  public noSearchResults: boolean;
  public isSearching: boolean;
  public isAdding: boolean = false;
  public showAddedMessage = false;
  public showTypeLimitNotReached = false;
  public justAdded: any;
  private loadedAuthorizations = false;
  private authorizations: any[] = [];
  private selectedAccount: any;
  private lastSearchInput = '';

  /* @ngInject */
  constructor(
    private DirectoryService,
    private AuthorizationService,
    private accountId: string,
    public accountDisplayName: string,
    public ownerType: string,
    private Notification,
    private $q,
    private $translate,
  ) {
    this.loadAuthorizations();
    this.getRoles();
  }
  private loadAuthorizations(): void {
    let authorizations: any[] = [];
    const promises: any[] = [];
    this.AuthorizationService.getAuthorizations(this.accountId)
      .then(result => {
        authorizations = result;
        _.forEach(authorizations, (auth) => {
          promises.push(this.enrichAuthData(auth));
        });
      })
      .catch((error) => {
        this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToLoadAuthorizations');
      })
      .then(() => this.$q.all(promises))
      .then(() => {
        this.authorizations = authorizations;
        this.loadedAuthorizations = true;
      });
  }

  private enrichAuthData(auth): IPromise<boolean> {
    const rolePromise = this.AuthorizationService.getRoleName(auth.grant.id).then(r => {
      auth.grant.name = r;
    }).catch((error) => {
      auth.grant.name = this.$translate.instant('common.notAvailable');
      this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToGetRoles');
    });
    const subjectPromise = this.DirectoryService.getAccount(auth.subject.id).then(r => {
      auth.subject.name = r.name;
      auth.subject.type = r.type;
      auth.subject.thumbnail = r.thumbnail;
      auth.subject.email = r.email;
      auth.subject.class = r.type === 'BOT' ? 'icon icon-bot-four icon-2x' : 'icon icon-user icon-2x';
    }).catch((error) => {
      auth.subject.name = this.$translate.instant('common.notAvailable');
      auth.subject.type = this.$translate.instant('common.notAvailable');
      this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToLookupAccount');
    });
    const createdByPromise = this.DirectoryService.getAccount(auth.createdBy).then(r => {
      auth.createdByName = r.name;
    }).catch((error) => {
      auth.createdByName = this.$translate.instant('common.notAvailable');
      this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToLookupAccount');
    });
    return this.$q.all([rolePromise, subjectPromise, createdByPromise]);
  }
  public showLoading(): boolean {
    return !this.loadedAuthorizations;
  }
  public showNoResults(): boolean {
    return this.loadedAuthorizations && this.authorizations.length === 0 && this.isCollapsed;
  }
  public showResults(): boolean {
    return this.loadedAuthorizations && this.authorizations.length > 0 || !this.isCollapsed;
  }
  public showSelectRole(): boolean {
    return !!this.selectedAccount;
  }
  public showAdd(): boolean {
    return this.isCollapsed && this.loadedAuthorizations && this.authorizations.length > 0;
  }
  public showRecentlyAdded(id): boolean {
    return id === this.justAdded;
  }
  public getRoles(): void {
    this.AuthorizationService.getRoles().then(result => this.roles = result)
      .catch((error) => {
        this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToGetRoles');
      });
  }
  public startAdding(): void {
    this.isCollapsed = false;
    this.resetAddFields();
  }
  public cancelAdding(): void {
    this.isCollapsed = true;
    this.resetAddFields();
  }
  private resetAddFields(): void {
    this.showAddedMessage = false;
    this.lastSearchInput = '';
    this.accountQuery = '';
    this._selectedRole = null;
    this.searchAccountResult = [];
  }
  public delete(id): IPromise<any> {
    return this.AuthorizationService.delete(id).then(() => {
      this.authorizations = this.authorizations.filter((auth) => auth.id !== id);
    }).catch((error) => {
      this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToDelete');
    });
  }
  public searchAccount(searchString: string): IPromise<any[]> {
    const deferred = this.$q.defer();
    if (this.lastSearchInput !== searchString && searchString.length > 2) {
      this.showTypeLimitNotReached = false;
      this.lastSearchInput = searchString;
      this.DirectoryService.searchAccount(searchString).then((res) => {
        this.isSearching = false;
        this.noSearchResults = res.length === 0;
        deferred.resolve(res);
      }).catch(() => {
        this.noSearchResults = true;
        deferred.resolve([]);
      });
    } else {
      this.showTypeLimitNotReached = true;
      deferred.resolve([]);
    }
    return deferred.promise;
  }
  public selectAccount(item: any) {
    this.selectedAccount = item;
  }
  set selectedRole(value: any) {
    this._selectedRole = value;
    this.createAuth();
  }
  public createAuth(): void {
    this.isAdding = true;
    this.AuthorizationService.createAuthorization(this.selectedAccount.id, this._selectedRole.id, this.accountId)
      .then((data) => {
        this.enrichAuthData(data).then(() => {
          this.isAdding = false;
          this.justAdded = data.id;
          this.authorizations.push(data);
          this.selectedAccount = null;
          this._selectedRole = null;
          this.accountQuery = '';
          this.lastSearchInput = '';
          this.isCollapsed = true;
        });
      })
      .catch((error) => {
        this.isAdding = false;
        this.Notification.errorResponse(error, 'placesPage.botAuthorizations.failedToCreateAuthorization');
      });
  }
}

angular
  .module('Squared')
  .controller('BotAuthorizationsController', BotAuthorizationsController)
  .service('BotAuthorizationsModal',
    /* @ngInject */
    function ($modal) {
      function open(accountId, accountDisplayName, ownerType) {
        return $modal.open({
          resolve: {
            accountId: _.constant(accountId),
            accountDisplayName: _.constant(accountDisplayName),
            ownerType: _.constant(ownerType),
          },
          controllerAs: 'vm',
          controller: 'BotAuthorizationsController',
          template: require('modules/squared/places/bot-authorizations/botAuthorizations.tpl.html'),
          modalId: 'botAuthorizationsModal',
        }).result;
      }

      return {
        open: open,
      };
    },
  );
