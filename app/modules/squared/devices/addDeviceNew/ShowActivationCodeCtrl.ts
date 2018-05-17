import IAccountData = csdm.IAccountData;
import IRecipientUser = csdm.IRecipientUser;
import { WizardCtrl } from './WizardCtrl';
import * as jstz from 'jstimezonedetect';
import IDeferred = angular.IDeferred;
import ICsdmDataModelService = csdm.ICsdmDataModelService;
import { ExternalLinkedAccountHelperService } from '../services/external-acct-helper.service';
import { IWindowService } from 'angular';

export class ShowActivationCodeCtrl extends WizardCtrl {
  private account: IAccountData;
  public failure: boolean;
  public showEmail: boolean;
  public hideBackButton: boolean;
  private selectedUser: IRecipientUser;
  public qrCode: string | undefined;
  public timeLeft: string;
  public codeOnlyForPhones: boolean;
  public codeNotForPhones: boolean;
  public friendlyActivationCode: string;
  public isLoading: boolean;
  private activationCode: string;
  private expiryTime: any;
  private timezone: string;
  public foundUser: string;

  /* @ngInject */
  constructor($q: angular.IQService,
              private UserListService,
              private OtpService,
              private CsdmDataModelService: ICsdmDataModelService,
              private CsdmHuronPlaceService,
              $stateParams,
              private ActivationCodeEmailService,
              private $translate,
              private Notification,
              private CsdmEmailService: CsdmEmailService,
              private USSService,
              private ExtLinkHelperService: ExternalLinkedAccountHelperService,
              private $window: IWindowService) {
    super($q, $stateParams);

    this.failure = false;
    this.account = {
      name: this.wizardData.account.name,
      type: this.wizardData.account.type,
      orgId: this.wizardData.account.orgId,
      deviceType: this.wizardData.account.deviceType,
      cisUuid: this.wizardData.account.cisUuid,
      isEntitledToHuron: this.wizardData.account.isEntitledToHuron,
      ussProps: this.wizardData.account.ussProps,
    };

    this.hideBackButton = this.wizardData.function === 'showCode';
    this.showEmail = false;
    this.selectedUser = {
      nameWithEmail: '' + this.wizardData.recipient.displayName + ' (' + this.wizardData.recipient.email + ')',
      email: this.wizardData.recipient.email,
      cisUuid: this.wizardData.recipient.cisUuid,
      firstName: this.wizardData.recipient.firstName,
      orgId: <string> this.wizardData.recipient.organizationId,
    };
    this.qrCode = undefined;
    this.timeLeft = '';
    if (this.account.type === 'shared') {
      if (this.account.deviceType === 'huron') {
        this.codeOnlyForPhones = true;
      } else {
        this.codeNotForPhones = true;
      }
    }

    this.init();

    this.friendlyActivationCode = this.formatActivationCode(this.activationCode);

    this.timezone = jstz.determine().name();
    if (this.timezone === null || _.isUndefined(this.timezone)) {
      this.timezone = 'UTC';
    }
  }

  public createActivationCode() {
    this.isLoading = true;
    this.failure = false;
    if (this.account.deviceType === 'huron') {
      if (this.account.type === 'shared') {
        if (this.account.cisUuid) { // Existing place
          this.createCodeForHuronPlace(this.account.cisUuid)
            .then(
              (code) => {
                this.onCodeCreated(code);
              },
              (err) => {
                this.onCodeCreationFailure(err);
              });
        } else { // New place
          this.createHuronPlace(this.account.name, this.wizardData.account.entitlements, this.wizardData.account.locationUuid, this.wizardData.account.directoryNumber, this.wizardData.account.externalNumber)
            .then((place) => {
              this.account.cisUuid = place.cisUuid;
              this.createCodeForHuronPlace(this.account.cisUuid)
                .then(
                  (code) => {
                    this.onCodeCreated(code);
                  },
                  (err) => {
                    this.onCodeCreationFailure(err);
                  });
            }, err => {
              this.onCodeCreationFailure(err);
            });
        }
      } else { // Personal (never create new)
        this.createCodeForHuronUser(this.wizardData.account.username);
      }
    } else { // Cloudberry
      if (this.account.type === 'shared') {
        if (this.account.cisUuid) { // Existing place
          this.createCodeForCloudberryAccount(this.account.cisUuid)
            .then(
              (code) => {
                this.onCodeCreated(code);
              },
              (err) => {
                this.onCodeCreationFailure(err);
              });
        } else { // New place
          this.createCloudberryPlace(
            this.account.name,
            this.wizardData.account.entitlements,
            this.wizardData.account.locationUuid,
            this.wizardData.account.directoryNumber,
            this.wizardData.account.externalNumber,
            this.ExtLinkHelperService.getExternalLinkedAccountForSave(
              this.wizardData.account.externalLinkedAccounts,
              _.concat(this.wizardData.account.externalCalendarIdentifier || [], this.wizardData.account.externalHybridCallIdentifier || []),
              this.wizardData.account.entitlements || [],
            ))
            .then((place) => {
              this.account.cisUuid = place.cisUuid;
              this.$q.all({
                createCode: this.createCodeForCloudberryAccount(this.account.cisUuid),
                saveRGroup: this.updateResourceGroup(this.account.cisUuid, this.account.ussProps),
              }).then((s) => {
                if (s && s.createCode) {
                  this.onCodeCreated(s.createCode);
                } else {
                  this.onCodeCreationFailure(s);
                }
              }, (e) => {
                this.onCodeCreationFailure(e);
              });

            }, (err) => {
              this.onCodeCreationFailure(err);
            });
        }
      } else { // Personal (never create new)
        this.createCodeForCloudberryAccount(this.account.cisUuid)
          .then(
            (code) => {
              this.onCodeCreated(code);
            },
            (err) => {
              this.onCodeCreationFailure(err);
            });
      }
    }
  }

  public init() {
    this.createActivationCode();
  }

  public onCopySuccess() {
    this.Notification.success(
      'showActivationCode.clipboardSuccess',
      undefined,
      'showActivationCode.clipboardSuccessTitle',
    );
  }

  public onCopyError() {
    this.Notification.error(
      'showActivationCode.clipboardError',
      undefined,
      'showActivationCode.clipboardErrorTitle',
    );
  }

  public generateQRCode() {
    const qrImage = require('qr-image');
    this.qrCode = qrImage.imageSync(this.activationCode, {
      ec_level: 'L',
      size: 14,
      margin: 5,
    }).toString('base64');
    this.isLoading = false;
  }

  public createHuronPlace(name, entitlements, locationUuid, directoryNumber, externalNumber) {
    return this.CsdmDataModelService.createCmiPlace(name, entitlements, locationUuid, directoryNumber, externalNumber);
  }

  public createCodeForHuronPlace(cisUuid) {
    return this.CsdmHuronPlaceService.createOtp(cisUuid);
  }

  public createCodeForHuronUser(username) {
    this.OtpService.generateOtp(username)
      .then((code) => {
        this.activationCode = code.code;
        this.friendlyActivationCode = this.formatActivationCode(this.activationCode);
        this.expiryTime = code.expiresOn;
        this.generateQRCode();
      }, err => {
        this.onCodeCreationFailure(err);
      });
  }

  public createCloudberryPlace(name, entitlements, locationUuid,  directoryNumber, externalNumber, externalLinkedAccounts) {
    return this.CsdmDataModelService.createCsdmPlace(name, entitlements, locationUuid, directoryNumber, externalNumber, externalLinkedAccounts);
  }

  public createCodeForCloudberryAccount(cisUuid) {
    return this.CsdmDataModelService.createCodeForExisting(cisUuid);
  }

  public updateResourceGroup(cisUuid, ussProps): IPromise<{}> {
    if (!ussProps) {
      return this.$q.resolve({});
    }
    ussProps.userId = cisUuid;
    return this.USSService.updateBulkUserProps([ussProps]).then((s) => {
      return s;
    }, (e) => {
      this.Notification.errorResponse(e, 'addDeviceWizard.showActivationCode.failedResourceGroup');
      return e;
    });
  }

  private onCodeCreated(code) {
    if (code) {
      this.activationCode = code.activationCode;
      this.friendlyActivationCode = this.formatActivationCode(code.activationCode);
      this.expiryTime = code.expiryTime;
      this.generateQRCode();
    }
  }

  private onCodeCreationFailure(err) {
    this.Notification.errorResponse(err, 'addDeviceWizard.showActivationCode.failedToGenerateActivationCode');
    this.isLoading = false;
    this.failure = true;
  }

  private formatActivationCode(activationCode) {
    return activationCode ? activationCode.match(/.{4}/g).join('-') : '';
  }

  public activateEmail() {
    this.showEmail = true;
    this.$stateParams.wizard.scrollToBottom(this.$window);
  }

  public getExpiresOn() {
    return moment(this.expiryTime || undefined).local().tz(this.timezone).format('LLL (z)');
  }

  public onTextClick($event) {
    $event.target.select();
  }

  public searchUser(searchString) {
    if (searchString.length >= 3) {
      const deferredCustomerOrg: IDeferred<IRecipientUser[]> = this.$q.defer();
      const deferredAdmin: IDeferred<IRecipientUser[]> = this.$q.defer();
      const transformResults = (deferred) => {
        return (data) => {
          const userList: IRecipientUser[] = data.Resources.map((r) => {
            const firstName = r.name && r.name.givenName;
            const lastName = r.name && r.name.familyName;
            return this.extractUserObject(firstName, lastName, r.displayName, r.userName, r.id, r.meta.organizationID);
          });
          deferred.resolve(userList);
        };
      };
      const searchMatchesAdmin = () => {
        return _.startsWith(this.wizardData.admin.userName, searchString) ||
          _.startsWith(this.wizardData.admin.firstName, searchString) ||
          _.startsWith(this.wizardData.admin.lastName, searchString) ||
          _.startsWith(this.wizardData.admin.displayName, searchString);
      };
      this.UserListService.listUsers(0, 6, null, null, transformResults(deferredCustomerOrg), searchString, false);
      if (this.wizardData.admin.organizationId !== this.wizardData.account.organizationId && searchMatchesAdmin()) {
        deferredAdmin.resolve([this.extractUserObject(this.wizardData.admin.firstName,
          this.wizardData.admin.lastName,
          this.wizardData.admin.displayName,
          this.wizardData.admin.userName,
          this.wizardData.admin.cisUuid,
          this.wizardData.admin.organizationId)]);
      } else {
        deferredAdmin.resolve([]);
      }
      return deferredAdmin.promise.then((ownOrgResults) => {
        return deferredCustomerOrg.promise.then((customerOrgResults) => {
          return _.sortBy(ownOrgResults.concat(customerOrgResults), ['extractedName', 'userName']);
        });
      });
    } else {
      return this.$q.resolve([]);
    }
  }

  private extractUserObject(firstName, lastName: string, displayName, userName, cisUuid, orgId): IRecipientUser {
    let name: string | null = null;
    let returnFirstName = firstName;
    if (!_.isEmpty(firstName)) {
      name = firstName;
      if (!_.isEmpty(lastName)) {
        name += ' ' + lastName;
      }
    }

    if (_.isEmpty(name)) {
      name = displayName;
    }
    if (_.isEmpty(name)) {
      name = lastName;
    }
    if (_.isEmpty(name)) {
      name = userName;
    }
    if (_.isEmpty(returnFirstName)) {
      returnFirstName = displayName;
    }
    if (_.isEmpty(returnFirstName)) {
      returnFirstName = userName;
    }
    return {
      extractedName: <string> name,
      firstName: returnFirstName,
      userName: userName,
      displayName: displayName,
      cisUuid: cisUuid,
      orgId: orgId,
    };
  }

  public selectUser($item) {
    this.selectedUser = {
      nameWithEmail: '' + $item.extractedName + ' (' + $item.userName + ')',
      email: $item.userName,
      cisUuid: $item.cisUuid,
      firstName: $item.firstName,
      orgId: $item.orgId,
    };
    this.foundUser = '';
  }

  public sendActivationCodeEmail() {
    const onEmailSent = () => {
      this.Notification.notify(
        [this.$translate.instant('showActivationCode.emailSuccess', {
          address: this.selectedUser.email,
        })],
        'success',
        this.$translate.instant('showActivationCode.emailSuccessTitle'),
      );
    };
    const onEmailSendFailure = (error) => {
      this.Notification.errorResponse(error,
        'showActivationCode.emailError',
        {
          address: this.selectedUser.email,
        });
    };

    if (this.account.deviceType === 'huron' && this.account.type === 'personal') {
      const emailInfo = {
        email: this.selectedUser.email,
        firstName: this.selectedUser.firstName,
        oneTimePassword: this.activationCode,
        expiresOn: this.getExpiresOn(),
        userId: this.selectedUser.cisUuid,
        customerId: this.selectedUser.orgId,
      };
      this.ActivationCodeEmailService.save({}, emailInfo, onEmailSent, onEmailSendFailure);
    } else {
      const cbEmailInfo = {
        toCustomerId: this.selectedUser.orgId,
        toUserId: this.selectedUser.cisUuid,
        subjectCustomerId: this.wizardData.account.organizationId,
        subjectAccountId: this.account.cisUuid,
        activationCode: this.activationCode,
        expiryTime: this.getExpiresOn(),
      };
      let mailFunction;
      if (this.account.type === 'personal') {
        if (this.account.isEntitledToHuron) {
          mailFunction = this.CsdmEmailService.sendPersonalEmail;
        } else {
          mailFunction = this.CsdmEmailService.sendPersonalCloudberryEmail;
        }
      } else {
        if (this.account.deviceType === 'cloudberry') {
          mailFunction = this.CsdmEmailService.sendCloudberryEmail;
        } else {
          mailFunction = this.CsdmEmailService.sendHuronEmail;
        }
      }

      mailFunction(cbEmailInfo).then(onEmailSent, onEmailSendFailure);
    }
  }

  public back() {
    this.$stateParams.wizard.back();
  }
}

angular.module('Core')
  .controller('ShowActivationCodeCtrl', ShowActivationCodeCtrl);
