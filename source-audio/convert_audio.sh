#!/bin/bash
#
# Converts media files to Asterisk-compatible WAV format.
#
# This script finds all .m4a, .mp3, and .mp4 files in the current directory,
# converts them to 16-bit, 8kHz mono WAV files, and places them in a 
# 'converted' subdirectory.


# For each file named <digit>_<desc>.<ext>, convert to ../sounds/<digit>_<desc>.wav
for f in *.m4a *.mp3 *.mp4; do
  if [ -f "$f" ]; then
    # Only process files with a digit prefix and an underscore
    if [[ "$f" =~ ^[0-9]{1,3}_.+\.(m4a|mp3|mp4)$ ]]; then
      base_name="${f%.*}"
      output_file="../sounds/${base_name}.wav"
      # Convert only if source is newer or destination missing
      # if [ ! -f "$output_file" ] || [ "$f" -nt "$output_file" ]; then
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

echo ""
echo "Conversion complete. Converted .wav files are in '../sounds/'."
