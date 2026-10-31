import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from PIL import Image
import numpy as np

def natural_sort_key(s):
    return [int(c) if c.isdigit() else c.lower() for c in re.split(r'(\d+)', s)]

def are_frames_nearly_identical(f1_path, f2_path, threshold=2.0):
    try:
        im1 = Image.open(f1_path).resize((160, 90)).convert('RGB')
        im2 = Image.open(f2_path).resize((160, 90)).convert('RGB')
        diff = np.mean(np.abs(np.array(im1, dtype=float) - np.array(im2, dtype=float)))
        return diff < threshold, diff
    except Exception as e:
        print(f"Error comparing frames: {e}")
        return False, 999.0

def process_single_frame(task):
    src_path, desktop_path, mobile_path = task
    try:
        with Image.open(src_path) as img:
            img = img.convert('RGB')
            w, h = img.size
            aspect = h / w

            # Desktop 1600px wide, quality 78
            d_w = 1600
            d_h = int(round(d_w * aspect))
            im_d = img.resize((d_w, d_h), Image.Resampling.LANCZOS)
            im_d.save(desktop_path, format='WEBP', quality=78, method=4)

            # Mobile 960px wide, quality 72
            m_w = 960
            m_h = int(round(m_w * aspect))
            im_m = img.resize((m_w, m_h), Image.Resampling.LANCZOS)
            im_m.save(mobile_path, format='WEBP', quality=72, method=4)
        return True, None
    except Exception as e:
        return False, f"Failed {src_path}: {e}"

def get_folder_info(folder_path):
    files = [f for f in os.listdir(folder_path) if f.endswith('.webp')]
    count = len(files)
    total_bytes = sum(os.path.getsize(os.path.join(folder_path, f)) for f in files)
    return count, total_bytes

def main():
    start_time = time.time()
    hero_c1_dir = 'frames/hero section/clip 1'
    hero_c2_dir = 'frames/hero section/clip 2'
    hero_c3_dir = 'frames/hero section/clip 3'
    dismantle_dir = 'frames/dismantle'

    c1_files = [os.path.join(hero_c1_dir, f) for f in sorted(os.listdir(hero_c1_dir), key=natural_sort_key) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    c2_files = [os.path.join(hero_c2_dir, f) for f in sorted(os.listdir(hero_c2_dir), key=natural_sort_key) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    c3_files = [os.path.join(hero_c3_dir, f) for f in sorted(os.listdir(hero_c3_dir), key=natural_sort_key) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    dis_files = [os.path.join(dismantle_dir, f) for f in sorted(os.listdir(dismantle_dir), key=natural_sort_key) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

    print(f"Loaded frames: Clip 1 ({len(c1_files)}), Clip 2 ({len(c2_files)}), Clip 3 ({len(c3_files)}), Dismantle ({len(dis_files)})")

    # Check join seams
    hero_list = list(c1_files)

    if c1_files and c2_files:
        is_ident_1_2, diff_1_2 = are_frames_nearly_identical(c1_files[-1], c2_files[0])
        print(f"Join Clip 1 -> Clip 2 diff: {diff_1_2:.2f}. Nearly identical: {is_ident_1_2}")
        if is_ident_1_2:
            print("Skipping first frame of Clip 2 to prevent stutter.")
            hero_list.extend(c2_files[1:])
        else:
            hero_list.extend(c2_files)

    if hero_list and c3_files:
        is_ident_2_3, diff_2_3 = are_frames_nearly_identical(hero_list[-1], c3_files[0])
        print(f"Join Clip 2 -> Clip 3 diff: {diff_2_3:.2f}. Nearly identical: {is_ident_2_3}")
        if is_ident_2_3:
            print("Skipping first frame of Clip 3 to prevent stutter.")
            hero_list.extend(c3_files[1:])
        else:
            hero_list.extend(c3_files)

    print(f"Total Hero frames combined: {len(hero_list)}")

    # Target folders
    os.makedirs('assets/frames/hero', exist_ok=True)
    os.makedirs('assets/frames/hero-mobile', exist_ok=True)
    os.makedirs('assets/frames/dismantle', exist_ok=True)
    os.makedirs('assets/frames/dismantle-mobile', exist_ok=True)
    os.makedirs('assets/cars', exist_ok=True)

    # Build tasks
    tasks = []
    for idx, src in enumerate(hero_list, start=1):
        d_out = os.path.join('assets/frames/hero', f'frame_{idx:04d}.webp')
        m_out = os.path.join('assets/frames/hero-mobile', f'frame_{idx:04d}.webp')
        tasks.append((src, d_out, m_out))

    for idx, src in enumerate(dis_files, start=1):
        d_out = os.path.join('assets/frames/dismantle', f'frame_{idx:04d}.webp')
        m_out = os.path.join('assets/frames/dismantle-mobile', f'frame_{idx:04d}.webp')
        tasks.append((src, d_out, m_out))

    total_tasks = len(tasks)
    print(f"Starting conversion of {total_tasks} frames (both desktop and mobile) with ProcessPoolExecutor...")

    max_workers = min(12, os.cpu_count() or 4)
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(process_single_frame, tasks))

    errors = [err for ok, err in results if not ok]
    if errors:
        print(f"Errors occurred in {len(errors)} frames: {errors[:5]}")
    else:
        print("All frames converted successfully!")

    # Summary
    h_cnt, h_bytes = get_folder_info('assets/frames/hero')
    hm_cnt, hm_bytes = get_folder_info('assets/frames/hero-mobile')
    d_cnt, d_bytes = get_folder_info('assets/frames/dismantle')
    dm_cnt, dm_bytes = get_folder_info('assets/frames/dismantle-mobile')

    print("\n================== FRAME SUMMARY ==================")
    print(f"assets/frames/hero:           {h_cnt} frames, {h_bytes / (1024*1024):.2f} MB")
    print(f"assets/frames/hero-mobile:    {hm_cnt} frames, {hm_bytes / (1024*1024):.2f} MB")
    print(f"assets/frames/dismantle:        {d_cnt} frames, {d_bytes / (1024*1024):.2f} MB")
    print(f"assets/frames/dismantle-mobile: {dm_cnt} frames, {dm_bytes / (1024*1024):.2f} MB")
    print(f"Total time elapsed: {time.time() - start_time:.2f} seconds")
    print("====================================================\n")

if __name__ == '__main__':
    main()

