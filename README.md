# Atlas Contribution Guide
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## About

Please take a moment to familiarize yourself with the following rules, guidelines, and contribution process.

Learn more about project specifics:
* [npm scripts](docs/npm-scripts.md)
* [setup](docs/setup.md)
* [structure](docs/structure.md)
* [technologies](docs/technology.md)
* [webpack](docs/webpack.md)
* [security](docs/security.md)

Post any questions to the 'Atlas UI Dev Team' Spark room. Contributors are expected to be actively engaged on Spark. If you need more help or access to a Spark room, please reach out to a [core team member](http://cs.co/atlas-triage#im-still-stuck-who-can-i-contact).

## Rules and Guidelines

These rules establish and enforce best practices
in order to improve code quality, maintainability, and readability.
All contributors are expected to take the time to learn and apply them.
Adherence is mandatory. Please refactor non-compliant code.

* **Unit tests are mandatory**.  Unit tests are the foundation of our testing strategy.
  They provide a way to test business logic and components in isolation while controlling all conditions and expectations.
  See the [examples](examples/unit) module for examples of different types of unit tests.
* **Code reviews are mandatory**. Code reviews are performed through GitHub's [Pull Requests](https://help.github.com/articles/using-pull-requests/).
  GitHub provides an easy-to-use tool for reviewing and maintaining commit history by linking commits
  with their associated pull requests.
* **Code style is mandatory**. Style should be enforced through linting and code reviews.
  * [Javascript Style Guide](https://github.com/airbnb/javascript/tree/master/es5)
  * [Angular Style Guide](https://github.com/johnpapa/angular-styleguide/tree/master/a1)
  * [CSS BEMS-style naming](http://getbem.com/naming/)
  * [Commit Guidelines](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/How-to-commit-changes)
* **Build failure triage is mandatory**. When you push code that breaks the builds, you are responsible to investigate
  and triage this failure before attempting another push. More info on the [triage wiki](http://cs.co/atlas-triage).

## Contributing

#### First Time Contributors

Your first PR is an important one, and to help you acclimate to our coding style and patterns it is
best to keep it simple. If you are new to the codebase, we ask that you keep your first PR **under
500 lines max**.

This helps your reviewers help you. The smaller you keep your PR, the sooner your reviewers can
offer feedback, allowing you to learn best practices and respond with updates quicker. Remember that
your first PR will very likely require multiple rounds of feedback and updates, so keep it small and
lean to help this process flow quicker.

----

#### First Time Setup

See [git-terminology](https://sqbu-github.cisco.com/WebExSquared/wx2-admin-web-client/wiki/Git-terminology) for more info on terminology used here.

##### 1. Clone this repository (this creates the 'origin' remote)
* Run `git clone <mainline-url>`

  ```
  git clone git@sqbu-github.cisco.com:WebExSquared/wx2-admin-web-client.git
  ```

##### 1a. Set your author name and email (if you haven't already done so)
* Run `git config ...` to set your author name and email for this repo:

  ```
  cd ./wx2-admin-web-client
  git config user.name "John Doe"
  git config user.email johndoe@cisco.com
  ```

  ...or alternatively, set them globally on your work machine (a better choice if you work with multiple repos):

  ```
  cd ./wx2-admin-web-client
  git config --global user.name "John Doe"
  git config --global user.email johndoe@cisco.com
  ```

##### 2. Create a fork (on sqbu-github)
* Select the 'Fork' button
* Select the target that matches your CEC id

##### 3. Set a remote to point at your fork
* Run `git remote add <your-CEC-id> <your-forks-url>`

  ```
  git remote add johnsmith git@sqbu-github.cisco.com:johnsmith/wx2-admin-web-client.git
  ```

#### 4. Set a remote to point at Gauntlet (build queue-ing tool) for validated merge (after approved review)
* Similar to step (3), but using `gauntlet` as the remote name and gauntlet's respective url:

  ```
  git remote add gauntlet https://gauntlet.wbx2.com/api/git/atlas-web
  ```

#### 5. Install project dependencies

```
./setup.sh
```

----

#### Typical Workflow

##### 1. Refresh npm dependencies

  * `yarn` to install project dependencies

##### 2. Run the application
  * `yarn start` to run the development server
  * See [npm scripts](docs/npm-scripts.md) for more build commands

##### 3. Make your feature change or bug fix
  * Create a local feature branch (tracking origin/master) to implement your work
    * `git checkout -b <feature-branch> origin/master`
  * Example [Hello World module](docs/hello-world.md)
  * Example components
    * [index.ts](examples/unit/index.ts)
    * [example.component.ts](examples/unit/example.component.ts)
    * [example.html](examples/unit/example.html)
    * [example.service.ts](examples/unit/example.service.ts)

##### 4. Create your unit tests
  * `yarn test` to run all unit tests
    * `yarn test <tests>` for specific tests
    * `yarn ktest-watch <tests>` to watch specific tests
    * `yarn ktest-debug <tests>` to debug specific tests
  * Example tests - `yarn test examples/unit/*.spec.ts`
    * [example.component.spec.ts](examples/unit/example.component.spec.ts)
    * [example.service.spec.ts](examples/unit/example.service.spec.ts)

##### 5. Create End-to-End test
  * **Important:** *Our functional e2e tests are only intended for the few, happy-path, critical workflows in Atlas. The majority of these deal with creating trials and users for particular services.  There should be a valid critical reason for adding a new e2e test. If you want to any advice, we do have a (rarely used) "Atlas UI E2E Tests" space in the Atlas Team.*
  * `yarn protractor` to run protractor e2e tests
  * `yarn protractor --specs test/e2e-protractor/examples/failed_test_retry_spec.js` to run a specific e2e test
  * e2e tests are organized by [modules](test/e2e-protractor)
  * Protractor elements are abstracted into [Page Objects](test/e2e-protractor/pages)
  * All element interactions are implemented through [Util functions](test/e2e-protractor/utils/test.utils.js)

##### 6. Create Pull Request code review
  * Switch to your local feature branch if not already
    * `git checkout <feature-branch>`
  * Rebase your local feature branch (tracking origin/master) with the latest remote code and push to your fork
  * (recommended) Use our script to rebase your branch and update your fork
    * `yarn rebase-branch-and-update-fork` (or directly with `./bin/rebase-branch-and-update-fork.sh`)
  * (alternative) Do it yourself
    * Rebase your commits onto the latest from origin/master
      * `git pull --rebase` (resolve conflicts if necessary)
    * Push your updated local feature branch to your fork
      * `git push <fork> <feature-branch>`
  * On your fork, select your branch and click `Pull request` to create a new PR
  * Add appropriate reviewers using [@mention](https://github.com/blog/821-mention-somebody-they-re-notified)
    * Add appropriate reviewers using [@mention](https://github.com/blog/821-mention-somebody-they-re-notified)
    * Add `@WebExSquared/atlas-web-core-team` for core team members
    * *(Note: your PR may automatically be picked up by @atlas-ui-bot-gen, who will @mention other contributors when feasible)*
  * **Important:** *Please allow a reasonable time for a response before pushing your code.  Large commits will take longer to review.  Smaller commits can be reviewed quicker and make it easier for adjustments to the comments.*
  * Respond to feedback requests and push changes as *new* commits
    * `git push <fork> <feature-branch>`
  * You can continue to rebase your branch and update your fork over the course of the review
    * `yarn rebase-branch-and-update-fork` (or directly with `./bin/rebase-branch-and-update-fork.sh`)

##### 7. Push to Gauntlet (build queue-ing tool) for validated merge (after approved review)
  * Switch to your local feature branch if not already
    * `git checkout <feature-branch>`
  * Push your local feature branch to Gauntlet's master branch
  * (recommended) Use our script to rebase your branch, update your fork, and push to Gauntlet
    * `yarn gauntlet-push` (or directly with `./bin/gauntlet-push.sh`)
  * (alternative) Do it yourself
    * Rebase your commits onto the latest from origin/master
      * `git pull --rebase` (resolve conflicts if necessary)
    * Push your updated local feature branch to your fork (this will need to be forced if you already have the feature branch on your fork)
      * `git push <fork> <feature-branch> -f`
    * Push your local feature branch to Gauntlet's master
      * `git push gauntlet <feature-branch>:master`
  * Gauntlet Information
    * Use your CEC username and [internal password](https://sqbu-jenkins-01.cisco.com:8443/job/utilities/job/internal-utilities-password-changer/) (**:warning: it is not the same password as your CEC password :warning:**).
    * Consider putting your internal password into ~/.netrc
    * You can [monitor the gauntlet queue here](https://gauntlet.wbx2.com/queue.html?queue=atlas-web)
    * You can [force fail stuck gauntlet queue here](https://sqbu-jenkins.cisco.com:8443/job/team/job/atlas/job/atlas-web--gauntlet--fail-build/) (note: trigger it with the **full SHA** of your feature branch's HEAD commit). You can alternatively force fail it using the following curl command: `curl --insecure --user <username> -X PUT "https://gauntlet.wbx2.com/api/queues/atlas-web/master?commitId=<commitId>&componentTestStatus=failure"
`, use your internal password when prompted.

##### 8. Jenkins Build Triage
  * Build failures happen - sometimes they are related to your work and sometimes they aren't
  * All contributors are required to triage their failure to a root cause
  * Ask in the [Atlas UI Dev Team](https://web.ciscospark.com/rooms/c326a730-826b-11e5-9361-3daf1bba596b/chat) room if you need help
