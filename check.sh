#!/bin/bash

# Parse input parameters for asset types and their limits
parse_input_params() {
    local input_types="$1"
    local type_limit_pair
    IFS=$'\n'
    for type_limit_pair in $input_types; do
        # Check if input is in the format 'type:limit' or 'type limit'
        if [[ "$type_limit_pair" =~ ":" ]]; then
            local type=$(echo "$type_limit_pair" | cut -d':' -f1)
            local limit=$(echo "$type_limit_pair" | cut -d':' -f2)
        else
            local type=$(echo "$type_limit_pair" | awk '{print $1}')
            local limit=$(echo "$type_limit_pair" | awk '{print $2}')
        fi
        limits["$type"]="$limit"
    done
}

# Function to convert file size to human-readable format
convert() {
    local bytes=$1
    if (( bytes < 1024 )); then
        echo "${bytes} bytes"
    elif (( bytes < 1048576 )); then
        echo "$(( bytes / 1024 )) KB"
    elif (( bytes < 1073741824 )); then
        printf "%.2f MB" "$(echo "scale=2; $bytes / 1024 / 1024" | bc)"
    else
        printf "%.2f GB" "$(echo "scale=2; $bytes / 1024 / 1024 / 1024" | bc)"
    fi
}

# Function to check file size against limits
check_file_size() {
    local file="$1"
    local size=$(stat -c %s "$file")
    local extension="${file##*.}"
    local extension="${extension,,}"
    local limit="${limits[$extension]}"
    
    if [ -n "$limit" ]; then
        if [[ " ${IGNORED_ASSETS[*]} " =~ "$file" ]]; then
            echo -e "Warning: File $file exceeds the limit for type .$extension Size: $(convert $size) (Limit: $(convert $limit))"
        elif [ "$size" -gt "$limit" ]; then
            echo -e "Error: File $file exceeds the limit for type .$extension Size: $(convert $size) (Limit: $(convert $limit))"
        fi
    fi
}

# Recursive function to check files in directories
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

# Main script starts here
declare -A limits

# Parse input parameters for asset types and their limits
parse_input_params "$types"

IGNORED_ASSETS=($(echo $ignored_paths | jq -r '.[]'))

recursive_check "$asset_paths"
