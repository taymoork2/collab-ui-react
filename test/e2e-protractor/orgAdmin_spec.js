'use strict';
/*jshint loopfunc: true */

/* global describe */
/* global it */
/* global browser */
/* global by */
/* global expect */
/* global element */

var testuser = {
  username: 'pbr-test-admin@squared2webex.com',
  password: 'C1sc0123!',
};

var testuser2 = {
  username: 'pbr-test-user@squared2webex.com',
  password: 'C1sc0123!',
};

// Logging in. Write your tests after the login flow is complete.
describe('Login as squared team member admin user', function() {

  it('should redirect to CI global login page.', function() {
    browser.get('#/login');
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken1'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });
  });

  it('should log in with valid sso admin user and display home page', function() {
    browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser.username);
    browser.driver.findElement(by.css('#IDButton2')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken2'));
    }).then(function() {
      browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser.password);
      browser.driver.findElement(by.css('#Button1')).click();
    });

    expect(browser.getCurrentUrl()).toContain('/home');
  });

}); //State is logged-in

describe('Check squared team member entitlements', function() {
  it('clicking on users tab should change the view', function() {
    browser.driver.findElement(by.css('li[heading="Users"]')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('tabs'));
    }).then(function() {
      expect(browser.getCurrentUrl()).toContain('/users');
      //check to make sure add users panel is not visible
      expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(false);
    });
  });

  it('click on add button should show entitlements the admin can use', function () {
    browser.driver.findElement(by.id('addUsers')).click();
    expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(true);
    expect(element(by.id('usersfield')).isDisplayed()).toEqual(true);
    //This button is now covered by another <ins> element.
    //expect(element(by.id('btn_callInit')).isDisplayed()).toEqual(true);
    expect(element(by.id('btnAdd')).isDisplayed()).toEqual(true);
    element.all(by.css('.details-body .icheckbox_square-blue')).then(function(items) {
      expect(items.length).toBe(8);
      expect(element(by.id('btn_squaredTeamMember')).isDisplayed()).toEqual(true);
    });
  });

});


// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    element(by.id('setting-bar')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('logout-btn'));
    }).then(function() {
      element(by.id('logout-btn')).click();
    });
  });
});


// Log Out
describe('Wait', function() {
  it('should wait before logging in', function() {
    browser.sleep(2000);
  });
});




// Logging in. Write your tests after the login flow is complete.
describe('Login as non squared team member admin user', function() {

  it('should redirect to CI global login page.', function() {
    browser.get('#/login');
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken1'));
    }).then(function() {
      expect(browser.driver.getCurrentUrl()).toContain('idbroker.webex.com');
    });
  });

  it('should log in with valid sso admin user and display home page', function() {
    browser.driver.findElement(by.css('#IDToken1')).sendKeys(testuser2.username);
    browser.driver.findElement(by.css('#IDButton2')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.css('#IDToken2'));
    }).then(function() {
      browser.driver.findElement(by.css('#IDToken2')).sendKeys(testuser2.password);
      browser.driver.findElement(by.css('#Button1')).click();
    });

    expect(browser.getCurrentUrl()).toContain('/home');
  });

}); //State is logged-in

describe('Check non squared team member entitlements', function() {
  it('clicking on users tab should change the view', function() {
    browser.driver.findElement(by.css('li[heading="Users"]')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('tabs'));
    }).then(function() {
      expect(browser.getCurrentUrl()).toContain('/users');
      //check to make sure add users panel is not visible
      expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(false);
    });
  });

  it('click on add button should show entitlements the admin can use', function () {
    browser.driver.findElement(by.id('addUsers')).click();
    expect(element(by.id('manageUsersPanel')).isDisplayed()).toEqual(true);
    expect(element(by.id('usersfield')).isDisplayed()).toEqual(true);
    //This button is now covered by another <ins> element.
    //expect(element(by.id('btn_callInit')).isDisplayed()).toEqual(true);
    expect(element(by.id('btnAdd')).isDisplayed()).toEqual(true);
    element.all(by.css('.details-body .icheckbox_square-blue')).then(function(items) {
      expect(items.length).toBe(7);
      expect(element(by.id('btn_squaredTeamMember')).isPresent()).toBe(false);
    });
  });

});

// Log Out
describe('Log Out', function() {
  it('should log out', function() {
    element(by.id('setting-bar')).click();
    browser.driver.wait(function() {
      return browser.driver.isElementPresent(by.id('logout-btn'));
    }).then(function() {
      element(by.id('logout-btn')).click();
    });
  });
});

