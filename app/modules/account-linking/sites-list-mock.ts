import { IACSiteInfo } from './account-linking.interface';

const mockSiteList: IACSiteInfo[] = [
  {
    linkedSiteUrl: 'mock1.webex.com',
    accountLinkingStatus: 'Unknown',
    usersLinked: 100,
    isSiteAdmin: false,
  },
  {
    linkedSiteUrl: 'mock2.webex.com',
    accountLinkingStatus: 'Unknown',
    usersLinked: 100,
    isSiteAdmin: false,
  },
  {
    linkedSiteUrl: 'mock3.webex.com',
    accountLinkingStatus: 'Unknown',
    usersLinked: 10,
    isSiteAdmin: false,
  },

];

export { mockSiteList };
