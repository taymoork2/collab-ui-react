'use strict';

describe('Places Page', function () {
  var placeName;
  var placesPage = require('../pages/places.page.js');

  describe('Display the Places page', function () {
    it('should login as org admin', function () {
      login.login('sqtest-admin', '#/places');
    });
  });

  describe('Add new place', function () {
    it('should open New Place wizard', function () {
      utils.waitUntilEnabled(placesPage.buttons.addPlace);
      utils.click(placesPage.buttons.addPlace);
      utils.waitForModal().then(function () {
        utils.expectIsDisplayed(placesPage.addPlaceWizard.title);
        utils.expectIsDisabled(placesPage.addPlaceWizard.nextButton);
      });
    });

    it('should enable Next button when specifying a place name', function () {
      placeName = utils.randomTestRoom();
      utils.sendKeys(placesPage.addPlaceWizard.newSharedSpace.nameInput, placeName);
      utils.expectIsEnabled(placesPage.addPlaceWizard.nextButton);
    });

    it('should enable Next button when selecting a place type', function () {
      utils.click(placesPage.addPlaceWizard.nextButton);
      utils.expectIsDisabled(placesPage.addPlaceWizard.nextButton);
      utils.click(placesPage.addPlaceWizard.chooseDeviceType.cloudberryTypeButton);
      utils.expectIsEnabled(placesPage.addPlaceWizard.nextButton);
    });

    it('should offer service configuration', function () {
      utils.click(placesPage.addPlaceWizard.nextButton);
      utils.expectIsDisplayed(placesPage.addPlaceWizard.editServices.firstServiceOption);
      utils.expectIsEnabled(placesPage.addPlaceWizard.nextButton);
    });

    it('should generate an activation code', function () {
      utils.click(placesPage.addPlaceWizard.nextButton);
      utils.waitForSpinner();
      utils.expectIsDisplayed(placesPage.addPlaceWizard.showActivationCode.qrCodeImage);
      utils.expectIsDisplayed(placesPage.addPlaceWizard.showActivationCode.activationCode);
    });

    it('should close the wizard', function () {
      utils.click(placesPage.addPlaceWizard.closeButton);
      utils.expectIsNotDisplayed(placesPage.addPlaceWizard.title);
    });
  });

  describe('View place', function () {
    it('should be possible to find the new place in the list', function () {
      utils.sendKeys(placesPage.searchInput, placeName);
      utils.waitForSpinner();
      utils.expectIsDisplayed(placesPage.placeNameInList(placeName));
    });

    it('should open the right hand pane when clicking the place', function () {
      utils.click(placesPage.placeNameInList(placeName));
      utils.waitForPresence(placesPage.placeOverview.title);
      utils.expectText(placesPage.placeOverview.title, placeName);
    });

    it('should close the right hand pane', function () {
      utils.click(placesPage.placeOverview.close);
      utils.expectIsNotDisplayed(placesPage.placeOverview.title);
    })
  });

  describe('Delete place', function () {
    it('should show a confirmation modal', function () {
      utils.click(placesPage.placeListAction);
      utils.click(placesPage.placeListActionDelete);
      utils.waitForModal();
      utils.expectIsDisplayed(placesPage.deleteConfirmation.title);
    });

    it('should delete place', function () {
      utils.click(placesPage.deleteConfirmation.deletePlaceButton);
      utils.waitForSpinner();
      utils.expectIsNotDisplayed(placesPage.deleteConfirmation.title);
      utils.expectIsNotDisplayed(placesPage.placeNameInList(placeName));
    });
  });
});
