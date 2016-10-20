#!/usr/bin/env bats

source ./webhook-helpers

@test "tr_result_line_to_list_items - should print a block of line items given a line from a sauce labs report" {
    local line_entry="foo1: foo2 | bar | baz | biz"
    echo "$line_entry" | {
        run tr_result_line_to_list_items
        [ $status -eq 0 ]
        [ "${lines[0]}" = "-----" ]
        [ "${lines[1]}" = "- test: foo1: bar" ]
        [ "${lines[2]}" = "- spec file: baz" ]
        [ "${lines[3]}" = "- see: biz" ]
    }

    line_entry="run-0: 01-0 | chrome #1-0 passed | .../squared/activate_spec.js | http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318?auth=b4d9a463b043e10b97eaf8ea43d3cdf6"
    echo "$line_entry" | {
        run tr_result_line_to_list_items
        [ $status -eq 0 ]
        [ "${lines[0]}" = "-----" ]
        [ "${lines[1]}" = "- test: run-0: chrome #1-0 passed" ]
        [ "${lines[2]}" = "- spec file: .../squared/activate_spec.js" ]
        [ "${lines[3]}" = "- see: http://saucelabs.com/jobs/7bcabd803efb4f98a79ff2ad240eb318?auth=b4d9a463b043e10b97eaf8ea43d3cdf6" ]
    }
}

@test "concat_lines - concats lines into a single line" {

    cat > ./tmp_file <<_EOF
line1
line2
line3
_EOF

    cat tmp_file | {
        run concat_lines
        [ $status -eq 0 ]
        [ "${output}" = "line1\nline2\nline3\n" ]
    }
    rm tmp_file
}

@test "concat_lines - result line should have double-quotes escaped" {
    echo '"foo" "bar" "baz"' | {
        run concat_lines
        [ "${output}" = '\"foo\" \"bar\" \"baz\"\n' ]
    }
}

@test "concat_lines - will transform a *.json file to single line, with double-quotes escaped" {
    cat > ./tmp_file <<_EOF
{
  "foo": "bar"
}
_EOF

    cat tmp_file | {
        run concat_lines
        [ "${output}" = '{\n\"foo\": \"bar\"\n}\n' ]
    }
    rm tmp_file
}

@test "tr_notification_to_json_payload - should make a JSON payload with the 'text' property set to the arg passed" {
    echo "foo" | {
        run tr_notification_to_json_payload
        [ "${output}" = '{ "text": "foo" }' ]
    }
}

@test "mk_notification_flat_payload - with no args prints a simple output" {
    BUILD_URL="http://www.example.com"
    run mk_notification_flat_payload
    [ "${lines[0]}" = "Build Failed!" ]
    [ "${lines[1]}" = "- Build: http://www.example.com" ]
}

@test "mk_notification_flat_payload - with an arg to a non-existent file also prints simple output" {
    BUILD_URL="http://www.example.com"
    run mk_notification_flat_payload ./foo
    [ "${lines[0]}" = "Build Failed!" ]
    [ "${lines[1]}" = "- Build: http://www.example.com" ]
}

@test "mk_notification_flat_payload - with arg specifying sauce labs report file pretty-prints a flat file with build summary message" {
    cat > ./tmp_file <<_EOF
run-0: 01-2 | chrome #1-2 failed 1 test(s) | .../squared/assign_user_spec.js | http://saucelabs.com/jobs/3b9bdcb109cc4d52a62358c6acaf0607?auth=3ce5ad5c7a0f16a5e2721b6ceba5ba04
run-0: overall: 1 failed spec(s)
_EOF

    BUILD_URL="http://www.example.com"
    run mk_notification_flat_payload ./tmp_file
    [ "${lines[0]}" = "Build Failed!" ]
    [ "${lines[1]}" = "- Build: http://www.example.com" ]
    [ "${lines[2]}" = "E2E Test Summary:" ]
    [ "${lines[3]}" = "- run-0: overall: 1 failed spec(s)" ]
    [ "${lines[4]}" = "E2E Test Results:" ]
    [ "${lines[5]}" = "-----" ]
    [ "${lines[6]}" = "- test: run-0: chrome #1-2 failed 1 test(s)" ]
    [ "${lines[7]}" = "- spec file: .../squared/assign_user_spec.js" ]
    [ "${lines[8]}" = "- see: http://saucelabs.com/jobs/3b9bdcb109cc4d52a62358c6acaf0607?auth=3ce5ad5c7a0f16a5e2721b6ceba5ba04" ]

    rm tmp_file
}
