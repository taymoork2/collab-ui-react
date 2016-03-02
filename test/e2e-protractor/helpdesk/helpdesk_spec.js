describe('Helpdesk Page', function () {
  afterEach(function () {
    utils.dumpConsoleErrors();
  });


  describe('Login to support page with helpdesk role', function () {

    it('should log in to helpdesk via support page', function () {
      // Precondition is that this user has helpdesk access...
      login.login('helpdesk-admin', '#');//#/support/');
    });

    it('should show the tools card with helpdesk launch button', function () {
      var toolsCard = element(by.id('supportPageToolsCard'));
      utils.expectIsDisplayed(toolsCard);
      utils.expectText(toolsCard, "View Help Desk Support");
    });

    it('should log out', function () {
      navigation.logout();
    });
  });

  describe('Login to support page without helpdesk role', function () {

    it('should log in to helpdesk via support page', function () {
      login.login('mockcisco-support-user', '#');
    });

    it('should not show the tools card', function () {
      var toolsCard = element(by.id('supportPageToolsCard'));
      utils.expectIsNotDisplayed(toolsCard);
    });

    it('should log out', function () {
      navigation.logout();
    });
  });


});
