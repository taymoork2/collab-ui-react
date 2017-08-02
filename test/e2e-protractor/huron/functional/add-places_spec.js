import * as provisioner from '../../provisioner/provisioner';
import { huronCustomer } from '../../provisioner/huron-customer-config';
import { AddPlacesPage } from '../pages/addPlaces.page';
import { CallSpeedDialsPage } from '../pages/callSpeedDials.page';

const addPlaces = new AddPlacesPage();
const SpeedDialsPage = new CallSpeedDialsPage();

describe('Huron Functional: add-places', () => {
  const customer = huronCustomer('add-place');
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

  it('should navigate to places page', () => {
    utils.click(addPlaces.placesTab);
    navigation.expectDriverCurrentUrl('places');
  });

  describe('Internal Places Section', () => {
    describe('create a new place with Phone Dialing only', () => {
      it('should show an option to add new place', () => {
        utils.click(addPlaces.addNewPlaceEmpty);
        utils.expectIsDisplayed(addPlaces.newPlaceInput);
      });
      it('should take a new location input and allow to save', () => {
        utils.expectIsDisabled(addPlaces.nxtBtn);
        utils.sendKeys(addPlaces.newPlaceInput, 'Naboo');
        utils.expectIsEnabled(addPlaces.nxtBtn);
      });
      it('should go to device selection page and select a device', () => {
        utils.click(addPlaces.nxtBtn);
        utils.expectIsDisabled(addPlaces.nxtBtn2);
        utils.click(addPlaces.selectHuron);
        utils.expectIsEnabled(addPlaces.nxtBtn2);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(addPlaces.nxtBtn2);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '304');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn3);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(addPlaces.closeGrp);
      });
    });

    describe('create a new place with Spark room', () => {
      it('should show an option to add place', () => {
        utils.click(addPlaces.addNewPlace);
        utils.expectIsDisplayed(addPlaces.newPlaceInput);
      });
      it('should take a new location input and enable next button', () => {
        utils.expectIsDisabled(addPlaces.nxtBtn);
        utils.sendKeys(addPlaces.newPlaceInput, 'Jedha');
        utils.expectIsEnabled(addPlaces.nxtBtn);
      });
      it('should go to device selection page and select a room', () => {
        utils.click(addPlaces.nxtBtn);
        utils.expectIsDisabled(addPlaces.nxtBtn2);
        utils.click(addPlaces.selectCloudberry);
        utils.expectIsEnabled(addPlaces.nxtBtn2);
      });
      it('should advance to service select and default to Spark only', () => {
        utils.click(addPlaces.nxtBtn2);
        utils.click(addPlaces.sparkOnlyRadio);
        utils.expectIsEnabled(addPlaces.nxtBtn4);
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn4);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(addPlaces.closeGrp);
      });
    });

    describe('create a new place with Spark + Phone Dialing room', () => {
      it('should show an option to add place', () => {
        utils.click(addPlaces.addNewPlace);
        utils.expectIsDisplayed(addPlaces.newPlaceInput);
      });
      it('should take a new location input and enable next button', () => {
        utils.expectIsDisabled(addPlaces.nxtBtn);
        utils.sendKeys(addPlaces.newPlaceInput, 'Eadu');
        utils.expectIsEnabled(addPlaces.nxtBtn);
      });
      it('should go to device selection page and select a room', () => {
        utils.click(addPlaces.nxtBtn);
        utils.expectIsDisabled(addPlaces.nxtBtn2);
        utils.click(addPlaces.selectCloudberry);
        utils.expectIsEnabled(addPlaces.nxtBtn2);
      });
      it('should advance to service select and select Spark + Phone Dialing', () => {
        utils.click(addPlaces.nxtBtn2);
        utils.click(addPlaces.sparkPhoneRadio);
        utils.expectIsEnabled(addPlaces.nxtBtn4);
      });
      it('should go to Assign Numbers section and select an extension', () => {
        utils.click(addPlaces.nxtBtn4);
        utils.selectDropdown('.csSelect-container[name="internalNumber"]', '305');
      });
      it('should go to a final setup patch with a QR', () => {
        utils.click(addPlaces.nxtBtn3);
        utils.expectIsDisplayed(addPlaces.qrCode);
      });
      it('should close current setup', () => {
        utils.click(addPlaces.closeGrp);
      });
    });

    describe('Verify setup', () => {
      describe('Test Naboo (Spark + Spark Call place) setup', () => {
        it('should list newly added place by search', () =>{
          utils.click(addPlaces.searchPlaces);
          utils.sendKeys(addPlaces.searchBar, 'Naboo');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(addPlaces.clickLocation);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
          it('should have Service section', () =>{
            utils.expectIsDisplayed(addPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(addPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(addPlaces.callClick);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(addPlaces.callStngsPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(addPlaces.dirNumSct);
          });
          it('should have a Features section', () => {
            utils.expectIsDisplayed(addPlaces.featuresSct);
          });
          it('should have Speed Dials in the Features section', () => {
            utils.expectIsDisplayed(addPlaces.callOverview.features.speedDials);
          });

          describe('Speed Dials action menu', () => {
            afterAll(function () {
              utils.click(addPlaces.callSubMenu);
            });
            it('should show Add Speed Dial menu item', () => {
              // utils.click(addPlaces.overviewPg);
              // utils.click(addPlaces.callClick);
              utils.click(addPlaces.callOverview.features.speedDials);
              utils.click(SpeedDialsPage.actionMenu);
              utils.expectIsDisplayed(SpeedDialsPage.addSpeedDialAction);
            });
            it('should show Reorder menu item', () => {
              utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
            });

            describe('Add Speed Dial section', () => {
              beforeAll(function () {
                utils.click(SpeedDialsPage.addSpeedDialAction);
              });
              it('should show the Speed Dials title', () => {
                utils.expectIsDisplayed(SpeedDialsPage.title);
              });
              it('should show Cancel button', () => {
                utils.expectIsDisplayed(SpeedDialsPage.speedDialCancelButton);
              });
              it('should show disabled Save button', () => {
                utils.expectIsDisplayed(SpeedDialsPage.speedDialSaveButton);
                utils.expectIsDisabled(SpeedDialsPage.speedDialSaveButton);
              });
              it('should show Contact Name fields', () => {
                utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
                utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameInput);
              });
              it('should show Destination fields', () => {
                utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationLabel);
                utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationDropdown);
              });

              describe('Cancel Button', () => {
                it('should take user back to Speed Dial list', () => {
                  utils.click(SpeedDialsPage.speedDialCancelButton);
                  utils.expectIsNotDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
                  utils.expectIsDisplayed(SpeedDialsPage.actionMenu);
                });
              });

              describe('Add new Speed Dial action', () => {
                const SPEEDDIAL_DESTINATION_E164_NAME = 'Ann Anderson External E164';
                const SPEEDDIAL_DESTINATION_E164_VALUE = '4695550000';
                const SPEEDDIAL_DESTINATION_URI_NAME = 'Billy Bob URI Address';
                const SPEEDDIAL_DESTINATION_URI_VALUE = 'billy.bob@uri.com';
                const SPEEDDIAL_DESTINATION_CUSTOM_NAME = 'Curtis Carter Custom DN';
                const SPEEDDIAL_DESTINATION_CUSTOM_VALUE = '5001';
                const SPEEDDIAL_DESTINATION_TYPE_EXTERNAL = 'External';
                const SPEEDDIAL_DESTINATION_TYPE_URI = 'URI Address';
                const SPEEDDIAL_DESTINATION_TYPE_CUSTOM = 'Custom';
                beforeEach(function () {
                  utils.click(addPlaces.callOverview.main);
                  utils.click(addPlaces.callOverview.services.call);
                  utils.click(addPlaces.callOverview.features.speedDials);
                  utils.click(SpeedDialsPage.actionMenu);
                  utils.click(SpeedDialsPage.addSpeedDialAction);
                  utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialContactNameInput);
                  utils.expectIsDisplayed(SpeedDialsPage.newSpeedDialDestinationDropdown);
                });
                afterEach(function () {
                  utils.expectIsNotDisplayed(SpeedDialsPage.newSpeedDialContactNameLabel);
                });
                it('should be able to save a new external number speed dial', () => {
                  utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_EXTERNAL);
                  utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_E164_NAME);
                  utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputPhone, SPEEDDIAL_DESTINATION_E164_VALUE);
                  utils.click(SpeedDialsPage.speedDialSaveButton);
                  utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_E164_NAME)
                });
                it('should be able to save a new uri speed dial', () => {
                  utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_URI);
                  utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_URI_NAME);
                  utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputUri, SPEEDDIAL_DESTINATION_URI_VALUE);
                  utils.click(SpeedDialsPage.speedDialSaveButton);
                  utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_URI_NAME)
                });
                it('should be able to save a new internal number speed dial', () => {
                  utils.selectDropdown('.csSelect-container[name="CallDestTypeSelect"]', SPEEDDIAL_DESTINATION_TYPE_CUSTOM);
                  utils.sendKeys(SpeedDialsPage.newSpeedDialContactNameInput, SPEEDDIAL_DESTINATION_CUSTOM_NAME);
                  utils.sendKeys(SpeedDialsPage.newSpeedDialDestinationInputCustom, SPEEDDIAL_DESTINATION_CUSTOM_VALUE);
                  utils.click(SpeedDialsPage.speedDialSaveButton);
                  utils.waitForText(SpeedDialsPage.speedDialLabels, SPEEDDIAL_DESTINATION_CUSTOM_NAME)
                });
              });

              describe('Reorder Speed Dial action', () => {
                beforeAll(function () {
                  utils.click(addPlaces.callSubMenu);
                  utils.click(addPlaces.callOverview.features.speedDials);
                  utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
                  utils.click(SpeedDialsPage.actionMenu);
                  utils.expectIsDisplayed(SpeedDialsPage.reorderSpeedDialAction);
                  utils.click(SpeedDialsPage.reorderSpeedDialAction);
                });
                it('should show the Speed Dials title', () => {
                  utils.expectIsDisplayed(SpeedDialsPage.title);
                });
                it('should show Cancel button', () => {
                  utils.expectIsDisplayed(SpeedDialsPage.speedDialCancelButton);
                });
                it('should show Save button', () => {
                  utils.expectIsDisplayed(SpeedDialsPage.speedDialSaveButton);
                });
                it('should show draggable handle', () => {
                  utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntryDraggableHandles, 0);
                });

                describe('Draggable Handle', () => {
                  it('should have two or more speed dials for this test', () => {
                    utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntries, 1);
                  });
                  // Unable to get Drag and Drop to work at this time.
                  xit('should be able to move speed dial entry', () => {
                    SpeedDialsPage.firstSpeedDialEntryLabel.getText().then(function (initialFirstSpeedDialName) {
                      utils.dragAndDrop(SpeedDialsPage.speedDialEntries.first(), SpeedDialsPage.speedDialEntries.last());
                      utils.expectNotText(SpeedDialsPage.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
                    });
                  });
                });
                it('should be able to save reordered speed dials', () => {
                  utils.click(SpeedDialsPage.speedDialSaveButton);
                });
                it('saving should take you back to the speed dials list', () => {
                  utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
                  utils.expectIsNotDisplayed(SpeedDialsPage.speedDialEntryDraggableHandles);
                });
              });

              describe('Delete speed dials', () => {
                beforeAll(function () {
                  utils.click(addPlaces.callSubMenu);
                  utils.click(addPlaces.callOverview.features.speedDials);
                  utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel); // expect at least one existing speed dial entry
                });
                it('should see a list of speed dials that can be deleted', () => {
                  utils.expectCountToBeGreater(SpeedDialsPage.speedDialEntries, 0);
                  utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialEntryLabel);
                  utils.expectIsDisplayed(SpeedDialsPage.firstSpeedDialDeleteButton);
                });
                it('should be able to remove an existing speed dial', () => {
                  SpeedDialsPage.firstSpeedDialEntryLabel.getText().then(function (initialFirstSpeedDialName) {
                    utils.click(SpeedDialsPage.firstSpeedDialDeleteButton);
                    utils.expectIsDisplayed(SpeedDialsPage.speedDialDeleteConfirmationButton);
                    utils.click(SpeedDialsPage.speedDialDeleteConfirmationButton);
                    utils.expectNotText(SpeedDialsPage.firstSpeedDialEntryLabel, initialFirstSpeedDialName);
                  });
                });
              });
            });
          });

          it('should click on Primary Directory Number', () => {
            utils.click(addPlaces.primaryClick);
          });
          it('should land on Line Configuration page', () => {
            utils.expectIsDisplayed(addPlaces.LineConfigPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(addPlaces.dirNumSct);
          });
          it('should have Call Forwarding section', () => {
            utils.expectIsDisplayed(addPlaces.callFwdSct);
          });
          it('should have Simultaneous Calls section', () => {
            utils.expectIsDisplayed(addPlaces.simulCallSct);
          });
          it('should have Caller ID section', () => {
            utils.expectIsDisplayed(addPlaces.callerIdSct);
          });
          it('should have Auto Answer section', () => {
            utils.expectIsDisplayed(addPlaces.autoAnsSct);
          });
          it('should have Shared Line section', () => {
            utils.expectIsDisplayed(addPlaces.sharedLineSct);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(addPlaces.sideNavClose);
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
        });
      });

      describe('Test Jedha (Spark-only place without PSTN service) setup', () => {
        it('should clear previous search and search for Jedha', () => {
          utils.click(addPlaces.clearSearchPlace);
          utils.sendKeys(addPlaces.searchBar, 'Jedha');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(addPlaces.clickLocation2);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
          it('should have Service section', () => {
            utils.expectIsDisplayed(addPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(addPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(addPlaces.callClick2);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(addPlaces.callStngsPg);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(addPlaces.sideNavClose);
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
        });
      });

      describe('Test Eadu (Spark-only place with PSTN service) setup', () => {
        it('should clear previous search and search for Eadu', () => {
          utils.click(addPlaces.clearSearchPlace);
          utils.sendKeys(addPlaces.searchBar, 'Eadu');
        });
        it('should click on newly added place and bring up side menu', () => {
          utils.click(addPlaces.clickLocation3);
        });

        describe('Side Panel Options', () => {
          it('should land on overview page', () => {
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
          it('should have Service section', () => {
            utils.expectIsDisplayed(addPlaces.servicesSctn);
          });
          it('should have Devices section', () => {
            utils.expectIsDisplayed(addPlaces.devicesSctn);
          });
          it('should select Call under services and navigate to the next page', () => {
            utils.click(addPlaces.callClick);
          });
          it('should land on Call Settings page', () => {
            utils.expectIsDisplayed(addPlaces.callStngsPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(addPlaces.dirNumSct);
          });
          it('should have a Features section', () => {
            utils.expectIsDisplayed(addPlaces.featuresSct);
          });
          it('should click on Primary Directory Number', () => {
            utils.click(addPlaces.primaryClick);
          });
          it('should land on Line Configuration page', () => {
            utils.expectIsDisplayed(addPlaces.LineConfigPg);
          });
          it('should have Directory Numbers section', () => {
            utils.expectIsDisplayed(addPlaces.dirNumSct);
          });
          it('should have Caller ID section', () => {
            utils.expectIsDisplayed(addPlaces.callerIdSct);
          });
          it('should exit side navigation and return to main Places page', () => {
            utils.click(addPlaces.sideNavClose);
            utils.expectIsDisplayed(addPlaces.overviewPg);
          });
        });
      });
    });
  });
});
