#!/bin/bash
#
# Converts media files to Asterisk-compatible WAV format.
#
# This script finds all .m4a, .mp3, and .mp4 files in the current directory
# and subdirectories, converts them to 16-bit, 8kHz mono WAV files, and 
# places them in a corresponding directory structure under '../sounds/'.
#
# Examples:
#   source-audio/0_instructions.m4a -> sounds/0_instructions.wav
#   source-audio/prompts/help_main_menu.m4a -> sounds/prompts/help_main_menu.wav

# Process files in current directory (existing behavior)
for f in *.m4a *.mp3 *.mp4 *.3gp *.wav; do
  if [ -f "$f" ]; then
    # Only process files with a digit prefix and an underscore
    if [[ "$f" =~ ^[0-9]{1,3}_.+\.(m4a|mp3|mp4|3gp|wav)$ ]]; then
      base_name="${f%.*}"
      # Extract the number prefix
      number_prefix="${f%%_*}"
      # Create directory for the number and place recording.wav inside
      output_dir="../sounds/${number_prefix}"
      mkdir -p "$output_dir"
      output_file="$output_dir/recording.wav"
      # Skip conversion if the output file already exists and is newer
      if [ -f "$output_file" ] && [ "$output_file" -nt "$f" ]; then
        echo "Skipping '$f': output file '$output_file' already exists and is newer."
        continue
      fi
      echo "Converting '$f' -> '$output_file'..."
      # Normalization filter and parameters can be set via environment variables
      NORMALIZE_FILTER="${NORMALIZE_FILTER:-loudnorm=I=-18:TP=-1:LRA=11}"
      # Use -c:a instead of deprecated -acodec
      ffmpeg -y -i "$f" -af "$NORMALIZE_FILTER" -c:a pcm_s16le -ar 8000 -ac 1 "$output_file"
    else
      echo "Skipping '$f': filename must start with digits, underscore, then description (e.g., 2_birthday.m4a)"
    fi
  fi
done

# Process files in ./prompts directory
PROMPTS_DIR="./prompts"
if [ -d "$PROMPTS_DIR" ]; then
  for f in "$PROMPTS_DIR"/*.m4a; do
    if [ -f "$f" ]; then
      base_name="${f##*/}"  # Extract the filename without the path
      base_name="${base_name%.*}"  # Remove the file extension
      output_dir="../sounds/prompts"
      mkdir -p "$output_dir"
      output_file="$output_dir/${base_name}.wav"
      # Skip conversion if the output file already exists and is newer
      if [ -f "$output_file" ] && [ "$output_file" -nt "$f" ]; then
        echo "Skipping '$f': output file '$output_file' already exists and is newer."
        continue
      fi
      echo "Converting '$f' -> '$output_file'..."
      # Normalization filter and parameters can be set via environment variables
      NORMALIZE_FILTER="${NORMALIZE_FILTER:-loudnorm=I=-18:TP=-1:LRA=11}"
      ffmpeg -y -i "$f" -af "$NORMALIZE_FILTER" -c:a pcm_s16le -ar 8000 -ac 1 "$output_file"
    fi
  done
else
  echo "Directory '$PROMPTS_DIR' does not exist. Skipping prompts conversion."
fi

echo ""
echo "Conversion complete. Converted .wav files are in '../sounds/' with preserved directory structure."
