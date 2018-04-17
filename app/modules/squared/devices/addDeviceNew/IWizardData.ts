declare namespace csdm {
  interface IWizardData {
    admin: IAdminUser;
    recipient: IRecipientUser;
    function: string;
    showPersonal: boolean;
    account: IAccountData;
    title: string;
  }
  interface IAccountData extends ICIdentity {
    externalHybridCallIdentifier?: IExternalLinkedAccount[];
    externalCalendarIdentifier?: IExternalLinkedAccount[];
    externalLinkedAccounts?: IExternalLinkedAccount[];
    enableCalService?: boolean;
    username?: string;
    entitlements?: string[];
    locationUuid?: string;
    externalNumber?: string;
    directoryNumber?: string;
    ussProps: any;
    isEntitledToHuron: boolean;

    deviceType: string;
    type: string;
    name: string;
  }

  interface IAdminUser extends ICIdentity {
    displayName: string;
    lastName: string;
    firstName: string;
    userName: string;
  }


  interface IRecipientUser extends ICIdentity {
    extractedName?: string;
    email?: string;
    userName?: string;
    displayName?: string;
    nameWithEmail?: string;
    firstName: string;
  }

  interface ICIdentity {
    cisUuid: string;
    orgId: string;
    /* @deprecated TODO: get rid of, use orgId: string*/
    organizationId?: string;
  }
}
