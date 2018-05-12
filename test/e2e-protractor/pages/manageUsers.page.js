'use strict';

var manageUsersPage = function () {
  this.modal = element(by.css('.modal-content > div > div'));

  this.actionCards = {
    manualAddOrModifyUsers: element(by.cssContainingText('cr-action-card h4', 'Manually Add or Modify Users')),
    manualAddUsers: element(by.cssContainingText('cr-action-card h4', 'Manually Add Users')),
    csvAddOrModifyUsers: element(by.cssContainingText('cr-action-card h4', 'CSV Add or Modify Users')),
  };

  this.buttons = {
    manageUsers: element(by.id('manageUsers')),
    modalCloseButton: element(by.css('.modal-header .close[aria-label="Close"]')),

    next: element(by.buttonText('Next')),
    save: element(by.buttonText('Save')),
    back: element(by.buttonText('Back')),
    submit: element(by.buttonText('Submit')),
    done: element(by.buttonText('Done')),
    finish: element(by.buttonText('Finish')),
  };

  this.links = {
    setupAutoAssignTemplate: element(by.cssContainingText('.auto-assign .auto-assign__setup-link', 'Set up Auto-Assign Template')),
  };

  this.modalDialog = {
    title: element(by.css('.reveal-modal.dialog .modal-content .modal-title')),
    exportButton: element(by.css('.reveal-modal.dialog .modal-content .modal-footer button.btn--primary')),
    exportWarningButton: element(by.css('.reveal-modal.dialog .modal-content .modal-footer button.btn--alert')),
    cancelButton: element(by.css('.reveal-modal.dialog .modal-content .modal-footer button:not(.btn--primary)')),
  };

  // add or modify users
  this.select = {
    title: element(by.css('.modal-body h4:first-of-type')),
    radio: {
      orgManual: element(by.css('label[for=org-manual]')),
      orgBulk: element(by.css('label[for=org-bulk]')),
    },
  };

  // email suppress
  this.emailSuppress = {
    emailSuppressIcon: element(by.css('.icon-circle-email')),
  };

  // Manually add or Modify Users
  this.manual = {
    clearButton: element(by.css('.onboard-users .icon-trash')),
    errorOverMaxUsers: element(by.css('.onboard-users .error-over-max-users')),
    paidMsgCheckbox: element(by.css('label[for="paid-msg"]')),

    radio: {
      emailAddress: element(by.css('label[for="radioEmail"]')),
      nameAndEmail: element(by.css('label[for="radioNamesAndEmail"]')),
    },

    emailAddress: {
      addUsersField: element(by.id('usersfield-tokenfield')),
      tokens: element.all(by.css('.tokenfield .token')),
      invalidTokens: element.all(by.css('.tokenfield .token.invalid')),
    },

    namesAndEmail: {
      firstName: element(by.id('firstName')),
      lastName: element(by.id('lastName')),
      emailAddress: element(by.id('emailAddress')),
      plusIcon: element(by.css('.plus-icon-active')),
      tokenField: element(by.id('usersfield')),
    },

    errors: {
      autoAssignTemplateEnabledCannotOnboardExistingUser: element(by.cssContainingText('.error-msg p', 'The Auto-Assign Template is enabled. You can only modify existing users')),
    },
  };

  // Bulk Modify Users
  this.bulk = {
    title: element(by.css('.user-csv-bulk h4:first-of-type')),
    export: {
      downloadTemplateButton: element(by.css('.user-csv-export .download-template')),
      exportCsvButton: element(by.css('.user-csv-export .hotspot')),
      exportSpinner: element(by.css('.user-csv-export .icon-spinner')),
      cancelExportButton: element(by.css('.user-csv-export .prompt .cancel-download')),
      confirmExportCsvButton: element(by.buttonText('Export')),
    },

    import: {
      uploadInput: element(by.id('upload')),
      removeFileButton: element(by.css('.user-csv-upload .reset-file')),
      importFileName: element(by.css('.user-csv-upload .file-drop-inactive p')),
      addServicesOnlyRadio: element(by.css('label[for=import-add-only]')),
      addAdnRemoveServicesRadio: element(by.css('label[for=import-add-remove]')),
    },
  };

  this.importStatus = {
    statusDisplay: element(by.css('.user-csv-results')),
    title: element(by.css('.modal-body h5:first-of-type')),
    progressPercentage: element(by.css('.csv-process-content .progressbar-progress')),
    progressFileName: element(by.css('.csv-process-content .csv-filename')),
    newUsers: element(by.css('.new-users .total')),
    updatedUsers: element(by.css('.updated-users .total')),
    errorUsers: element(by.css('.error-users .total')),
    uploadComplete: element(by.css('.user-csv-results .upload-complete .progressbar-label span.progressbar-label:first-child')),
  };

  this.autoAssignTemplate = {
    optionsMenu: {
      toggleButton: element(by.css('auto-assign-template-manage-options .actions-menu')),
      modify: element(by.cssContainingText('auto-assign-template-manage-options .actions-menu li', 'Modify Auto-Assign Template')),
      delete: element(by.cssContainingText('auto-assign-template-manage-options .actions-menu li', 'Delete Auto-Assign Template')),
      deleteConfirm: element(by.cssContainingText('.modal-footer .btn', 'Delete')),
    },
    createTemplate: {
      title: element(by.cssContainingText('.modal-header > h3', 'Set Up Auto-Assign Template')),
      subtitle: element(by.cssContainingText('.modal-body > h4', 'Add Services for Users')),
    },
    assignableServices: {
      licenses: {
        messaging: {
          firstLicense: element.all(by.cssContainingText('assignable-services label[for^="MS_"]', 'Cisco Webex Messaging')).first(),
          firstLicenseCheckbox: element.all(by.css('assignable-services input[type="checkbox"][name^="MS_"]')).first(),
        },
        meeting: {
          firstLicense: element.all(by.cssContainingText('assignable-services label[for^="CF_"]', 'Cisco Webex 25 party Meetings')).first(),
          firstLicenseCheckbox: element.all(by.css('assignable-services input[type="checkbox"][name^="CF_"]')).first(),
        },
      },
    },
    templateSummary: {
      summary: element(by.css('auto-assign-template-summary')),
      messagingItem: element(by.cssContainingText('auto-assign-template-summary h6', 'Cisco Webex Messaging')),
      meetingItem: element(by.cssContainingText('auto-assign-template-summary h6', 'Cisco Webex 25 party Meetings')),
    },
  };
};

module.exports = manageUsersPage;
