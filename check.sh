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
            limit=$(echo "$limit" | sed 's/GB//')
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
        printf "%.2f KB" "$(echo "scale=2; $bytes / 1024" | bc)"
    elif (( bytes < 1073741824 )); then
        printf "%.2f MB" "$(echo "scale=2; $bytes / 1024 / 1024" | bc)"
    else
        printf "%.2f GB" "$(echo "scale=2; $bytes / 1024 / 1024 / 1024" | bc)"
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
            errors["$extension"]+="\n$((size - limit)) bytes over the limit: $file ($(convert $size) > $(convert $limit))"
        elif [[ " ${IGNORED_ASSETS[*]} " =~ "$file" ]]; then
            warnings["$extension"]+="\nIgnored asset: $file ($(convert $size))"
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

# Print report to ./report.txt
echo "Assets Size Validation Report" > ./report.txt

if [ ${#errors[@]} -gt 0 ]; then
    echo "Status: FAILED" >> ./report.txt
    echo -e "\nSome assets exceed the specified limit in the following directories: $asset_paths." >> ./report.txt
    echo -e "\nTotal Errors: ${#errors[@]}." >> ./report.txt
    echo -e "\nErrors" >> ./report.txt

    for extension in "${!errors[@]}"; do
        echo -e "$extension" >> ./report.txt
        echo -e "Limit: $(convert ${limits[$extension]})" >> ./report.txt
        echo -e "${errors[$extension]}" >> ./report.txt
    done
elif [ ${#warnings[@]} -gt 0 ]; then
    echo "Status: WARNING" >> ./report.txt
    echo -e "\nSome assets exceed the specified limit in the following directories: $asset_paths, but they do not fail the validation because they are ignored by configuration." >> ./report.txt
    echo -e "\nTotal Warnings: ${#warnings[@]}." >> ./report.txt
    echo -e "\nWarnings" >> ./report.txt

    for extension in "${!warnings[@]}"; do
        echo -e "$extension" >> ./report.txt
        echo -e "Limit: $(convert ${limits[$extension]})" >> ./report.txt
        echo -e "${warnings[$extension]}" >> ./report.txt
    done
else
    echo "Status: SUCCESS" >> ./report.txt
    echo -e "\nAll assets match the size limit for their file types in the following directories: $asset_paths." >> ./report.txt
    echo -e "\nNo actions required." >> ./report.txt
fi
