'use strict';

/* global describe */
/* global expect */

var testuser = {
  username: 'admin@fancy-lawyer.com',
  password: 'P@ssword123'
};

describe('Partner flow', function() {
  // Logging in. Write your tests after the login flow is complete.
  describe('Login as partner admin user', function() {

    it('should login', function(){
      login.partnerlogin(testuser.username, testuser.password);
    });

    it('should display correct tabs for user based on role', function() {
      expect(navigation.getTabCount()).toBe(1);
      expect(navigation.partnerHomeTab.isDisplayed()).toBeTruthy();
    });

  }); //State is logged-in

  // Log Out
  describe('Log Out', function() {
    it('should log out', function() {
      navigation.logout();
    });
  });
});
