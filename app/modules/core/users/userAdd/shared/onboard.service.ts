import Feature from './feature.model';
import * as addressParser from 'emailjs-addressparser';
import { IUserNameAndEmail, IOnboardedUserResult, IParsedOnboardedUserResult } from 'modules/core/users/shared/onboard.interfaces';
import { Config } from 'modules/core/config/config';

export default class OnboardService {
  public huronCallEntitlement = false;
  public usersToOnboard = [];
  public maxUsersInManual = 25;

  /* @ngInject */
  constructor(
    public $timeout: ng.ITimeoutService,
    public $translate: ng.translate.ITranslateService,
    private Config: Config,
  ) {
  }

  // TODO: add TS types
  // email validation logic
  public validateEmail(input): boolean {
    const emailregex = /\S+@\S+\.\S+/;
    const emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
    const emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
    let valid = false;

    if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
      valid = true;
    } else if (/["]/.test(input) && emailregexquotes.test(input)) {
      valid = true;
    } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
      valid = true;
    }

    return valid;
  }

  // TODO: add TS types
  public mergeMultipleLicenseSubscriptions(fetched) {
    // Construct a mapping from License to (array of) Service object(s)
    const services = fetched.reduce(function (object, serviceObj) {
      const key = serviceObj.license.licenseType;
      if (key in object) {
        object[key].push(serviceObj);
      } else {
        object[key] = [serviceObj];
      }
      return object;
    }, {});

    // Merge all services with the same License into a single serviceObj
    return _.values(services).map(function (array: any) {
      const result = {
        licenses: [],
      };
      array.forEach(function (serviceObj) {
        const copy = _.cloneDeep(serviceObj);
        copy.licenses = [copy.license];
        delete copy.license;
        _.mergeWith(result, copy, function (left, right) {
          if (_.isArray(left)) {
            return left.concat(right);
          }
        });
      });
      return result;
    });
  }

  // TODO: add TS types
  public getEntitlements(action, entitlements) {
    const result: any = [];
    _.forEach(entitlements, function (state: boolean, key: string) {
      if (state) {
        if (action === 'add' || action === 'entitle') {
          result.push(new Feature(key, state));
        }
      }
    });
    return result;
  }

  public isEmailAlreadyPresent(input: string) {
    const inputEmail = this.getEmailAddress(input).toLowerCase();
    if (inputEmail) {
      const userEmails = this.getTokenEmailArray();
      // TODO (mipark2): use _.find() here instead
      const userEmailsLower: any = [];
      for (let i = 0; i < userEmails.length; i++) {
        userEmailsLower[i] = userEmails[i].toLowerCase();
      }
      return userEmailsLower.indexOf(inputEmail) >= 0;
    } else {
      return false;
    }
  }

  private getTokenEmailArray() {
    const tokens = (angular.element('#usersfield') as any).tokenfield('getTokens');
    return tokens.map((token) => {
      return this.getEmailAddress(token.value);
    });
  }

  private getEmailAddress(input: string) {
    let retString = '';
    input.split(' ').forEach(function (str) {
      if (str.indexOf('@') >= 0) {
        retString = str;
      }
    });
    return retString;
  }

  public checkPlaceholder(): void {
    if (angular.element('.token-label').length > 0) {
      this.setPlaceholder('');
    } else {
      this.setPlaceholder(this.$translate.instant('usersPage.userInput'));
    }
  }

  private setPlaceholder(placeholder): void {
    angular.element('.tokenfield.form-control #usersfield-tokenfield').attr('placeholder', placeholder);
  }

  public hasErrors(scopeData): boolean {
    let haserr = (scopeData.invalidcount > 0);
    if (this.getNumUsersInTokenField() >= this.maxUsersInManual) {
      haserr = true;
    }
    return haserr;
  }

  public getNumUsersInTokenField(): number {
    return (angular.element('#usersfield') as any).tokenfield('getTokens').length;
  }

  public validateTokens(scopeData): ng.IPromise<void> {
    // TODO (f3745): rm this if determined not-needed
    // wizardNextText();

    return this.$timeout(() => {
      //reset the invalid count
      scopeData.invalidcount = 0;
      (angular.element('#usersfield') as any).tokenfield('setTokens', scopeData.model.userList);
    }, 100);
  }

  public resetUsersfield(scopeData): void {
    (angular.element('#usersfield') as any).tokenfield('setTokens', ' ');
    scopeData.model.userList = '';
    this.checkPlaceholder();
    scopeData.invalidcount = 0;
    scopeData.invalidDirSyncUsersCount = 0;
  }

  public parseUsersList(userList: string): IUserNameAndEmail[] {
    return addressParser.parse(userList);
  }

  public parseOnboardedUsers(onboardedUsers: IOnboardedUserResult[]): {
    resultList: IParsedOnboardedUserResult[],
    numUpdatedUsers: number,
    numAddedUsers: number,
  } {
    const result: any = {
      resultList: [],      // list of parsed results for onboarding of each user
      numUpdatedUsers: 0,  // count of users successfully modified
      numAddedUsers: 0,    // count of new users successfully added
    };

    // notes:
    // - build up list of parsed results for onboarding of each user
    // - for each result with http status of 200, increment 'numUpdatedUsers'
    // - for each result with http status of 201, increment 'numAddedUsers'
    _.reduce(onboardedUsers, (_result, onboardedUser) => {
      const userResult: IParsedOnboardedUserResult = {
        email: onboardedUser.email,
        message: undefined,
        alertType: undefined,
      };

      const httpStatus = onboardedUser.httpStatus;

      switch (httpStatus) {
        case 200:
        case 201: {
          userResult.message = this.$translate.instant('usersPage.onboardSuccess', {
            email: userResult.email,
          });
          userResult.alertType = 'success';
          if (httpStatus === 200) {
            result.numUpdatedUsers++;
          } else {
            result.numAddedUsers++;
          }
          if (onboardedUser.message === '700000') {
            userResult.message = this.$translate.instant('usersPage.onboardedWithoutLicense', {
              email: userResult.email,
            });
            userResult.alertType = 'warning';
          }
          break;
        }
        case 409: {
          userResult.message = `${userResult.email} ${onboardedUser.message}`;
          break;
        }
        case 403: {
          switch (onboardedUser.message) {
            case this.Config.messageErrors.userExistsError: {
              userResult.message = this.$translate.instant('usersPage.userExistsError', {
                email: userResult.email,
              });
              break;
            }
            case this.Config.messageErrors.userPatchError:
            case this.Config.messageErrors.claimedDomainError: {
              userResult.message = this.$translate.instant('usersPage.claimedDomainError', {
                email: userResult.email,
                domain: userResult.email.split('@')[1],
              });
              break;
            }
            case this.Config.messageErrors.userExistsInDiffOrgError: {
              userResult.message = this.$translate.instant('usersPage.userExistsInDiffOrgError', {
                email: userResult.email,
              });
              break;
            }
            case this.Config.messageErrors.notSetupForManUserAddError: {
              userResult.message = this.$translate.instant('usersPage.notSetupForManUserAddError', {
                email: userResult.email,
              });
              break;
            }
            case this.Config.messageErrors.userExistsDomainClaimError: {
              userResult.message = this.$translate.instant('usersPage.userExistsDomainClaimError', {
                email: userResult.email,
              });
              break;
            }
            case this.Config.messageErrors.unknownCreateUserError: {
              userResult.message = this.$translate.instant('usersPage.unknownCreateUserError');
              break;
            }
            case this.Config.messageErrors.unableToMigrateError: {
              userResult.message = this.$translate.instant('usersPage.unableToMigrateError', {
                email: userResult.email,
              });
              break;
            }
            case this.Config.messageErrors.insufficientEntitlementsError: {
              userResult.message = this.$translate.instant('usersPage.insufficientEntitlementsError', {
                email: userResult.email,
              });
              break;
            }
            default: {
              userResult.message = this.$translate.instant('usersPage.accessDeniedError', {
                email: userResult.email,
              });
              break;
            }
          }
          break;
        }
        case 400: {
          switch (onboardedUser.message) {
            case this.Config.messageErrors.hybridServicesError: {
              userResult.message = this.$translate.instant('usersPage.hybridServicesError');
              break;
            }
            case this.Config.messageErrors.hybridServicesComboError: {
              userResult.message = this.$translate.instant('usersPage.hybridServicesComboError');
              break;
            }
            default: {
              userResult.message = this.$translate.instant('usersPage.onboardError', {
                email: userResult.email,
                status: httpStatus,
              });
              break;
            }
          }
          break;
        }
        default: {
          userResult.message = this.$translate.instant('usersPage.onboardError', {
            email: userResult.email,
            status: httpStatus,
          });
          break;
        }
      }

      if (httpStatus !== 200 && httpStatus !== 201) {
        userResult.alertType = 'danger';
      }

      _result.resultList.push(userResult);
      return _result;
    }, result);

    return result;
  }
}
