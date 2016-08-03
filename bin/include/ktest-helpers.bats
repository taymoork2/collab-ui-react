#!/usr/bin/env bats

source ./ktest-helpers

@test "calc_lines_per_file - (default) min value: 15, (default) max value: 1000, num cpus: 1" {
    [ $(calc_lines_per_file 13 1) -eq 15 ]  # under min value
    [ $(calc_lines_per_file 14 1) -eq 15 ]
    [ $(calc_lines_per_file 15 1) -eq 15 ]
    [ $(calc_lines_per_file 16 1) -eq 17 ]  # above min value, offset +1
    [ $(calc_lines_per_file 17 1) -eq 18 ]
    [ $(calc_lines_per_file 18 1) -eq 19 ]
    [ $(calc_lines_per_file 998 1) -eq 999 ]
    [ $(calc_lines_per_file 999 1) -eq 1000 ]
    [ $(calc_lines_per_file 1000 1) -eq 1000 ]  # above max value
    [ $(calc_lines_per_file 1001 1) -eq 1000 ]
}

@test "calc_lines_per_file - (default) min value: 15, (default) max value: 1000, num cpus: 2" {
    [ $(calc_lines_per_file 13 2) -eq 15 ]  # under min value
    [ $(calc_lines_per_file 14 2) -eq 15 ]
    [ $(calc_lines_per_file 15 2) -eq 15 ]
    [ $(calc_lines_per_file 16 2) -eq  9 ]  # above min value, offset +1
    [ $(calc_lines_per_file 17 2) -eq  9 ]
    [ $(calc_lines_per_file 18 2) -eq 10 ]
    [ $(calc_lines_per_file 1997 2) -eq 999 ]
    [ $(calc_lines_per_file 1998 2) -eq 1000 ]
    [ $(calc_lines_per_file 1999 2) -eq 1000 ]
    [ $(calc_lines_per_file 2000 2) -eq 1000 ]  # above max value
    [ $(calc_lines_per_file 2001 2) -eq 1000 ]
    [ $(calc_lines_per_file 2002 2) -eq 1000 ]
}

@test "calc_lines_per_file - (default) min value: 15, (default) max value: 1000, num cpus: 3" {
    [ $(calc_lines_per_file 13 3) -eq 15 ]  # under min value
    [ $(calc_lines_per_file 14 3) -eq 15 ]
    [ $(calc_lines_per_file 15 3) -eq 15 ]

    # divisor is incremented +1 at a time, and re-tested against min value, stopping at first match
    # - in this case, incrementing by +1 and dividing into 16 yields 8, which satisfies <15, so we stop
    [ $(calc_lines_per_file 16 3) -eq  9 ]  # 16 / 2 => 8, offset +1
    [ $(calc_lines_per_file 17 3) -eq  9 ]
    [ $(calc_lines_per_file 18 3) -eq 10 ]
    [ $(calc_lines_per_file 19 3) -eq 10 ]
    [ $(calc_lines_per_file 20 3) -eq 11 ]
    [ $(calc_lines_per_file 21 3) -eq 11 ]
    [ $(calc_lines_per_file 22 3) -eq 12 ]
    [ $(calc_lines_per_file 23 3) -eq 12 ]
    [ $(calc_lines_per_file 24 3) -eq 13 ]
    [ $(calc_lines_per_file 25 3) -eq 13 ]
    [ $(calc_lines_per_file 26 3) -eq 14 ]
    [ $(calc_lines_per_file 27 3) -eq 14 ]
    [ $(calc_lines_per_file 28 3) -eq 15 ]
    [ $(calc_lines_per_file 29 3) -eq 15 ]

    # - in this case, dividing 2 into 30 yields 15, which no longer satisfies <15, so we increment by
    #   +1 again and keep going
    [ $(calc_lines_per_file 30 3) -eq 11 ]  # 30 / 3 => 10, offset +1
    [ $(calc_lines_per_file 31 3) -eq 11 ]
    [ $(calc_lines_per_file 32 3) -eq 11 ]
    [ $(calc_lines_per_file 33 3) -eq 12 ]
    [ $(calc_lines_per_file 34 3) -eq 12 ]
    [ $(calc_lines_per_file 35 3) -eq 12 ]
    [ $(calc_lines_per_file 36 3) -eq 13 ]

    [ $(calc_lines_per_file 2996 3) -eq 999 ]
    [ $(calc_lines_per_file 2997 3) -eq 1000 ]
    [ $(calc_lines_per_file 2998 3) -eq 1000 ]
    [ $(calc_lines_per_file 2999 2) -eq 1000 ]
    [ $(calc_lines_per_file 3000 2) -eq 1000 ]  # above max value
    [ $(calc_lines_per_file 3001 2) -eq 1000 ]
}
