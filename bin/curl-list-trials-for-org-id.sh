#!/bin/sh

cwd=`pwd`
# get project top-level dir (look for 'fabfile.py')
while [ ! -r fabfile.py -a "`pwd`" != "/" ]; do
  cd ..
done
top_dir=`pwd`
cd $cwd

if [ "${top_dir}" = "/" ]; then
    echo "Error: traversed to '/' while trying to find top-level dir"
    exit 1
fi

if [ $# -lt 2 ]; then
  echo "usage: `basename $0` <usr_label> <org_id>"
  echo ""
  echo "ex."
  echo "  `basename $0` partner-admin c054027f-c5bd-4598-8cd8-07c08163e8cd"
  exit 1
fi

usr_label=${1}
org_id=${2}
rest_path="/organization/${org_id}/trials"

${top_dir}/bin/curl-atlas ${usr_label} GET ${rest_path}
