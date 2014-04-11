# -*- coding: utf-8 -*-
import os
from fabric.api import *
from fabric.utils import *
 
#
# Fabric script to publish the Squared admin web client to the web server. 
# The script will connect to the web server. It will create a new directory
# under the /var/www/html/virtuals folder for the build. It will then
# create a new soft link for the wx2-admin-web-client to the build folder.
#
# Note:
# To get fabric to work with .ssh/config with proxycommand and netcat,
# such as our jump/bastion hosts for deployment, watch out for known
# issues.
#
# https://github.com/fabric/fabric/issues/1020
#
# Fabric 1.7.0
# Paramiko 1.11.1
#

# Leverage the ssh config of the local machine.
env.use_ssh_config = True


# Extract build num from file name.
def get_build(gz_file):
    tokens = os.path.basename(gz_file).split('.')
    if len(tokens) != 4:
        abort('Expected to find build number in gz file \'%s\'.' % gz_file)
    return tokens[1]


# Publish the site by pushing the gz file to the server, explode it, and
# change the soft link to latest folder.
@task
def publish():

    # Put the tar there...
    results = put(local_path='*.gz', remote_path='/tmp', use_sudo=False)
    if results.failed:
        abort('Could not upload the files.')
    if len(results) != 1:
        abort('Uploaded more files than anticipated.')
    gz_file = results[0]
    
    # Make the target dir...
    parent_dir = '/var/www/virtuals/wxadminweb-versions'
    target_dir = '%s/wxadminweb-v%s' % (parent_dir, get_build(gz_file))
    results = run('mkdir -p %s' % target_dir)
    if results.failed:
        abort('Could not mkdir \'%s.\'' % target_dir)
    results = run('chmod 775 %s' % target_dir)
    if results.failed:
        abort('Could not chmod \'%s.\'' % target_dir)

    # Explode the tar there without the dist/ prefix...
    with cd(target_dir):
        results = run('tar --strip-components=1 -pxvf %s' % gz_file)
        if results.failed:
            abort('Could not extract tar \'%s.\'' % gz_file)
        
    # Softlink latest...
    with cd('/var/www/virtuals/wxadminweb-versions'):
        results = run('rm -f wxadminweb; ln -sf %s wxadminweb' % os.path.basename(target_dir))
        if results.failed:
            abort('Could not extract tar \'%s.\'' % gz_file)

        # Do you see what I see...
        run('ls -l wxadminweb/')

    # Delete the tar.
    results = run('rm -f %s' % gz_file, timeout=60)
    if results.failed:
        abort('Could not remove the tar \'%s.\'' % gz_file)

# Publish the site by pushing the gz file to the server, explode it, and
# change the soft link to latest folder.
@task
def publish_int():

    # Put the tar there...
    results = put(local_path='*.gz', remote_path='/tmp', use_sudo=False)
    if results.failed:
        abort('Could not upload the files.')
    if len(results) != 1:
        abort('Uploaded more files than anticipated.')
    gz_file = results[0]

    # Make the target dir...
    parent_dir = '/var/www/virtuals/wxadminweb-int-versions'
    target_dir = '%s/wxadminweb-v%s' % (parent_dir, get_build(gz_file))
    results = run('mkdir -p %s' % target_dir)
    if results.failed:
        abort('Could not mkdir \'%s.\'' % target_dir)
    results = run('chmod 775 %s' % target_dir)
    if results.failed:
        abort('Could not chmod \'%s.\'' % target_dir)

    # Explode the tar there without the dist/ prefix...
    with cd(target_dir):
        results = run('tar --strip-components=1 -pxvf %s' % gz_file)
        if results.failed:
            abort('Could not extract tar \'%s.\'' % gz_file)

    # Softlink latest...
    with cd('/var/www/virtuals/wxadminweb-int-versions'):
        results = run('rm -f wxadminweb; ln -sf %s wxadminweb' % os.path.basename(target_dir))
        if results.failed:
            abort('Could not extract tar \'%s.\'' % gz_file)

        # Do you see what I see...
        run('ls -l wxadminweb/')

    # Delete the tar.
    results = run('rm -f %s' % gz_file, timeout=60)
    if results.failed:
        abort('Could not remove the tar \'%s.\'' % gz_file)


@task(default='true')
def usage():
    print
    print "Usage: fab [task]"
    print
    print "Run fab --list to see list of tasks."
