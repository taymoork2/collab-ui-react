import * as provisioner from '../../../provisioner/provisioner';
import { huronCustomer } from '../../../provisioner/huron/huron-customer-config';
import { CallUserPage } from '../../pages/callUser.page';

const CallUser = new CallUserPage();

/* globals, navigation, users, telephony */
describe('Huron Functional: user-features', () => {
  const customer = huronCustomer({
    test: 'user-features',
    users: { noOfUsers: 5, noOfDids: 0 },
  });
  const USERS = customer.users;

  beforeAll(done => {
    provisioner.provisionCustomerAndLogin(customer)
      .then(done);
  });
  afterAll(done => {
    provisioner.tearDownAtlasCustomer(customer.partner, customer.name).then(done);
  });

  it('should be on overview page of customer portal', () => {
    navigation.expectDriverCurrentUrl('overview');
    utils.expectIsDisplayed(navigation.tabs);
  });
  it('should navigate to Users overview page', () => {
    utils.click(navigation.usersTab);
    navigation.expectDriverCurrentUrl('users');
  });

  it('should enter the user details on the search bar and Navigate to user details view', () => {
    utils.click(CallUser.usersList.searchFilter);
    utils.searchAndClick(USERS[0].email);
    utils.expectIsDisplayed(users.servicesPanel);
    utils.expectIsDisplayed(users.communicationService);
  });
  it('should navigate to call details view', () => {
    utils.click(users.communicationService);
    utils.expectIsDisplayed(CallUser.callOverview.features.title);
    utils.expectIsDisplayed(CallUser.callOverview.features.singleNumberReach);
    utils.expectIsDisplayed(CallUser.callOverview.features.speedDials);
    utils.expectIsDisplayed(CallUser.callOverview.features.dialingRestrictions);
  });

  describe('User Call Features', () => {
    describe('Single Number Reach', () => {
      it('should navigate to Single Number Reach details view', () => {
        // TODO: Need to add tests
        utils.click(CallUser.callOverview.features.singleNumberReach);
        utils.expectIsDisplayed(telephony.snrTitle);
        utils.expectIsDisplayed(telephony.snrSwitch);
      });
      it('should navigate back to call details view', () => {
        utils.click(CallUser.callSubMenu);
        utils.expectIsDisplayed(CallUser.callOverview.features.title);
      });
    });

    describe('Dialing Restrictions', () => {
      it('should navigate to Dialing Restrictions details view', () => {
        // TODO: Need to add tests
        utils.click(CallUser.callOverview.features.dialingRestrictions);
        utils.expectIsDisplayed(CallUser.dialingRestrictions.nationaDialing.title);
        utils.expectIsDisplayed(CallUser.dialingRestrictions.premiumDialing.title);
        utils.expectIsDisplayed(CallUser.dialingRestrictions.internationalDialing.title);
      });
      it('should navigate back to call details view', () => {
        utils.click(CallUser.callSubMenu);
        utils.expectIsDisplayed(CallUser.callOverview.features.title);
      });
    });

    describe('External Call Transfer/Conference', () => {
      it('should navigate to External Call Transfer/Conference details view', () => {
        // TODO: Need to add tests
        utils.click(users.closeSidePanel);
      });
    });
  });
});
