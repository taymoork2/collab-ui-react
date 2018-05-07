import IPromise = ng.IPromise;
import { ICsdmFilteredViewFactory } from '../csdm-filtered-view-factory';
import { UserListService } from 'modules/core/scripts/services/userlist.service';
import { IQService } from 'angular';
import { FilteredView } from '../../common/filtered-view/filtered-view';
import IPlace = csdm.IPlace;
import { IUser } from '../../../core/auth/user';

export enum ValidationState {
  None = '',
  Error = 'error',
  Success = 'success',
}

export interface IBaseExternalLinkedAccountUniqueSafe {
  validate(accountGUID: string, externalLinkedAccountType: string): void;
  currentValidationState: ValidationState;
  currentValidationMessage: string;
  isValidating: boolean;
}

export interface IBaseExternalLinkedAccountUniqueSafeOptions {
  nullAccountMessageKey: string;
  conflictWithUserEmailMessageKey: string;
  conflictWithExternalLinkedAccountMessageKey: string;
}

export abstract class BaseExternalLinkedAccountUniqueSafe implements IBaseExternalLinkedAccountUniqueSafe {
  private nullAccountMessageKey: string;
  private conflictWithUserEmailMessageKey: string;
  private conflictWithExternalLinkedAccountMessageKey: string;
  private verificationDelayTimer: IPromise<void> | null;
  private currentAccountGUID: string | undefined;
  private filteredPlaceView: FilteredView<IPlace>;

  public isValidating: boolean = false;
  public currentValidationState: ValidationState = ValidationState.None;
  public currentValidationMessage: string = '';

  constructor(options: IBaseExternalLinkedAccountUniqueSafeOptions,
              CsdmFilteredViewFactory: ICsdmFilteredViewFactory,
              private UserListService: UserListService,
              protected $q: IQService,
              private $timeout: ng.ITimeoutService,
              protected $translate: ng.translate.ITranslateService) {
    this.nullAccountMessageKey = options.nullAccountMessageKey;
    this.conflictWithUserEmailMessageKey = options.conflictWithUserEmailMessageKey;
    this.conflictWithExternalLinkedAccountMessageKey = options.conflictWithExternalLinkedAccountMessageKey;

    this.filteredPlaceView = CsdmFilteredViewFactory.createFilteredPlaceView();

    const filterValue = 'all';
    this.filteredPlaceView.setFilters([{
      name: '',
      count: 0,
      filterValue: filterValue,
      passes: (place) => {
        return place.type === 'cloudberry';
      },
    }]);

    this.filteredPlaceView.setSearchTimeout(0);
    this.filteredPlaceView.setCurrentFilterValue(filterValue);
  }

  public validate = (accountGUID: string | undefined, externalLinkedAccountType: string): void => {
    if (this.verificationDelayTimer) {
      this.$timeout.cancel(this.verificationDelayTimer);
      this.verificationDelayTimer = null;
    }
    this.currentAccountGUID = accountGUID;
    if (accountGUID === '') {
      this.isValidating = false;
      this.currentValidationState = ValidationState.None;
      this.currentValidationMessage = '';
      return;
    }
    this.isValidating = true;
    this.currentValidationState = ValidationState.None;
    this.currentValidationMessage = '';
    const currentVerificationDelayTimer = this.verificationDelayTimer = this.$timeout(() => {
      if (!accountGUID) {
        if (this.verificationDelayTimer === currentVerificationDelayTimer) {
          this.isValidating = false;
          this.currentValidationState = ValidationState.Error;
          this.currentValidationMessage = this.$translate.instant(this.nullAccountMessageKey);
        }
      } else {
        this.$q.all([
          this.checkEmailAddressUniquenessForUsers(accountGUID),
          this.checkAccountGUIDUniquenessForPlaces(accountGUID, externalLinkedAccountType),
        ]).then(() => {
          if (this.currentAccountGUID === accountGUID) {
            this.isValidating = false;
            this.currentValidationState = ValidationState.Success;
            this.currentValidationMessage = '';
          }
          return;
        })
          .catch((data) => {
            if (this.currentAccountGUID === accountGUID) {
              this.isValidating = false;
              this.currentValidationState = ValidationState.Error;
              this.currentValidationMessage = data;
            }
          });
      }
    }, 500);
  }

  private checkEmailAddressUniquenessForUsers = (accountGUID: string): IPromise<void> => {
    return this.UserListService.listUsersAsPromise({
      filter: {
        emailEquals: accountGUID,
      },
    }).then(users => {
      if (users && users.data && users.data.Resources) {
        const matchingUser: IUser = _.find(users.data.Resources, { userName: accountGUID });
        if (matchingUser) {
          return this.$q.reject(this.$translate.instant(this.conflictWithUserEmailMessageKey, {
            accountDisplayName: (matchingUser.displayName || matchingUser.userName),
          }));
        }
      }
      return this.$q.resolve();
    });
  }

  private checkAccountGUIDUniquenessForPlaces = (accountGUID: string, externalLinkedAccountType: string): IPromise<void> => {
    this.filteredPlaceView.refresh();
    return this.filteredPlaceView.setCurrentSearch(accountGUID).then((places) => {
      const matchingPlace: IPlace = _.find(places, (place) => {
        if (place.externalLinkedAccounts) {
          return _.some(place.externalLinkedAccounts, { accountGUID: accountGUID, providerID: externalLinkedAccountType });
        }
      });
      if (matchingPlace) {
        return this.$q.reject(this.$translate.instant(this.conflictWithExternalLinkedAccountMessageKey, {
          accountDisplayName: matchingPlace.displayName,
        }));
      }
      return this.$q.resolve();
    });
  }
}
