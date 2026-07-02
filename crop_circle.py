import os
from PIL import Image, ImageDraw

def make_circle_transparent(input_path, output_path):
    # Open the image and convert to RGBA
    img = Image.open(input_path).convert("RGBA")
    
    # Ensure it's square
    size = min(img.size)
    
    # Crop to a square first
    left = (img.size[0] - size) / 2
    top = (img.size[1] - size) / 2
    right = (img.size[0] + size) / 2
    bottom = (img.size[1] + size) / 2
    img = img.crop((left, top, right, bottom))
    
    # Create a mask
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    
    # Apply mask
    img.putalpha(mask)
    
    # Resize to standard favicon size to save bytes
    img = img.resize((512, 512), Image.Resampling.LANCZOS)
    
    # Save
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

input_img = "/Users/mac/.gemini/antigravity/scratch/umay-platform/umay-dashboard/public/umay_emblem.jpg"
output_img = "/Users/mac/.gemini/antigravity/scratch/umay-platform/umay-dashboard/src/app/icon.png"

make_circle_transparent(input_img, output_img)
