import { IACSiteInfo } from './account-linking.interface';
import { mockSiteList } from './sites-list-mock';

export class LinkedSitesService {

  /* @ngInject */
  constructor(private Authinfo: any,
              private Userservice) {
  }

  public init(): void {
  }

  public filterSites(): ng.IPromise<IACSiteInfo[]> {
    const userId = this.Authinfo.getUserId();
    //TODO: Explore unhappy cases. Currently only handling happy cases !
    return this.Userservice.getUserAsPromise(userId).then((response) => {
      const adminTrainSiteNames =  response.data.adminTrainSiteNames;
      const conferenceServicesWithLinkedSiteUrl = this.Authinfo.getConferenceServicesWithLinkedSiteUrl();
      const sites: IACSiteInfo[] = _.map(conferenceServicesWithLinkedSiteUrl, (serviceFeature: any) => {
        return {
          linkedSiteUrl: serviceFeature.license.linkedSiteUrl,
          accountLinkingStatus: 'Unknown',
          usersLinked: undefined,
          isSiteAdmin: _.includes(adminTrainSiteNames, serviceFeature.license.linkedSiteUrl),
        };
      });
      return sites.concat(mockSiteList);
    });
  }
}
