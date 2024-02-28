#!/bin/bash

declare -A limits=(
    ["js"]="$js"
    ["txt"]="$txt"
    ["svg"]="$svg"
    ["png"]="$png"
    ["jpg"]="$jpg"
    ["json"]="$json"
    ["css"]="$css"
    ["mp4"]="$mp4"
    ["ico"]="$ico"
)

IGNORED_ASSETS=($(echo $ignored_paths | jq -r '.[]'))

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
