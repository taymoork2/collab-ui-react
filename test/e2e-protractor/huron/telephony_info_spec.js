'use strict';

var testuser = {
  username: 'pbr-org-admin@squared2webex.com',
  password: 'C1sc0123!'
};

// Logging in. Write your tests after the login flow is complete.
describe('Telephony Info', function() {
  it('should login', function(){
    login.login(testuser.username,testuser.password);
  });

  it('should log out', function() {
    navigation.logout();
  });
});
