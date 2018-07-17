import { IntegrationsManagementService } from './integrations-management.service';
import { UserQueryType, IUserInfo, ITokenMethods } from './integrations-management.types';

export interface ITokenEvent  {
  attrs: {
    label: string,
    value: string,
  };
  preventDefault: Function;
  relatedTarget: string;
}

export class IntegrationsManagementTokens implements ng.IComponentController {
  public personIds: string[];
  public onChange: Function;
  public setValid: Function;
  public tokenList: IUserInfo[] = [];
  public isLoading = true;
  public tokenfieldid: string = 'integrationUsers';
  public tokenplaceholder: string;

  public tokenoptions: object = {
    delimiter: [',', ';'],
    createTokensOnBlur: true,
    tokens: [],
    minLength: 0,
    beautify: false,
    limit: 250,
  };
  public tokenmethods: ITokenMethods;

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private IntegrationsManagementService: IntegrationsManagementService,
  ) {

    this.tokenplaceholder = this.$translate.instant('integrations.overview.tokenPlaceholder');
    this.tokenmethods = {
      createtoken: this.createToken.bind(this),
      createdtoken: this.createdToken.bind(this),
      edittoken: this.editToken.bind(this),
      removedtoken: this.removedToken.bind(this),
    };
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { personIds } = changes;
    if (personIds && personIds.currentValue && this.hasIdListChanged()) {
      this.$timeout(() => {
        this.setEmailTokens(personIds.currentValue);
      }, 200);
    }
  }

  private tokenHasUserId(token: ITokenEvent): boolean {
    return (token.attrs.value !== token.attrs.label);
  }

  public createToken(e: ITokenEvent): void {
    const duplicate = _.find(this.getEmailTokens(), {
      label: e.attrs.label,
    });
    if (duplicate) {
      e.preventDefault();
      //TODO: algendel - potentially display an error
    } else {
      if (this.tokenHasUserId(e)) {
        this.tokenList.push({ username: e.attrs.label, id: e.attrs.value });
      } else {
        this.tokenList.push({ username: e.attrs.label, id: '' });
      }
    }
    if (_.size(this.personIds) === _.size(this.tokenList)) {
      this.isLoading = false;
    }
  }

  public editToken(e: ITokenEvent): void {
    e.preventDefault();
  }

  private hasIdListChanged(): boolean {
    const idsFromComponent = this.getIdsFromTokens();
    const hasChanges = !_.isEqual(this.personIds.sort(), idsFromComponent.sort());
    return hasChanges;
  }

  private hasOutstandingOrInvalidTokens(): boolean {
    return _.some(this.tokenList, token => (token.id === ''));
  }

  private updateParent(): void {
    this.setParentValidity();
    if (!this.hasOutstandingOrInvalidTokens()) {
      const userIds = this.getIdsFromTokens();
      this.onChange({
        userIds: userIds,
      });
    }
  }

  private updateWithNewUser(username: string, id: string): void {
    this.personIds.push(id);
    const index = _.findIndex(this.tokenList, token => token.username === username);
    this.tokenList[index].id = id;
  }

  public isEmpty(): boolean {
    return _.isEmpty(this.tokenList) && !this.isLoading;
  }

  private setParentValidity(): void {
    this.setValid({ isValid: !this.hasOutstandingOrInvalidTokens() });
  }

  public createdToken(e: ITokenEvent): void {
    //this also get triggered when we populate from the policy. In this case we have all the info we need
    this.setParentValidity();
    if (!this.tokenHasUserId(e)) {
      angular.element(e.relatedTarget).addClass('disabled');
      //set parent disabled
      this.IntegrationsManagementService.getUsers(UserQueryType.EMAIL, e.attrs.label).then((users) => {
        angular.element(e.relatedTarget).removeClass('disabled');
        if (!_.isEmpty(users)) {
          this.updateWithNewUser(users[0].username, users[0].id);
        } else {
          angular.element(e.relatedTarget).addClass('invalid');
        }
        this.updateParent();
      });
    }
  }

  private getIdsFromTokens(): (string | undefined)[] {
    return _.map(this.tokenList, token => token.id);
  }

  private removedToken(e: ITokenEvent): void {
    const tokenIndex = _.findIndex(this.tokenList, token => token.username === e.attrs.label);

    if (tokenIndex !== -1) {
      const removedToken = this.tokenList.splice(tokenIndex, 1)[0];
      this.setParentValidity();
      const id = removedToken.id;
      if (!_.isEmpty(id)) {
        this.personIds = _.without(this.personIds, id);
        this.updateParent();
      }
    }
  }

  private getEmailTokens(): { value, label, id }[] {
    return (angular.element('#' + this.tokenfieldid) as any).tokenfield('getTokens');
  }

  private setEmailTokens(personIds: string[]): void {
    this.IntegrationsManagementService.getUsersBulk(UserQueryType.ID, personIds).then((users: IUserInfo[]) => {
      const tokens = _.map(users, user => {
        return {
          label: user.username,
          value: user.id,
        };
      });
      (angular.element('#' + this.tokenfieldid) as any).tokenfield('setTokens', tokens);
    });
  }

}

export class IntegrationsManagementTokensComponent implements ng.IComponentOptions {
  public controller = IntegrationsManagementTokens;
  public template = require('./integrations-management-tokens.html');
  public bindings = {
    personIds: '<',
    onChange: '&',
    setValid: '&',
  };
}
