import os
import shutil
import zipfile

def package_chrome_extension():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    extension_dir = os.path.join(root_dir, "extensions", "chrome")
    output_zip = os.path.join(root_dir, "extensions", "ai-recruiter-clipper.zip")
    frontend_downloads_dir = os.path.join(root_dir, "frontend", "public", "downloads")
    frontend_zip = os.path.join(frontend_downloads_dir, "ai-recruiter-clipper.zip")

    os.makedirs(frontend_downloads_dir, exist_ok=True)

    files_to_pack = [
        "manifest.json",
        "popup.html",
        "popup.js",
        "content.js",
        "README.md",
        os.path.join("icons", "icon16.png"),
        os.path.join("icons", "icon48.png"),
        os.path.join("icons", "icon128.png"),
    ]

    print(f"Creating Chrome Extension package: {output_zip}")
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_rel in files_to_pack:
            abs_path = os.path.join(extension_dir, file_rel)
            if os.path.exists(abs_path):
                zf.write(abs_path, arcname=file_rel)
                print(f"  + Added: {file_rel}")
            else:
                print(f"  ! Missing file: {abs_path}")

    # Copy to frontend public assets for in-browser 1-click download
    shutil.copyfile(output_zip, frontend_zip)
    print(f"Copied package to frontend public directory: {frontend_zip}")
    print("Chrome extension package built successfully!")

if __name__ == "__main__":
    package_chrome_extension()
