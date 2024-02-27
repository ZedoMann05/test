#!/bin/bash

declare -A limits=(
    ["js"]="$1"   # 1MB для .js файлів
    ["txt"]="$2"   # 500KB для .txt файлів
    ["svg"]="$3"   # 2MB для .svg файлів
    ["png"]="$4"   # 3MB для .png файлів
    ["jpg"]="$5"   # 3MB для .jpg файлів
    ["json"]="$6"  # 1MB для .json файлів
    ["css"]="$7"   # 1MB для .css файлів
    ["mp4"]="$8"   # 20MB для .mp4 файлів
    ["ico"]="$9"    # 50KB для .ico файлів
)

folder_to_check="./public"
IGNORED_ASSETS="./public/video/wellcome_ru.mp4"
# Функція для перевірки розміру файлу та порівняння з лімітом для відповідного типу файлу
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
    local extension="${file##*.}"  # Визначаємо розширення файлу
    local extension="${extension,,}"  # Перетворюємо розширення в нижній регістр
    local limit="${limits[$extension]}"
    
    # Функція для конвертації розміру з байтів у зручний формат
    if [ -n "$limit" ]; then
        if [ "$size" -gt "$limit" ]; then
            excess=$((size - limit))
            echo -e "::error::File $file exceeds the limit for type .$extension \e[31mSize\e[0m: $(convert $size) (\e[32mLimit\e[0m: $(convert $limit))"
        fi
    fi
}

check_ignor_size() {
    local file="$1"
    local size=$(stat -c %s "$file")
    local extension="${file##*.}"  # Визначаємо розширення файлу
    local extension="${extension,,}"  # Перетворюємо розширення в нижній регістр
    local limit="${limits[$extension]}"
    
    # Функція для конвертації розміру з байтів у зручний формат
    if [ -n "$limit" ]; then
        if [ "$size" -gt "$limit" ]; then
            excess=$((size - limit))
            echo -e "Warning: File $file exceeds the limit for type .$extension \e[31mSize\e[0m: $(convert $size) (\e[32mLimit\e[0m: $(convert $limit))"
        fi
    fi
}

# Рекурсивна функція для обходу файлів у папках
recursive_check() {
    local current_folder="$1"
    for file in "$current_folder"/*; do
        # Перевіряємо, чи файл не є серед ігнорованих ассетів
        if ! [[ " ${IGNORED_ASSETS[*]} " =~ " ${file} " ]]; then
            if [ -f "$file" ]; then
                check_file_size "$file"
            elif [ -d "$file" ]; then
                recursive_check "$file"
            fi
        fi
    done
}

recursive_ignor() {
    local current_folder="$1"
    for file in "$current_folder"/*; do
        if [ -f "$file" ]; then
            check_file_size "$file"
        elif [ -d "$file" ]; then
            recursive_ignor "$file"
        fi
    done
}

# Починаємо рекурсивний обхід з папки folder_to_check
recursive_check "$folder_to_check"
# Перевірка проігнорованих ассетів
ignored_assets_exceeding_limit=""
for ignore_path in $IGNORED_ASSETS; do
    output=$(recursive_ignor "$ignore_path")
done
