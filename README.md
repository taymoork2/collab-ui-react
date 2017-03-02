# Atlas Contribution Guide
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
## About

Take a moment to familiarize yourself with the following rules, guidelines, and contribution process.

Learn more about project specifics:
* [npm scripts](docs/npm-scripts.md)
* [setup](docs/setup.md)
* [structure](docs/structure.md)
* [technologies](docs/technology.md)
* [webpack](docs/webpack.md)

Post any questions to the 'Atlas UI Dev Team' Spark room. Contributors are expected to be actively engaged on Spark. If you need more help or access to a Spark room, please reach out to a [core team member](http://cs.co/atlas-triage#im-still-stuck-who-can-i-contact).

## Rules and Guidelines

These rules establish and enforce best practices
in order to improve code quality, maintainability, and readability.
All contributors are expected to take the time to learn and apply them.
Adherence is mandatory. Please refactor non-compliant code.

* **Unit tests are mandatory**.  Unit tests are the foundation of our testing strategy.
  They provide a way to test business logic and components in isolation while controlling all conditions and expectations.
  See the [examples](examples/unit) module for examples of different types of unit tests.
* **Code reviews are mandatory**. Code reviews are performend through GitHub's [Pull Requests](https://help.github.com/articles/using-pull-requests/).
  GitHub provides an easy-to-use tool for reviewing and maintaining commit history by linking commits
  with their associated pull requests.
* **Code style is mandatory**. Style should be enforced through linting and code reviews.
  * [Javascript Style Guide](https://github.com/airbnb/javascript/tree/master/es5)
  * [Angular Style Guide](https://github.com/johnpapa/angular-styleguide/tree/master/a1)
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

##### 2. Create a fork (on sqbu-github)
* Select the 'Fork' button
* Select the target that matches your CEC id

##### 3. Set a remote to point at your fork
* Run `git remote add <your-CEC-id> <your-forks-url>`

  ```
  git remote add foo git@sqbu-github.cisco.com:foo/wx2-admin-web-client.git
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

  * `npm install` to install project dependencies

##### 2. Run the application
  * `npm start` to run the development server
  * See [npm scripts](docs/npm-scripts.md) for more build commands

##### 3. Make your feature change or bug fix
  * Create a local branch (tracking origin/master) to implement your work
    * `git checkout -b <local-branch> origin/master`
  * Example [Hello World module](docs/hello-world.md)
  * Example components
    * [index.ts](examples/unit/index.ts)
    * [example.component.ts](examples/unit/example.component.ts)
    * [example.html](examples/unit/example.html)
    * [example.service.ts](examples/unit/example.service.ts)

##### 4. Create your unit tests
  * `npm test` or `npm run test` to run unit tests
  * Example components - `npm run ktest-watch -- examples/unit/*.spec.ts`
    * [example.component.spec.ts](examples/unit/example.component.spec.ts)
    * [example.service.spec.ts](examples/unit/example.service.spec.ts)

##### 5. Create End-to-End test
  * `npm run protractor` to run protractor e2e tests
  * e2e tests are organized by [modules](test/e2e-protractor)
    * Only add e2e tests for critical, happy-path workflows
  * Protractor elements are abstracted into [Page Objects](test/e2e-protractor/pages)
  * All element interactions are implemented through [Util functions](test/e2e-protractor/utils/test.utils.js)

##### 6. Create Pull Request code review
  * `git checkout <local-branch>` (if not already on your local branch)
  * Before creating a pull request, update your local branch (tracking origin/master) to the latest remote code
  * `git pull --rebase`
  * Push your updated local branch to your fork
  * `git push <fork> <local-branch>`
  * On your fork, select your branch and click `Pull request` to create a new PR
  * Add appropriate reviewers using [@mention](https://github.com/blog/821-mention-somebody-they-re-notified)
    * Add `@WebExSquared/atlas-web-jedi` for core team members if unsure who should review your PR
    * *(Note: your PR may automatically be picked up by @atlas-ui-bot-gen, who will @mention other contributors when feasible)*
  * Respond to feedback and push new commits if necessary

##### 7. Push to Gauntlet (build queue-ing tool) for validated merge (after approved review)
  * `git checkout master`
  * Your master branch should have no local commits. Reset your HEAD if need be with `git reset --hard HEAD`.
  * `git pull --rebase` to update your master branch with the latest from github
  * `git merge <local-branch>` (resolve conflicts if necessary)
  * `git push gauntlet master`
    * Use your CEC username and [internal password](https://sqbu-jenkins-01.cisco.com:8443/job/utilities/job/internal-utilities-password-changer/) (**:warning: it is not the same password as your CEC password :warning:**).
    * Consider putting your internal password into ~/.netrc
    * You can [monitor the gauntlet queue here](https://gauntlet.wbx2.com/queue.html?queue=atlas-web)

##### 8. Jenkins Build Triage
  * Build failures happen - sometimes they are related to your work and sometimes they aren't
  * All contributors are required to triage their failure to a root cause
  * Ask in the [Atlas UI Dev Team](https://web.ciscospark.com/rooms/c326a730-826b-11e5-9361-3daf1bba596b/chat) room if you need help
