#!/bin/bash

declare -A limits
declare -A errors
declare -A warnings

# Parse input parameters for asset types and their limits
parse_input_params() {
    local input_types="$1"
    local type_limit_pair
    for type_limit_pair in $input_types; do
        local type=$(echo "$type_limit_pair" | cut -d':' -f1)
        local limit=$(echo "$type_limit_pair" | cut -d':' -f2)
        # Convert limit to bytes if it's in human-readable format
        if [[ "$limit" == *GB ]]; then
            limit=$(echo "$limit" | sed 's/GiB//')
            limit=$(( limit * 1024 * 1024 * 1024 ))
        elif [[ "$limit" == *MB ]]; then
            limit=$(echo "$limit" | sed 's/MB//')
            limit=$(( limit * 1024 * 1024 ))
        elif [[ "$limit" == *KB ]]; then
            limit=$(echo "$limit" | sed 's/KB//')
            limit=$(( limit * 1024 ))
        fi
        limits["$type"]="$limit"
    done
}

convert() {
    local bytes=$1
    if (( bytes < 1024 )); then
        echo "${bytes} bytes"
    elif (( bytes < 1048576 )); then
        echo "$(( bytes / 1024 )) KB"
    elif (( bytes < 1073741824 )); then
        printf "%.2f MB" "$(echo "scale=2; $bytes / 1024 / 1024" | bc)"
    else
        printf "%.2f GiB" "$(echo "scale=2; $bytes / 1024 / 1024 / 1024" | bc)"
    fi
}


check_file_size() {
    local file="$1"
    local size=$(stat -c %s "$file")
    local extension="${file##*.}"
    local extension="${extension,,}"
    local limit="${limits[$extension]}"
    
    if [ -n "$limit" ]; then
        if [ "$size" -gt "$limit" ]; then
            if [[ " ${IGNORED_ASSETS[*]} " =~ "$file" ]]; then
                warnings["$extension"]+="- Warning: File \`$file\` exceeds the limit for type .$extension Size: $(convert $size) (Limit: $(convert $limit))\n"
            else
                errors["$extension"]+="- Error: File \`$file\` exceeds the limit for type .$extension Size: $(convert $size) (Limit: $(convert $limit))\n"
            fi
        fi
    fi
}

# Main script starts here

# Parse input parameters for asset types and their limits
parse_input_params "$@"

IGNORED_ASSETS=($(echo $ignored_paths | jq -r '.[]'))

recursive_check() {
    local current_folder="$1"
    for file in "$current_folder"/*; do
        if [ -f "$file" ]; then
            check_file_size "$file"
        elif [ -d "$file" ]; then
            recursive_check "$file"
        fi
    done
}

recursive_check "$asset_paths"

# Print report
echo "# Assets Size Validation Report" > ./report.md

total_errors=0
total_warnings=0

if [ ${#errors[@]} -gt 0 ]; then
    for extension in "${!errors[@]}"; do
        errors_count=$(grep -o 'Error' <<< "${errors[$extension]}" | wc -l)
        total_errors=$((total_errors + errors_count))
    done
fi

if [ ${#warnings[@]} -gt 0 ]; then
    for extension in "${!warnings[@]}"; do
        warnings_count=$(grep -o 'Warning' <<< "${warnings[$extension]}" | wc -l)
        total_warnings=$((total_warnings + warnings_count))
    done
fi

if [ $total_errors -gt 0 ] && [ $total_warnings -gt 0 ]; then
    echo "Status: \`FAILED\`" >> ./report.md
    echo -e "\nSome assets exceed the specified limit in the following directories: \`$asset_paths\`." >> ./report.md
    echo -e "\nTotal Errors: <b>$total_errors</b>" >> ./report.md
    echo -e "Total Warnings: <b>$total_warnings</b>" >> ./report.md
    echo -e "\n## Errors" >> ./report.md

    for extension in "${!errors[@]}"; do
        echo -e "<b>$extension</b>" >> ./report.md
        echo -e "Limit: <b>$(convert ${limits[$extension]})</b>" >> ./report.md
        echo -e "${errors[$extension]}" >> ./report.md
    done

    echo -e "\n## Warnings" >> ./report.md

    for extension in "${!warnings[@]}"; do
        echo -e "<b>$extension</b>" >> ./report.md
        echo -e "Limit: <b>$(convert ${limits[$extension]})</b>" >> ./report.md
        echo -e "${warnings[$extension]}" >> ./report.md
    done
elif [ $total_errors -eq 0 ] && [ $total_warnings -gt 0 ]; then
    echo "Status: \`WARNING\`" >> ./report.md
    echo -e "\nSome assets exceed the specified limit in the following directories: \`$asset_paths\`, but they do not fail the validation because they are ignored by configuration." >> ./report.md
    echo -e "\nTotal Warnings: <b>$total_warnings</b>" >> ./report.md
    echo -e "\n## Warnings" >> ./report.md

    for extension in "${!warnings[@]}"; do
        echo -e "<b>$extension</b>" >> ./report.md
        echo -e "Limit: <b>$(convert ${limits[$extension]})</b>" >> ./report.md
        echo -e "${warnings[$extension]}" >> ./report.md
    done
elif [ $total_errors -gt 0 ] && [ $total_warnings -eq 0 ]; then
    echo "Status: \`FAILED\`" >> ./report.md
    echo -e "\nSome assets exceed the specified limit in the following directories: \`$asset_paths\`." >> ./report.md
    echo -e "\nTotal Errors: <b>$total_errors</b>" >> ./report.md
    echo -e "\n## Errors" >> ./report.md

    for extension in "${!errors[@]}"; do
        echo -e "<b>$extension</b>" >> ./report.md
        echo -e "Limit: <b>$(convert ${limits[$extension]})</b>" >> ./report.md
        echo -e "${errors[$extension]}" >> ./report.md
    done
else
    echo "Status: \`SUCCESS\`" >> ./report.md
    echo -e "\nAll assets match the size limit for their file types in the following directories: \`$asset_paths\`." >> ./report.md
    echo -e "\nNo actions required." >> ./report.md
fi

