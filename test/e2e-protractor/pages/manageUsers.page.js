'use strict';

var manageUsersPage = function () {
  this.modal = element(by.css('.modal-content > div > div'));

  //this.usersListEmails = element.all(by.css('.ui-grid-canvas .ui-grid-cell.ui-grid-coluiGrid-0009 .ui-grid-cell-contents'));

  this.buttons = {
    manageUsers: element(by.id('manageUsers')),
    modalCloseButton: element(by.id('closeManageUsers')),

    next: element(by.buttonText('Next')),
    save: element(by.buttonText('Save')),
    back: element(by.buttonText('Back')),
    submit: element(by.buttonText('Submit')),
    done: element(by.buttonText('Done')),
    finish: element(by.id('btnOnboard'))
  };

  this.modalDialog = {
    title: element(by.css('.reveal-modal.dialog .modal-content .modal-title')),
    exportButton: element(by.css('.reveal-modal.dialog .modal-content .modal-footer button.btn--primary')),
    exportWarningButton: element(by.css('.reveal-modal.dialog .modal-content .modal-footer button.btn--alert')),
    cancelButton: element(by.css('.reveal-modal.dialog .modal-content .modal-footer button:not(.btn--primary)'))
  };

  // add or modify users
  this.select = {
    title: element(by.css('.modal-body h4:first-of-type')),
    radio: {
      orgManual: element(by.css('label[for=org-manual]')),
      orgBulk: element(by.css('label[for=org-bulk]')),
      orgAdvanced: element(by.css('label[for=org-advanced]'))
    }
  };

  // Manually add or Modify Users
  this.manual = {
    clearButton: element(by.css('.onboard-users .icon-trash')),
    errorOverMaxUsers: element(by.css('.onboard-users .error-over-max-users')),
    paidMsgCheckbox: element(by.css('label[for="paid-msg"]')),

    radio: {
      emailAddress: element(by.css('label[for="radioEmail"]')),
      nameAndEmail: element(by.css('label[for="radioNamesAndEmail"]'))
    },

    emailAddress: {
      addUsersField: element(by.id('usersfield-tokenfield')),
      tokens: element.all(by.css('.tokenfield .token')),
      invalidTokens: element.all(by.css('.tokenfield .token.invalid'))
    },

    namesAndEmail: {
      firstName: element(by.id('firstName')),
      lastName: element(by.id('lastName')),
      emailAddress: element(by.id('emailAddress')),
      plusIcon: element(by.css('.plus-icon-active')),
      tokenField: element(by.id('usersfield'))
    }
  };

  // Bulk Modify Users
  this.bulk = {
    title: element(by.css('.user-csv-bulk h4:first-of-type')),
    export: {
      downloadTemplateButton: element(by.css('.user-csv-export .download-template')),
      exportCsvButton: element(by.css('.user-csv-export .hotspot')),
      exportSpinner: element(by.css('.user-csv-export .icon-spinner')),
      cancelExportButton: element(by.css('.user-csv-export .prompt .cancel-download'))
    },

    import: {
      uploadInput: element(by.id('upload')),
      removeFileButton: element(by.css('.user-csv-upload .reset-file')),
      importFileName: element(by.css('.user-csv-upload .file-drop-inactive p')),
      addServicesOnlyRadio: element(by.css('label[for=import-add-only]')),
      addAdnRemoveServicesRadio: element(by.css('label[for=import-add-remove]'))
    }
  };

  this.importStatus = {
    statusDisplay: element(by.css('.user-csv-results')),
    title: element(by.css('.modal-body h5:first-of-type')),
    progressPercentage: element(by.css('.csv-process-content .progressbar-progress')),
    progressFileName: element(by.css('.csv-process-content .csv-filename')),
    newUsers: element(by.css('.new-users .total')),
    updatedUsers: element(by.css('.updated-users .total')),
    errorUsers: element(by.css('.error-users .total')),
    uploadComplete: element(by.css('.user-csv-results .upload-complete .progressbar-label span.progressbar-label:first-child'))
  };

};

module.exports = manageUsersPage;
