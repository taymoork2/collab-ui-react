## Contribute

We use pull requests, and consequentially the forking model.  To make a contribution, you will need to fork this repository, make some changes, and then create a pull request with your changes.

1. From this web page, click **Fork** at the upper-right hand corner of the page
2. Select your username (e.g. @zzatking)
3. After your new fork is created, you'll want to pull the fork to your local environment, and add the upstream and jenkins remotes:
 - `git clone git@sqbu-github.cisco.com:username/wx2-admin-web-client`
 - `git remote add upstream git@sqbu-github.cisco.com:WebExSquared/wx2-admin-web-client`
 - `git remote add jenkins ssh://username@sqbu-jenkins.cisco.com:2022/team/atlas/atlas-web` (current as of 2016-03-21)

**Note**: If you get a Permission Denied (publickey) then follow these directions in Generating SSH Keys
 `https://help.github.com/articles/generating-ssh-keys/`

When you're making changes to your fork, you'll push to your fork with `git push origin master`, and your pull request will get automatically updated with the latest pushes you've made.

When your pull request gets approved by someone, this means you're able to push to jenkins with `git push jenkins master`. Clicking the "Merge" button will not merge into master since we used gated builds. This means that Jenkins is the only one who is capable of pushing to master to ensure our repository stays clean.

![Workflow](https://sqbu-github.cisco.com/github-enterprise-assets/0000/1342/0000/2160/82b4329c-45a0-11e5-9796-166e317fd59a.png)

To summarize, this is the process:

1. You fork the wx2-admin-web-client repository
2. You make changes on your fork
3. You commit and push your changes to your fork (`git add`, `git commit`)
    Update and test your code by executing the following:
    'git fetch upstream'
    'git merge upstream/master'
    'git push origin'
    'gulp e2e --nofailfaist'
    Confirm all tests have passed and rerun any that didn't using the specs option
    (e.g. 'gulp e2e --nounit --specs="test/e2e-protractor/squared/failedtest"'')
4. You create a pull request
5. Someone reviews your code and gives you feedback
6. Eventually, your code will get approved
7. You pull and test latest code (see step #3)
8. You push to Jenkins to start a build ('git push jenkins master')
9. Your code gets merged

## Branching

If you're in a situation where you've been assigned to fix many different issues and need to keep your local environment clean, branching with git provides a very easy way to do this. Below is a good example of how to fix a defect without cluttering up your environment.

Let's say you've been assigned to fix a defect (#123) where users aren't being saved properly. You've forked the wx2-admin-web-client repository as the `master` branch, and you want to go about making changes so that you can fix this defect right away. The following is a list of steps to follow to accomplish this in a well organized manner:

1. Start by updating your `master` branch with `git pull upstream master`
2. Push your local `master` onto your GitHub account with `git push origin master`. This will even out the branch on your account.
3. Checkout a new branch with the defect number: `git checkout -b de123`
4. Fix the defect by modifying the appropriate code
5. Once you've finished fixing the defect, add your changes and commit: `git add file1 file2 ...`, `git commit -m "DE123: Users weren't being saved properly"`
6. Push the changes on the `de123` branch to your local account: `git push origin de123`. You'll notice that when you visit your GitHub account's fork (https://github-sqbu.cisco.com/username/wx2-admin-web-client), it will have a new branch in the drop down menu. You might also see a highlighted pop-up that asks you if you want to Compare & create a pull request.
  - Prior to doing a PR, sync your code with master and test as follows:
    'git fetch upstream'
    'git merge upstream/master'
    'git push -f origin'
    'gulp e2e --nofailfaist'
    Confirm all tests have passed and rerun any that didn't using the specs option
    (e.g. 'gulp e2e --nounit --specs="test/e2e-protractor/squared/failedtest"'')
7. When your pull request gets accepted and you need to push to Jenkins, you'll want to push your specific branch: `git push jenkins de123:master`
  - Prior to pushing, repeat the sync steps outlined in step #6

What's really nice about this process is that you can create many branches that have a separate set of changes associated with them. When you want to start working on fixing a defect, you don't have to worry about mixing up the changes for one defect with the changes of another.

## Keeping your fork up-to-date

When contributing, it's important to keep your fork up-to-date with the master. You can do so by running the following command: `git pull upstream master`
