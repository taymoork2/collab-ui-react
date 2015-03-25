'use strict';

/* global describe */
/* global expect */
/* global partner */
/* global navigation */
/* global utils */
/* global login */
/* global notifications */
/* global deleteTrialUtils */

xdescribe('Partner flow', function () {
  var orgId;
  var accessToken;

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });
  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function () {

    it('should login', function () {
      login.login('partner-squc-admin', '#/partner/overview');
    });

    it('should have a partner token', function (done) {
      element(by.tagName('body')).evaluate('token').then(function (token) {
        accessToken = token;
        expect(accessToken).not.toBeNull();
        done();
      });
    });

    it('should display correct tabs for user based on role', function () {

      utils.expectIsDisplayed(navigation.homeTab);
      utils.expectIsDisplayed(navigation.customersTab);
      utils.expectIsDisplayed(navigation.devicesTab);
      utils.expectIsDisplayed(navigation.reportsTab);
      utils.expectIsDisplayed(navigation.accountTab);
      utils.expectIsDisplayed(navigation.developmentTab);
      expect(navigation.getTabCount()).toBe(6);
    });

    it('should display trials list', function () {
      utils.expectIsDisplayed(partner.trialsPanel);
    });
  }); //State is logged-in

  describe('Add Partner Trial', function () {

    it('should view all trials', function () {
      utils.click(partner.viewAllLink);
      navigation.expectCurrentUrl('/customers');

      utils.expectIsDisplayed(partner.customerList);
    });

    it('should add a new trial', function (done) {
      utils.click(partner.addButton);
      utils.expectIsDisplayed(partner.addTrialForm);

      partner.assertDisabled('startTrialButton');

      utils.expectIsDisplayed(partner.squaredTrialCheckbox);
      utils.expectIsDisplayed(partner.squaredUCTrialCheckbox);

      partner.customerNameInput.sendKeys(partner.newSqUCTrial.customerName);
      partner.customerEmailInput.sendKeys(partner.newSqUCTrial.customerEmail);
      utils.click(partner.squaredTrialCheckbox);

      utils.click(partner.startTrialButton);

      utils.expectIsDisplayed(partner.newSqUCTrialRow);

      partner.newSqUCTrialRow.getAttribute('orgId').then(function (attr) {
        orgId = attr;
        expect(orgId).not.toBeNull();
        done();
      });
    }, 60000);

    it('should edit trial with uc entitlements and add one did', function (done) {
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.editLink);

      utils.expectIsDisplayed(partner.editTrialForm);

      utils.expectAttribute(partner.squaredTrialCheckbox, 'disabled', 'true');
      utils.expectAttribute(partner.squaredUCTrialCheckbox, 'disabled', 'false');

      utils.click(partner.squaredUCTrialCheckbox);

      utils.click(partner.saveUpdateButton);

      utils.expectIsDisplayed(partner.customerDidInput);

      utils.sendKeys(partner.customerDidInput, partner.dids.one);
      utils.click(partner.didAddModal);

      utils.click(partner.startTrialWithSqUCButton);

      notifications.assertSuccess(partner.newTrial.customerName, 'You have successfully edited a trial for');

      utils.expectIsDisplayed(partner.newTrialRow);
    }, 60000);

    it('should add new did to the trial', function (done) {
      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.click(partner.editDidLink);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectValueToBeSet(partner.customerDidAddInput, "+" + partner.dids.one);

      partner.customerDidInput.sendKeys(partner.dids.two);
      utils.click(partner.didAddModal);
      utils.click(partner.addDidButton);
      utils.click(partner.notifyCustLaterLink);

      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectIsDisplayed(partner.didNumberSpan);
      utils.expectTextToBeSet(partner.didNumberSpan, '2');

      utils.click(partner.editDidLink);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectValueToContain(partner.customerDidAddInput, "+" + partner.dids.one);
      utils.expectValueToContain(partner.customerDidAddInput, "+" + partner.dids.two);

      element.all(by.css('.token')).filter(function (elem, index) {
        var label = elem.getWebElement().findElement(By.css('.token-label'));
        return label.getText().then(function (text) {
          return text === utils.formatPhoneNumbers(partner.dids.two.toString());
        });
      }).then(function (tokens) {
        var close = tokens[0].getWebElement().findElement(By.css('.close'));
        close.click();
      });
      utils.click(partner.addDidButton);
      utils.expectIsDisplayed(partner.removeDidPanel);
      utils.expectIsDisplayed(partner.removeDidButton);
      utils.click(partner.removeDidButton);
      utils.click(partner.notifyCustLaterLink);

      utils.click(partner.newSqUCTrialRow);

      utils.expectIsDisplayed(partner.previewPanel);
      utils.expectIsDisplayed(partner.didNumberSpan);
      utils.expectTextToBeSet(partner.didNumberSpan, '1');

      utils.click(partner.editDidLink);

      utils.expectIsDisplayed(partner.customerDidInput);
      utils.expectValueToBeSet(partner.customerDidAddInput, "+" + partner.dids.one);
      utils.click(partner.addDidDismissButton);

      done();
    }, 60000);

  });

  it('should delete an exisiting org thus deleting trial', function () {
    expect(deleteTrialUtils.deleteOrg(orgId, accessToken)).toEqual(200);
    expect(deleteUtils.deleteSquaredUCCustomer(orgId, accessToken)).toEqual(204);

  });

  // Log Out
  describe('Log Out', function () {
    it('should log out', function () {
      navigation.logout();
    });
  });
});
