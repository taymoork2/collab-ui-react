#!/usr/bin/env bats

source ./curl-api-helpers

@test "get_auth_info - should only match the whole-word expressions (no substring matches)" {
    run get_auth_info part
    [ "$status" -eq 1 ]
    [ "$output" = "Error: no matches found for grep key: part" ]
    run get_auth_info partner-ad
    [ "$status" -eq 1 ]
    [ "$output" = "Error: no matches found for grep key: partner-ad" ]
}

@test "strip_querystring - should chop off tail end of URL after the '?'" {
    [ "`echo '/foo?bar=1' | strip_querystring`" = "/foo" ]
    [ "`echo '/foo?'      | strip_querystring`" = "/foo" ]
    [ "`echo '/foo'       | strip_querystring`" = "/foo" ]
}

@test "strip_location_hash - should chop off tail end of URL after the '#'" {
    [ "`echo '/foo#bar' | strip_location_hash`" = "/foo" ]
    [ "`echo '/foo#'    | strip_location_hash`" = "/foo" ]
    [ "`echo '/foo'     | strip_location_hash`" = "/foo" ]
}

@test "strip_api_v1_prefix - should chop everything up to and including '/api/v1/' from an URL if present" {
    [ "`echo '/foo'                              | strip_api_v1_prefix`" = "/foo" ]
    [ "`echo '/api/v1/foo'                       | strip_api_v1_prefix`" = "/foo" ]
    [ "`echo '/api/v1/'                          | strip_api_v1_prefix`" = "/" ]
    [ "`echo '/foo/api/v1/bar'                   | strip_api_v1_prefix`" = "/bar" ]
    [ "`echo 'http://example.com/foo/api/v1/bar' | strip_api_v1_prefix`" = "/bar" ]
    [ "`echo 'http://example.com/foo/api/v1/'    | strip_api_v1_prefix`" = "/" ]
}

@test "get_url_path_head - should print the head path component of an URL path" {
    [ "`echo '/foo/bar'      | get_url_path_head`" = "/foo" ]
    [ "`echo '//foo/bar'     | get_url_path_head`" = "/foo" ]
    [ "`echo '/foo'          | get_url_path_head`" = "/foo" ]
    [ "`echo '/foo?bar=1'    | get_url_path_head`" = "/foo" ]
    [ "`echo 'foo'           | get_url_path_head`" = "" ]
    [ "`echo 'foo?bar=1'     | get_url_path_head`" = "" ]
}

@test "get_url_path_tail - should chop off the head path component of an URL path" {
    [ "`echo '/foo/bar'           | get_url_path_tail`" = "/bar" ]
    [ "`echo '//foo/bar'          | get_url_path_tail`" = "/bar" ]
    [ "`echo '/foo//bar'          | get_url_path_tail`" = "//bar" ]
    [ "`echo '/foo/bar?baz=1'     | get_url_path_tail`" = "/bar" ]
    [ "`echo '/foo/bar?baz=1#biz' | get_url_path_tail`" = "/bar" ]
    [ "`echo '/bar?baz=1'         | get_url_path_tail`" = "" ]
    [ "`echo '/foo'               | get_url_path_tail`" = "" ]
    [ "`echo 'foo'                | get_url_path_tail`" = "" ]
    [ "`echo 'foo?baz=1'          | get_url_path_tail`" = "" ]
}

@test "is_safe_atlas_operation - should return 1 if trying to DELETE an org identified in 'test_helper.js'" {
    run is_safe_atlas_operation "DELETE" "/organizations/021fffdc-dd5e-49ca-b9d6-013445e3c3ae" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/30fdb01e-0bb2-4ed4-97f4-84a2289bdc79" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/4214d345-7caf-4e32-b015-34de878d1158" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/58f01b76-2b3f-4c91-ad8a-e2af626fc7a5" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/666a7b2f-f82e-4582-9672-7f22829e728d" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/75653d2f-1675-415c-aa5d-c027233f68fe" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/7e268021-dc11-4728-b39d-9ba0e0abb5e0" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/7e88d491-d6ca-4786-82ed-cbe9efb02ad2" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/9d173ec9-198e-430d-9363-688a333bdee7" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/baab1ece-498c-452b-aea8-1a727413c818" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/c054027f-c5bd-4598-8cd8-07c08163e8cd" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/c1e59258-29e1-42d7-bfa7-84ab26632b46" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/d30a6828-dc35-4753-bab4-f9b468828688" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/d71b4d69-721a-41b1-ae4b-6e0305eab12b" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "/organizations/e9e33cac-eb07-4c34-8240-d08a43d0adce" && [ "$status" -eq 1 ]

    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/021fffdc-dd5e-49ca-b9d6-013445e3c3ae" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/30fdb01e-0bb2-4ed4-97f4-84a2289bdc79" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/4214d345-7caf-4e32-b015-34de878d1158" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/584cf4cd-eea7-4c8c-83ee-67d88fc6eab5" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/58f01b76-2b3f-4c91-ad8a-e2af626fc7a5" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/666a7b2f-f82e-4582-9672-7f22829e728d" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/75653d2f-1675-415c-aa5d-c027233f68fe" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/7e268021-dc11-4728-b39d-9ba0e0abb5e0" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/7e88d491-d6ca-4786-82ed-cbe9efb02ad2" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/9d173ec9-198e-430d-9363-688a333bdee7" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/baab1ece-498c-452b-aea8-1a727413c818" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/c054027f-c5bd-4598-8cd8-07c08163e8cd" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/c1e59258-29e1-42d7-bfa7-84ab26632b46" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/d30a6828-dc35-4753-bab4-f9b468828688" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/d71b4d69-721a-41b1-ae4b-6e0305eab12b" && [ "$status" -eq 1 ]
    run is_safe_atlas_operation "DELETE" "https://example.com/admin/api/v1/organizations/e9e33cac-eb07-4c34-8240-d08a43d0adce" && [ "$status" -eq 1 ]
}

@test "get_url_endpoint_prefix - should output appropriate endpoint url prefixes given the script-name" {
    run get_url_endpoint_prefix "curl-atlas" && [ "$output" = "https://atlas-integration.wbx2.com/admin/api/v1" ]
    run get_url_endpoint_prefix "curl-wdm"   && [ "$output" = "https://wdm-integration.wbx2.com/wdm/api/v1" ]
    run get_url_endpoint_prefix "curl-ci"    && [ "$output" = "https://identity.webex.com/organization/scim/v1" ]
}
