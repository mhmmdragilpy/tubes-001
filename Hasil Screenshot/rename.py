import os
import re

directory = r"C:\Users\fahmi\Downloads\Joki Azmoy\Hasil Screenshot"
for filename in os.listdir(directory):
    if filename.startswith("screencapture-file-C-Users-fahmi-Downloads-Joki-Azmoy-prototype-"):
        rest = filename.replace("screencapture-file-C-Users-fahmi-Downloads-Joki-Azmoy-prototype-", "")
        new_name = re.sub(r'-html-\d{4}-\d{2}-\d{2}-\d{2}_\d{2}_\d{2}\.png$', '.png', rest)
        
        old_path = os.path.join(directory, filename)
        new_path = os.path.join(directory, new_name)
        
        if not os.path.exists(new_path):
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} -> {new_name}")
        else:
            print(f"File {new_name} already exists, skipping {filename}")
