import IExternalLinkedAccount = csdm.IExternalLinkedAccount;
export class ExternalLinkedAccountHelperService {

  private static cleaningWhitelist = ['squared-fusion-uc', 'squared-fusion-cal', 'squared-fusion-gcal'];
  /* @ngInject  */
  constructor() {
  }

  public getExternalLinkedAccountForSave(existingLinks: IExternalLinkedAccount[] = [], newLinks: IExternalLinkedAccount[], newEntitlements: string[]): IExternalLinkedAccount[] | null {
    const externalLinkedAccounts: IExternalLinkedAccount[] = [];
    _.forEach(existingLinks, (existingLink) => {
      if (
        _.some(newLinks,
          (newLink) => {
            return existingLink.providerID === newLink.providerID
              && !ExternalLinkedAccountHelperService.linksAreEqual(existingLink, newLink);
          })
        || (
          !_.some(newEntitlements, (entitlement) => entitlement === existingLink.providerID)
          && _.some(ExternalLinkedAccountHelperService.cleaningWhitelist, (entitlement) => existingLink.providerID === entitlement)
        )
      ) {
        existingLink.operation = 'delete';
        externalLinkedAccounts.push(existingLink);
      }
    });
    _.forEach(newLinks, (newLink) => {
      if (!_.some(existingLinks, (existingLink) => ExternalLinkedAccountHelperService.linksAreEqual(existingLink, newLink))) {
        externalLinkedAccounts.push(newLink);
      }
    });

    return externalLinkedAccounts.length === 0 ? null : externalLinkedAccounts;
  }

  private static linksAreEqual(existingLink, newLink) {
    return existingLink.status === newLink.status
      && existingLink.providerID === newLink.providerID
      && existingLink.accountGUID === newLink.accountGUID;
  }
}

export default angular
  .module('Squared').service('ExtLinkHelperService', ExternalLinkedAccountHelperService)
  .name;
