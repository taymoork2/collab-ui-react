## Project structure

* Every functional group has a directory structure under `app/modules`
* There is no need to edit the index.html file, all dependencies are managed through webpack
* Each module has a feature directory that contains the following content:
  - html template files
  - javacript controllers
  - directive JS files
  - scss style sheets
  - images should not be stored in the modules directory
* images should be placed in the images directory. They should organized with the same directory structure as the modules
* We have decided to organize the folders based on component and feature to best manage functionality
* The core module is the main framework of the application, it consists of the following:
  - Header
  - Left nav bar
  - Content panel
  - CIS Integration
  - User list
  - Preview and detail panels for users
 * All functionality must integrate into core through the user list or navigation menu items