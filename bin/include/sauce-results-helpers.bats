#!/usr/bin/env bats

source ./sauce-results-helpers
sample_output=./sample-output

@test "grep_for_sauce_link_lines - should grep lines with SauceLabs links present" {
    [ `cat ${sample_output} | grep_for_sauce_link_lines | wc -l` -eq 35 ]
}

@test "grep_for_sauce_link_lines - output is version-sorted, not lexically sorted (ex. 1-9 comes before 1-10)" {
    cat ${sample_output} | {
        run grep_for_sauce_link_lines
        [ "$status" -eq 0 ]
        [ "${lines[0]}" = "[chrome Windows 7 #1-0] SauceLabs results available at http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318" ]
        [ "${lines[9]}" = "[chrome Windows 7 #1-9] SauceLabs results available at http://saucelabs.com/jobs/db7eb2b754804018aa1a9c73500862c6" ]
        [ "${lines[10]}" = "[chrome Windows 7 #1-10] SauceLabs results available at http://saucelabs.com/jobs/0c070e6610774b91958cf4fdc37a9f84" ]
        [ "${lines[34]}" = "[chrome Windows 7 #1-34] SauceLabs results available at http://saucelabs.com/jobs/59ba0b77fc504181aba9bf0db59416c5" ]
    }
}

@test "grep_for_test_result_lines - should grep for lines with '[launcher' present, with either 'passed' or 'failed' present" {
    [ `cat ${sample_output} | grep_for_test_result_lines | wc -l` -eq 35 ]
}

@test "grep_for_test_result_lines - output is version-sorted, not lexically sorted (ex. 1-9 comes before 1-10)" {
    cat ${sample_output} | {
        run grep_for_test_result_lines
        [ "$status" -eq 0 ]
        [ "${lines[0]}" = "[launcher] chrome #1-0 passed" ]
        [ "${lines[2]}" = "[launcher] chrome #1-2 failed 1 test(s)" ]
        [ "${lines[9]}" = "[launcher] chrome #1-9 passed" ]
        [ "${lines[10]}" = "[launcher] chrome #1-10 passed" ]
        [ "${lines[34]}" = "[launcher] chrome #1-34 passed" ]
    }
}

@test "grep_for_test_summary - should filter down to test results lines with 'overall' present" {
    [ `cat ${sample_output} | grep_for_test_summary | wc -l` -eq 1 ]
    [ "`cat ${sample_output} | grep_for_test_summary`" = "[launcher] overall: 1 failed spec(s)" ]
}

@test "grep_for_test_id - should grep lines with the given test id, prefixed by a '#'" {
    # ex. failed test
    [ `cat ${sample_output} | grep_for_test_id 1-2 | wc -l` = 37 ]
    cat ${sample_output} | {
        run grep_for_test_id 1-2
        [ "${lines[0]}"  = "[chrome Windows 7 #1-2] PID: 93844" ]
        [ "${lines[36]}" = "[launcher] chrome #1-2 failed 1 test(s)" ]
    }

    # ex. passed test
    [ `cat ${sample_output} | grep_for_test_id 1-0 | wc -l` = 33 ]
    cat ${sample_output} | {
        run grep_for_test_id 1-0
        [ "${lines[0]}"  = "[chrome Windows 7 #1-0] PID: 93842" ]
        [ "${lines[32]}" = "[launcher] chrome #1-0 passed" ]
    }
}

@test "grep_for_test_id - should error out and exit 1 if no 'test_id' is provided" {
    run grep_for_test_id
    [ "$status" -eq 1 ]
    [ "$output" = "Error: no test_id passed to grep_for_test_id" ]
}

@test "cut_url - should cut out the url of a given line with a SauceLabs link" {
    [ "`cat ${sample_output} | grep_for_sauce_link_lines | head -1 | cut_url`" = "http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318" ]
}

@test "cut_sauce_job_id - should cut out the job id from a SauceLabs link" {
    [ "`cat ${sample_output} | grep_for_sauce_link_lines | head -1 | cut_url | cut_sauce_job_id`" = "7bcabd803efb4f98a79ff2ad240eb318" ]
}

@test "trim_out_launcher_prefix - should remove the '[launcher] ' prefix of a line" {
    [ "`cat ${sample_output} | grep_for_test_result_lines | grep failed | trim_out_launcher_prefix`" = "chrome #1-2 failed 1 test(s)" ]
    [ "`cat ${sample_output} | grep_for_test_result_lines | grep passed | head -1 | trim_out_launcher_prefix`" = "chrome #1-0 passed" ]
}

@test "get_sauce_property - should parse and return the value of a top-level property from a *.json config file" {
    [ "`get_sauce_property SAUCE_USERNAME`" = "sauce-labs-atlas-web" ]
}

@test "get_sauce_property - should error out and exit 1 if no 'sauce_property' is provided" {
    run get_sauce_property
    [ "$status" -eq 1 ]
    [ "$output" = "Error: no sauce_property passed to get_sauce_property" ]
}

@test "get_sauce_property - should error out and exit 1 if 'sauce_property' has no matching key in the *.json config file" {
    run get_sauce_property foo
    [ "$status" -eq 1 ]
    [ "${lines[2]}" = "KeyError: 'foo'" ]
}

@test "get_sauce_property - should error out and exit 1 if 'sauce_config_file' is passed, but references an invalid config file" {
    run get_sauce_property foo ./bar.json
    [ "$status" -eq 1 ]
    [ "$output" = "Error: sauce_config_file not found: ./bar.json" ]
}

@test "md5_hmac - should print the MD5 HMAC-hashed value given a job id from a SauceLabs link" {
    [ "`cat ${sample_output} | grep_for_sauce_link_lines | head -1 | cut_url | cut_sauce_job_id | md5_hmac`" = "d864bd93ab3679c918e479bf3ccc4dba" ]
}

@test "mk_proper_sauce_link - should print a SauceLabs link with the appropriate 'auth' parameter set, given a plain SauceLabs link" {
    raw_url="`cat ${sample_output} | grep_for_sauce_link_lines | head -1 | cut_url`"
    [ "${raw_url}" = "http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318" ]
    [ "`mk_proper_sauce_link ${raw_url}`" = "http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318?auth=b4d9a463b043e10b97eaf8ea43d3cdf6" ]
}

@test "filter_out_test_ids_and_urls - should print a test id and its corresponding SauceLabs link" {
    cat ${sample_output} | {
        run filter_out_test_ids_and_urls
        [ "${lines[0]}" = "1-0 http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318" ]
        [ "${lines[34]}" = "1-34 http://saucelabs.com/jobs/59ba0b77fc504181aba9bf0db59416c5" ]
    }
}

@test "filter_out_raw_urls - should print only SauceLabs links given the original sample output" {
    [ `cat ${sample_output} | filter_out_raw_urls | wc -l` = 35 ]
    cat ${sample_output} | {
        run filter_out_raw_urls
        [ "${lines[0]}" = "http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318" ]
        [ "${lines[34]}" = "http://saucelabs.com/jobs/59ba0b77fc504181aba9bf0db59416c5" ]
    }
}

@test "transform_to_proper_urls - should print while replacing SauceLabs links from input with usable SauceLabs links" {
    [ `cat ${sample_output} | filter_out_test_ids_and_urls | transform_to_proper_urls | wc -l` = 35 ]

    # use a smaller sample since this operation is compute intensive
    cat ${sample_output} | filter_out_test_ids_and_urls | head -3 | {
        run transform_to_proper_urls
        [ "${lines[0]}" = "1-0 http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318?auth=b4d9a463b043e10b97eaf8ea43d3cdf6" ]
        [ "${lines[2]}" = "1-2 http://saucelabs.com/jobs/3b9bdcb109cc4d52a62358c6acaf0607?auth=3ce5ad5c7a0f16a5e2721b6ceba5ba04" ]
    }
}

@test "filter_out_test_results - should print only the browser, test id, and the test result given the original sample output" {
    [ `cat ${sample_output} | filter_out_test_results | wc -l` = 35 ]
    cat ${sample_output} | {
        run filter_out_test_results
        [ "${lines[0]}" = "chrome #1-0 passed" ]
        [ "${lines[2]}" = "chrome #1-2 failed 1 test(s)" ]
        [ "${lines[34]}" = "chrome #1-34 passed" ]
    }
}

@test "filter_out_test_summary - should print the test results summary given the original sample output" {
    [ `cat ${sample_output} | filter_out_test_summary | wc -l` = 1 ]
    [ "`cat ${sample_output} | filter_out_test_summary`" = "overall: 1 failed spec(s)" ]
}

@test "mk_test_report - should print the test results, and usable SauceLabs links given the original sample output" {
    [ `mk_test_report ${sample_output} | wc -l` = 36 ]
    run mk_test_report ${sample_output}
    [ "$status" -eq 0 ]
    [ "${lines[0]}" = "chrome #1-0 passed | .../squared/activate_spec.js | http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318?auth=b4d9a463b043e10b97eaf8ea43d3cdf6" ]
    [ "${lines[2]}" = "chrome #1-2 failed 1 test(s) | .../squared/assign_user_spec.js | http://saucelabs.com/jobs/3b9bdcb109cc4d52a62358c6acaf0607?auth=3ce5ad5c7a0f16a5e2721b6ceba5ba04" ]
    [ "${lines[34]}" = "chrome #1-34 passed | .../webex/userSettings/webexbasicsettings_spec.js | http://saucelabs.com/jobs/59ba0b77fc504181aba9bf0db59416c5?auth=b4f0ae5e4423a3932e143a34212a79b0" ]
    [ "${lines[35]}" = "overall: 1 failed spec(s)" ]
}
