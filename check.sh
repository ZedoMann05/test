#!/bin/bash

declare -A limits

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
        echo "$(( bytes / 1024 )) KB"
    elif (( bytes < 1073741824 )); then
        printf "%.2f MB, %.2f KB, %.2f bytes" "$(echo "scale=2; $bytes / 1024 / 1024" | bc)" "$(echo "scale=2; $bytes / 1024" | bc)" "$bytes"
    else
        printf "%.2f GB, %.2f MB, %.2f KB, %.2f bytes" "$(echo "scale=2; $bytes / 1024 / 1024 / 1024" | bc)" "$(echo "scale=2; $bytes / 1024 / 1024" | bc)" "$(echo "scale=2; $bytes / 1024" | bc)" "$bytes"
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
                echo -e "Warning: File $file exceeds the limit for type .$extension Size: $(convert $size) (Limit: $(convert $limit))"
            else
                echo -e "Error: File $file exceeds the limit for type .$extension Size: $(convert $size) (Limit: $(convert $limit))"
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
