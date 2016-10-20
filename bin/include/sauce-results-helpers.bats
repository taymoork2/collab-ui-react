#!/usr/bin/env bats

source ./sauce-results-helpers
sample_output=./sample-output

@test "cut_lines_for_run_from_file - should print lines only between the start and end markers for a given run" {
    [ "$(cut_lines_for_run_from_file 0 "$sample_output" | wc -l)" -eq 5158 ]
    [ "$(cut_lines_for_run_from_file 1 "$sample_output" | wc -l)" -eq 2142 ]
    [ "$(cut_lines_for_run_from_file 2 "$sample_output" | wc -l)" -eq 218 ]
}

@test "get_marker_start_regex_for_run - should print a regex useful for finding the start marker of a run" {
    [ "$(get_marker_start_regex_for_run 0)" = "Protractor: max: .*: run: 0: start" ]
    [ "$(get_marker_start_regex_for_run 1)" = "Protractor: max: .*: run: 1: start" ]
}

@test "get_marker_end_regex_for_run - should print a regex useful for finding the end marker of a run" {
    [ "$(get_marker_end_regex_for_run 0)" = "Protractor: max: .*: run: 0: end" ]
    [ "$(get_marker_end_regex_for_run 1)" = "Protractor: max: .*: run: 1: end" ]
}

@test "cut_lines_between_markers_from_file - should print lines between the given start and end regexes in a file" {
    # mk temp file inline for this test
    cat > _tmp <<_EOF
start-line
line 1
line 2
line 3
end-line
_EOF

    run cut_lines_between_markers_from_file "start-line" "end-line" "_tmp"
    [ "${lines[0]}" = "start-line" ]
    [ "${lines[1]}" = "line 1" ]
    [ "${lines[2]}" = "line 2" ]
    [ "${lines[3]}" = "line 3" ]
    [ "${lines[4]}" = "end-line" ]

    run cut_lines_between_markers_from_file "line 1" "line 3" "_tmp"
    [ "${lines[0]}" = "line 1" ]
    [ "${lines[1]}" = "line 2" ]
    [ "${lines[2]}" = "line 3" ]
    rm _tmp
}

@test "grep_for_sauce_link_lines - should grep lines with SauceLabs links present" {
    [ $(grep_for_sauce_link_lines < "$sample_output" | wc -l) -eq 34 ]
}

@test "grep_for_test_result_lines - should grep for lines with '[launcher' present, with either 'passed' or 'failed' present" {
    [ "$(grep_for_test_result_lines < "$sample_output" | wc -l)" -eq 35 ]
}

@test "grep_for_test_summary - should filter down to test results lines with 'overall' present" {
    [ "$(grep_for_test_summary < "$sample_output" | wc -l)" -eq 3 ]
    run grep_for_test_summary < "$sample_output"
    [ "${lines[0]}" = "[02:40:50] I/launcher - overall: 6 failed spec(s) and 1 process(es) failed to complete" ]
    [ "${lines[1]}" = "[02:43:06] I/launcher - overall: 1 failed spec(s)" ]
    [ "${lines[2]}" = "[02:44:08] I/launcher - overall: 1 failed spec(s)" ]
}

@test "grep_for_test_id - should grep lines with the given test id, prefixed by a '#'" {
    # ex. failed test
    [ "$(grep_for_test_id 01-6 < "$sample_output" | wc -l)" -eq 193 ]
    run grep_for_test_id 01-6 < "$sample_output"
    [ "${lines[0]}"  = "[02:39:20] I/testLogger - [chrome Windows 7 #01-6] PID: 26534" ]
    [ "${lines[192]}" = "[02:40:50] I/launcher - chrome #01-6 failed 1 test(s)" ]

    # ex. passed test
    [ "$(grep_for_test_id 01-10 < "$sample_output" | wc -l)" -eq 35 ]
    run grep_for_test_id 01-10 < $sample_output
    [ "${lines[0]}"  = "[02:38:11] I/testLogger - [chrome Windows 7 #01-10] PID: 26554" ]
    [ "${lines[34]}" = "[02:40:50] I/launcher - chrome #01-10 passed" ]
}

@test "grep_for_test_id - should error out and exit 1 if no 'test_id' is provided" {
    run grep_for_test_id
    [ "$status" -eq 1 ]
    [ "$output" = "Error: no test_id passed to grep_for_test_id" ]
}

@test "cut_url - should cut out the url of a given line with a SauceLabs link" {
    [ "$(grep_for_sauce_link_lines < "$sample_output" | head -1 | cut_url)" = "http://saucelabs.com/jobs/1919f8e5efa54102b25186bd2d22ef5e" ]
}

@test "cut_sauce_job_id - should cut out the job id from a SauceLabs link" {
    [ "$(grep_for_sauce_link_lines < "$sample_output" | head -1 | cut_url | cut_sauce_job_id)" = "1919f8e5efa54102b25186bd2d22ef5e" ]
}

@test "trim_out_launcher_prefix - should remove the prefix of a line up to and including '.*launcher - '" {
    [ "$(echo "foo launcher - bar" | trim_out_launcher_prefix)" = "bar" ]
    [ "$(grep_for_test_result_lines < "$sample_output" | grep passed | head -1 | trim_out_launcher_prefix)" = "chrome #01-0 passed" ]
}

@test "get_sauce_property - should source an appropriate sauce-related properties file and print the respective value for a given property" {
    [ "$(get_sauce_property SAUCE_USERNAME)" = "sauce-labs-atlas-web" ]
}

@test "get_sauce_property - should error out and exit 1 if no 'sauce_property' is provided" {
    run get_sauce_property
    [ "$status" -eq 1 ]
    [ "$output" = "Error: no sauce_property passed to get_sauce_property" ]
}

@test "get_sauce_property - should print empty string if no matching key was found" {
    run get_sauce_property foo
    [ "$output" = "" ]
}

@test "get_sauce_property - should error out and exit 1 if 'sauce_config_file' is passed, but references an invalid config file" {
    run get_sauce_property foo ./non-existent-properties-file
    [ "$status" -eq 1 ]
    [ "$output" = "Error: sauce_config_file not found: ./non-existent-properties-file" ]
}

@test "md5_hmac - should print the MD5 HMAC-hashed value given a job id from a SauceLabs link" {
    [ "$(grep_for_sauce_link_lines < "$sample_output" | head -1 | cut_url | cut_sauce_job_id | md5_hmac)" = "b3535e7677603d240ba38256b8562b41" ]
}

@test "mk_proper_sauce_link - should print a SauceLabs link with the appropriate 'auth' parameter set, given a plain SauceLabs link" {
    raw_url="$(grep_for_sauce_link_lines < "$sample_output" | head -1 | cut_url)"
    [ "$raw_url" = "http://saucelabs.com/jobs/1919f8e5efa54102b25186bd2d22ef5e" ]
    [ "$(mk_proper_sauce_link "$raw_url")" = "http://saucelabs.com/jobs/1919f8e5efa54102b25186bd2d22ef5e?auth=5051b8a5795519db3e6cf66a877e166c" ]
}

@test "filter_out_test_ids_and_urls - should print a test id and its corresponding SauceLabs link" {
    run filter_out_test_ids_and_urls < "$sample_output"
    [ "${lines[0]}" = "01 http://saucelabs.com/jobs/5231afc427b347d6aad56a7f4bd887a2" ]
    [ "${lines[33]}" = "01-27 http://saucelabs.com/jobs/2398306b1ba34bd68438ee593b283ba6" ]
}

@test "transform_to_proper_urls - should print while replacing SauceLabs links from input with usable SauceLabs links" {
    echo "foo http://saucelabs.com/jobs/11111111111111111111111111111111" | {
        run transform_to_proper_urls
        [ "$output" = "foo http://saucelabs.com/jobs/11111111111111111111111111111111?auth=112db64e7b36ad2edf174d5d06b8d148" ]
    }

    # use a smaller sample since this operation is compute intensive
    filter_out_test_ids_and_urls < "$sample_output" | head -3 | {
        run transform_to_proper_urls
        [ "${lines[0]}" = "01 http://saucelabs.com/jobs/5231afc427b347d6aad56a7f4bd887a2?auth=7522eda1d22a04b2f835b04c33f3ac2d" ]
        [ "${lines[1]}" = "01-0 http://saucelabs.com/jobs/7f17d2581b2342b59a734a9ec468e010?auth=fd378d1063251033ca653a10a71b0662" ]
        [ "${lines[2]}" = "01-0 http://saucelabs.com/jobs/1919f8e5efa54102b25186bd2d22ef5e?auth=5051b8a5795519db3e6cf66a877e166c" ]
    }
}


@test "filter_out_test_results - should print the browser, test id, and the test result" {
    [ $(filter_out_test_results < "$sample_output" | wc -l) = 35 ]
    cat $sample_output | {
        run filter_out_test_results
        [ "${lines[0]}" = "chrome #01-0 passed" ]
        [ "${lines[6]}" = "chrome #01-6 failed 1 test(s)" ]
        [ "${lines[9]}" = "chrome #01-9 failed with exit code: 1" ]
        [ "${lines[34]}" = "chrome #01 failed 1 test(s)" ]
    }
}

@test "filter_out_test_summary - should print the test results summary given the original sample output" {
    [ "$(filter_out_test_summary < "$sample_output" | wc -l)" -eq 3 ]
    run filter_out_test_summary < "$sample_output"
    [ "${lines[0]}" = "overall: 6 failed spec(s) and 1 process(es) failed to complete" ]
    [ "${lines[1]}" = "overall: 1 failed spec(s)" ]
    [ "${lines[2]}" = "overall: 1 failed spec(s)" ]
}

@test "mk_test_report - should print the test results, and usable SauceLabs links given the original sample output" {
    run mk_test_report "$sample_output"
    [ "${#lines[@]}" -eq 40 ]
    [ "${lines[0]}" = "#### Summary: run: 0" ]
    [ "${lines[1]}" = "run-0: 01-0 | chrome #01-0 passed | .../hercules/fusion_spec.js | http://saucelabs.com/jobs/1919f8e5efa54102b25186bd2d22ef5e?auth=5051b8a5795519db3e6cf66a877e166c" ]
    [ "${lines[2]}" = "run-0: 01-1 | chrome #01-1 passed | .../mediafusion/media_service_spec.js | http://saucelabs.com/jobs/51b56f9cc4984b2c9e20996094e03605?auth=6cf087315e54203c0391e221a90d12a1" ]

    [ "${lines[8]}" = "run-0: 01-7 | chrome #01-7 passed | .../squared/integration-partner_spec.js | http://saucelabs.com/jobs/7b7cbba7a156483792aa087986f68f22?auth=4917553d2fc74248496e27d221042627" ]
    [ "${lines[9]}" = "run-0: 01-8 | chrome #01-8 passed | .../squared/integration-partner-roles_spec.js | http://saucelabs.com/jobs/41bf7f6986334cb0b20c368d3d9039b9?auth=39f06630ddf6c61caf4b2a92ac437b67" ]

    [ "${lines[10]}" = "run-0: 01-10 | chrome #01-10 passed | .../squared/login_spec.js | http://saucelabs.com/jobs/fd3fadca56b1410392c012e167b1b625?auth=9ee171c9977f4d695a280c851fb5127a" ]
    [ "${lines[11]}" = "run-0: 01-11 | chrome #01-11 passed | .../squared/onboard-care_spec.js | http://saucelabs.com/jobs/5132b49c0eca45bab5f676fdc0a9ce9e?auth=436ed1d05f9aa0400357606c88853ba1" ]

    [ "${lines[27]}" = "run-0: 01-27 | chrome #01-27 passed | .../webex/userSettings/webexusersettings_spec.js | http://saucelabs.com/jobs/2398306b1ba34bd68438ee593b283ba6?auth=de186cb2e829c7f6bf25d4f98e07444a" ]
    [ "${lines[28]}" = "run-0: overall: 6 failed spec(s) and 1 process(es) failed to complete" ]

    [ "${lines[29]}" = "#### Summary: run: 1" ]
    [ "${lines[30]}" = "run-1: 01-0 | chrome #01-0 passed | .../examples/failed_test_retry_spec.js | http://saucelabs.com/jobs/7f17d2581b2342b59a734a9ec468e010?auth=fd378d1063251033ca653a10a71b0662" ]

    [ "${lines[35]}" = "run-1: 01-5 | chrome #01-5 passed | .../examples/failed_test_retry_spec.js | http://saucelabs.com/jobs/f9e7e8838b9b4ecfb7e27b4921b31320?auth=7b575d623e94a00c61487a6bbe1fdf71" ]
    [ "${lines[36]}" = "run-1: overall: 1 failed spec(s)" ]

    [ "${lines[37]}" = "#### Summary: run: 2" ]
    [ "${lines[38]}" = "run-2: 01 | chrome #01 failed 1 test(s) | .../examples/failed_test_retry_spec.js | http://saucelabs.com/jobs/5231afc427b347d6aad56a7f4bd887a2?auth=7522eda1d22a04b2f835b04c33f3ac2d" ]
    [ "${lines[39]}" = "run-2: overall: 1 failed spec(s)" ]
}
