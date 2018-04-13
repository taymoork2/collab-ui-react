import { Analytics } from 'modules/core/analytics';
import Feature from './feature.model';
import * as addressParser from 'emailjs-addressparser';
import { ILicenseRequestItem, IOnboardedUsersAggregateResult, IOnboardedUsersAnalyticsProperties, IParsedOnboardedUserResult, IUserEntitlementRequestItem, IConvertUserEntity, IUserNameAndEmail, UserEntitlementName, UserEntitlementState, IMigrateUsersResponse, IParsedOnboardedUserResponse, IUpdateUsersResponse, IOnboardUsersResponse, OnboardMethod } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { Config } from 'modules/core/config/config';
import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';

// TODO: mv this to more appropriate location once more is known about message codes from onboard API
const MAGIC_ERROR_CODE_FOR_ONBOARDED_USER_RESPONSE = '700000';

enum AlertType {
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}

export default class OnboardService {
  public huronCallEntitlement = false;
  public usersToOnboard = [];
  public maxUsersInManual = 25;

  /* @ngInject */
  constructor(
    public $q: ng.IQService,
    public $rootScope: ng.IRootScopeService,
    public $timeout: ng.ITimeoutService,
    public $translate: ng.translate.ITranslateService,
    private Analytics: Analytics,
    private Config: Config,
    private LogMetricsService,
    public UserCsvService,
    public Userservice,
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

  public removeEmailFromTokenfield(email: string, userList: string) {
    return userList.split(', ').filter(function (token) {
      return token.indexOf(email) === -1;
    }).join(', ');
  }

  public parseUsersList(userList: string): IUserNameAndEmail[] {
    return addressParser.parse(userList);
  }

  public onboardUsersInChunks(
    usersList: IUserNameAndEmail[],
    entitleList: IUserEntitlementRequestItem[],
    licenseList: ILicenseRequestItem[],
    options: {
      onboardMethod?: OnboardMethod,
      chunkSize?: number,
      servicesSelected?: {},
    } = {},
  ): ng.IPromise<IOnboardedUsersAggregateResult> {
    // notes:
    // - split out users list into smaller list chunks
    // - call 'Userservice.onboardUsers()' for each chunk
    const {
      onboardMethod = OnboardMethod.OTHER,
      chunkSize = this.Config.batchSize,
      servicesSelected = {},
    } = options;
    const usersListChunks = _.chunk(usersList, chunkSize);
    const promises = _.map(usersListChunks, (usersListChunk) => {
      return (this.Userservice.onboardUsers({
        users: usersListChunk,
        licenses: licenseList,
        userEntitlements: entitleList,
        onboardMethod,
      }) as ng.IHttpPromise<IOnboardUsersResponse>)
      .then((response) => {
        return this.parseOnboardedUsers(response);
      });
    });

    // aggregate all responses into a single result
    return this.$q.all(promises).then((responses): IOnboardedUsersAggregateResult => {
      const aggregateResult: IOnboardedUsersAggregateResult = this.aggregateResponses(responses);

      // track onbord event, then resolve
      this.trackOnboardSaveEvent({
        numAddedUsers: aggregateResult.numAddedUsers,
        numUpdatedUsers: aggregateResult.numUpdatedUsers,
        numErrors: _.size(aggregateResult.results.errors),
        servicesSelected: servicesSelected,
      });

      return aggregateResult;
    });
  }

  private parseOnboardedUsers(response: ng.IHttpResponse<IOnboardUsersResponse>): IParsedOnboardedUserResponse {
    const result = {
      resultList: [] as IParsedOnboardedUserResult[],  // list of parsed results for onboarding of each user
      numUpdatedUsers: 0,                              // count of users successfully modified
      numAddedUsers: 0,                                // count of new users successfully added
      // F7208
      convertedUsers: [] as string[],
      pendingUsers: [] as string[],
    };

    // notes:
    // - build up list of parsed results for onboarding of each user
    // - for each result with http status of 200, increment 'numUpdatedUsers'
    // - for each result with http status of 201, increment 'numAddedUsers'
    _.reduce(response.data.userResponse, (_result, onboardedUser) => {
      const userResult: IParsedOnboardedUserResult = {
        email: onboardedUser.email,
        message: undefined,
        alertType: undefined,
      };

      const httpStatus = onboardedUser.httpStatus;

      switch (httpStatus) {
        case HttpStatus.OK:
          _result.numUpdatedUsers++;
        case HttpStatus.CREATED: {
          if (httpStatus !== HttpStatus.OK) {
            _result.numAddedUsers++;
          }
          userResult.message = this.$translate.instant('usersPage.onboardSuccess', {
            email: userResult.email,
          });
          userResult.alertType = AlertType.SUCCESS;
          if (onboardedUser.message === MAGIC_ERROR_CODE_FOR_ONBOARDED_USER_RESPONSE) {
            userResult.message = this.$translate.instant('usersPage.onboardedWithoutLicense', {
              email: userResult.email,
            });
            userResult.alertType = AlertType.WARNING;
            if (onboardedUser.email) {
              userResult.warningMsg = this.UserCsvService.addErrorWithTrackingID(userResult.message, response);
            }
          }
          break;
        }
        case HttpStatus.CONFLICT: {
          userResult.message = `${userResult.email} ${onboardedUser.message}`;
          break;
        }
        case HttpStatus.FORBIDDEN: {
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
        case HttpStatus.BAD_REQUEST: {
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

      if (httpStatus !== HttpStatus.OK && httpStatus !== HttpStatus.CREATED) {
        userResult.alertType = AlertType.DANGER;
        userResult.errorMsg = this.UserCsvService.addErrorWithTrackingID(userResult.message, response);
      }

      _result.resultList.push(userResult);
      return _result;
    }, result);

    return result;
  }

  public convertUsersInChunks(
    convertUsersList: IConvertUserEntity[],
    options: {
      chunkSize?: number,
      shouldUpdateUsers?: boolean,
      licenseList?: ILicenseRequestItem[],
      entitlementList?: IUserEntitlementRequestItem[],
    },
  ): ng.IPromise<IOnboardedUsersAggregateResult> {
    const {
      chunkSize = this.Config.batchSize,
      shouldUpdateUsers = true,
      licenseList = [],
      entitlementList = [],
    } = options;
    const convertUsersListChunks = _.chunk(convertUsersList, chunkSize);
    const promises = _.map(convertUsersListChunks, (convertUsersListChunk) => {
      return (this.Userservice.migrateUsers(convertUsersListChunk) as ng.IHttpPromise<IMigrateUsersResponse>).then((response) => {
        if (shouldUpdateUsers) {
          return this.updateMigratedUsers(response, convertUsersListChunk, licenseList, entitlementList);
        }
        return this.parseMigratedUsers(response);
      });
    });

    return this.$q.all(promises).then(responses => {
      const aggregateResponses = this.aggregateResponses(responses);

      this.trackConvertUsersEvent({
        numTotalUsers: aggregateResponses.results.resultList.length,
        numUpdatedUsers: aggregateResponses.numUpdatedUsers,
        startTime: moment(),
      });

      return aggregateResponses;
    });
  }

  private updateMigratedUsers(
    response: ng.IHttpResponse<IMigrateUsersResponse>,
    origConvertUsersList: IConvertUserEntity[],
    licenseList: ILicenseRequestItem[],
    entitlementList: IUserEntitlementRequestItem[],
  ): IParsedOnboardedUserResponse | ng.IPromise<IParsedOnboardedUserResponse> {
    const parsedMigratedUsers = this.parseMigratedUsers(response);
    const [
      successMigratedUsers,
      failMigratedUsers,
    ] = _.partition(parsedMigratedUsers.resultList, result => {
      return !result.errorMsg && !result.warningMsg;
    });
    // if none of the users were migrated sucessfully, return the results
    if (!successMigratedUsers.length) {
      return parsedMigratedUsers;
    }

    // format to an expected updateUsers function payload
    const updateUsersList = _.map(successMigratedUsers, successMigratedUser => {
      const origConvertUser = _.find(origConvertUsersList, origConvertUser => origConvertUser.userName === successMigratedUser.email);
      return {
        address: successMigratedUser.email,
        assignedDn: origConvertUser.assignedDn,
        externalNumber: origConvertUser.externalNumber,
      };
    });

    return (this.Userservice.updateUsers(updateUsersList, licenseList, entitlementList) as ng.IHttpPromise<IUpdateUsersResponse>).then(response => {
      const parsedUpdatedUsers = this.parseUpdatedUsers(response);
      // concat the original migration failures before the results of the updateUsers
      parsedUpdatedUsers.resultList = _.concat(failMigratedUsers, parsedUpdatedUsers.resultList);
      return parsedUpdatedUsers;
    });
  }

  private parseUpdatedUsers(response: ng.IHttpResponse<IUpdateUsersResponse>): IParsedOnboardedUserResponse {
    const result = {
      resultList: [] as IParsedOnboardedUserResult[],
      numUpdatedUsers: 0,
      numAddedUsers: 0,
      // F7208
      convertedUsers: [] as string[],
      pendingUsers: [] as string[],
    };
    _.reduce(response.data.userResponse, (_result, userResponseItem) => {
      const userResult: IParsedOnboardedUserResult = {
        email: userResponseItem.email,
      };

      const httpStatus = userResponseItem.httpStatus;

      switch (httpStatus) {
        case HttpStatus.OK:
          _result.numUpdatedUsers++;
          if (userResponseItem.message === '100002') {
            _result.pendingUsers.push(userResponseItem.email);
          } else {
            _result.convertedUsers.push(userResponseItem.email);
          }
        case HttpStatus.CREATED: {
          if (httpStatus !== HttpStatus.OK) {
            _result.numAddedUsers++;
          }
          userResult.message = this.$translate.instant('onboardModal.result.200');
          userResult.alertType = AlertType.SUCCESS;
          break;
        }
        case HttpStatus.NOT_FOUND: {
          userResult.message = this.$translate.instant('onboardModal.result.404');
          userResult.alertType = AlertType.DANGER;
          break;
        }
        case HttpStatus.REQUEST_TIMEOUT: {
          userResult.message = this.$translate.instant('onboardModal.result.408');
          userResult.alertType = AlertType.DANGER;
          break;
        }
        case HttpStatus.CONFLICT: {
          userResult.message = this.$translate.instant('onboardModal.result.409');
          userResult.alertType = AlertType.DANGER;
          break;
        }
        default: {
          if (userResponseItem.message === this.Config.messageErrors.hybridServicesComboError) {
            userResult.message = this.$translate.instant('onboardModal.result.400094', {
              status: httpStatus,
            });
          } else if (_.includes(userResponseItem.message!, 'DN_IS_FALLBACK')) {
            userResult.message = this.$translate.instant('onboardModal.result.deleteUserDnFallbackError');
          } else {
            userResult.message = this.$translate.instant('onboardModal.result.other', {
              status: httpStatus,
            });
          }
          userResult.alertType = AlertType.DANGER;
          break;
        }
      }

      if (userResult.alertType !== AlertType.SUCCESS) {
        userResult.errorMsg = this.UserCsvService.addErrorWithTrackingID(`${userResult.email} ${userResult.message}`, response);
      }

      _result.resultList.push(userResult);

      return _result;
    }, result);

    return result;
  }

  private parseMigratedUsers(response: ng.IHttpResponse<IMigrateUsersResponse>): IParsedOnboardedUserResponse {
    const result = {
      resultList: [] as IParsedOnboardedUserResult[],
      numUpdatedUsers: 0,
      numAddedUsers: 0,
      // F7208
      convertedUsers: [] as string[],
      pendingUsers: [] as string[],
    };
    _.reduce(response.data.userResponse, (_result, migratedUser) => {
      const userResult: IParsedOnboardedUserResult = {
        email: migratedUser.email,
        httpStatus: migratedUser.httpStatus,
        message: migratedUser.message,
      };
      if (userResult.httpStatus === HttpStatus.OK) {
        _result.numUpdatedUsers++;
        userResult.alertType = AlertType.SUCCESS;
        // F7208
        if (userResult.message === '100002') {
          _result.pendingUsers.push(userResult.email);
        } else {
          _result.convertedUsers.push(userResult.email);
        }
      } else {
        userResult.errorMsg = `${migratedUser.email} ${this.$translate.instant('homePage.convertError')}`;
        userResult.alertType = AlertType.DANGER;
      }
      result.resultList.push(userResult);

      return _result;
    }, result);
    return result;
  }

  private aggregateResponses(responses: IParsedOnboardedUserResponse[]): IOnboardedUsersAggregateResult {
    const numUpdatedUsers = _.sumBy(responses, response => response.numUpdatedUsers);
    const numAddedUsers = _.sumBy(responses, response => response.numAddedUsers);
    const resultList = _.flatMap(responses, response => response.resultList);
    const errors = _.compact(_.map(resultList, result => result.errorMsg!));
    const warnings = _.compact(_.map(resultList, result => result.warningMsg!));
    const converted = _.flatMap(responses, response => response.convertedUsers);
    const pending = _.flatMap(responses, response => response.pendingUsers);

    return {
      numUpdatedUsers: numUpdatedUsers,
      numAddedUsers: numAddedUsers,
      // F7208,
      convertedUsers: _.union(converted, converted), // remove possible dupes
      pendingUsers: _.union(pending, pending), // remove possible dupes
      results: {
        resultList: resultList,
        errors: errors,
        warnings: warnings,
      },
    };
  }

  public updateUserLicense(
    userList: IUserNameAndEmail[],
    licenseList: any[],
  ): ng.IPromise<IOnboardedUsersAggregateResult> {
    return (this.Userservice.onboardUsersLegacy(userList, null, licenseList) as ng.IHttpPromise<IOnboardUsersResponse>)
      .then(response => this.parseUpdatedUsers(response))
      .then(parsedResponse => this.aggregateResponses([parsedResponse]));
  }

  public trackOnboardSaveEvent(options: {
    numAddedUsers: number,
    numUpdatedUsers: number,
    numErrors: number,
    servicesSelected: {},
  }): void {
    const { numAddedUsers, numUpdatedUsers, numErrors, servicesSelected } = options;
    if (numAddedUsers > 0) {
      const msg = `Invited ${numAddedUsers} users`;
      // TODO: replace with 'MetricsService'
      this.LogMetricsService.logMetrics(
        msg,
        this.LogMetricsService.getEventType('inviteUsers'),
        this.LogMetricsService.getEventAction('buttonClick'),
        200,
        moment(),
        numAddedUsers,
        null);
    }
    const analyticsProps = this.createPropertiesForAnalytics(numAddedUsers, numUpdatedUsers, numErrors, servicesSelected);
    this.Analytics.trackAddUsers(this.Analytics.eventNames.SAVE, null, analyticsProps);
  }

  public trackConvertUsersEvent(options: {
    numUpdatedUsers: number,
    numTotalUsers: number,
    startTime: moment.Moment,
  }): void {
    const { numUpdatedUsers, numTotalUsers, startTime } = options;
    const msg = `Migrated ${numUpdatedUsers} users`;
    const metricData = {
      totalUsers: numTotalUsers,
      successfullyConverted: numUpdatedUsers,
    };
    // TODO: replace with 'MetricsService'
    this.LogMetricsService.logMetrics(
      msg,
      this.LogMetricsService.getEventType('convertUsers'),
      this.LogMetricsService.getEventAction('buttonClick'),
      200,
      startTime,
      numUpdatedUsers,
      metricData,
    );
  }

  public createPropertiesForAnalytics(numAddedUsers = 0, numUpdatedUsers = 0, numErrors = 0, servicesSelected = {}): IOnboardedUsersAnalyticsProperties {
    return {
      numberOfErrors: numErrors,
      usersAdded: numAddedUsers,
      usersUpdated: numUpdatedUsers,
      servicesSelected: this.getSelectedKeys(servicesSelected),
    };
  }

  private getSelectedKeys(obj: {}): string[] {
    return _.reduce(obj, function (result, v, k) {
      if (v === true) {
        result.push(k);
      }
      return result;
    }, [] as string[]);
  }

  public toEntitlementItem(name: UserEntitlementName, value: boolean | null | undefined): IUserEntitlementRequestItem {
    return <IUserEntitlementRequestItem>{
      entitlementName: name,
      entitlementState: this.toEntitlementState(value),
    };
  }

  public toEntitlementState(value: boolean | null | undefined): UserEntitlementState {
    return !!value ? UserEntitlementState.ACTIVE : UserEntitlementState.INACTIVE;
  }
}
