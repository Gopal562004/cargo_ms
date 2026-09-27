import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_high_res_icons():
    # Render at 4096 x 4096 for pristine super-sampled anti-aliasing
    S = 4096
    scale = S / 24.0
    
    # Target size of the package icon inside the canvas (~58% of canvas)
    target_box_ratio = 0.58
    icon_scale = (S * target_box_ratio) / 24.0
    center = S / 2.0
    
    def transform_pt(x, y):
        return (center + (x - 12.0) * icon_scale, center + (y - 12.0) * icon_scale)

    # 1. Create Base Canvas with Transparency
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    
    # 2. Render Gradient Squircle Mask
    # Padding: 320px on 4096 (which is 80px on 1024)
    pad = int(S * 0.08)
    radius = int(S * 0.175) # ~17.5% radius for modern crisp squircle (less rounded enterprise look)
    
    # Create gradient background
    bg = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw_bg = ImageDraw.Draw(bg)
    
    # Vertical gradient from Indigo-500 (#6366f1) to Indigo-800 (#3730a3)
    c_top = (99, 102, 241, 255)
    c_mid = (79, 70, 229, 255)
    c_bot = (55, 48, 163, 255)
    
    for y in range(pad, S - pad):
        factor = (y - pad) / float(S - 2 * pad)
        if factor < 0.5:
            f = factor / 0.5
            r = int(c_top[0] + (c_mid[0] - c_top[0]) * f)
            g = int(c_top[1] + (c_mid[1] - c_top[1]) * f)
            b = int(c_top[2] + (c_mid[2] - c_top[2]) * f)
        else:
            f = (factor - 0.5) / 0.5
            r = int(c_mid[0] + (c_bot[0] - c_mid[0]) * f)
            g = int(c_mid[1] + (c_bot[1] - c_mid[1]) * f)
            b = int(c_mid[2] + (c_bot[2] - c_mid[2]) * f)
        draw_bg.line([(pad, y), (S - pad, y)], fill=(r, g, b, 255))
        
    # Mask with rounded rectangle
    mask = Image.new('L', (S, S), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle([pad, pad, S - pad, S - pad], radius=radius, fill=255)
    
    # Shadow layer
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(shadow)
    draw_shadow.rounded_rectangle([pad, pad + int(S * 0.025), S - pad, S - pad + int(S * 0.025)], radius=radius, fill=(15, 23, 42, 140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(S * 0.035)))
    
    # Composite shadow and gradient squircle
    img = Image.alpha_composite(img, shadow)
    img.paste(bg, (0, 0), mask)
    
    # 3. Add Rim Light (Inner stroke for premium depth)
    rim = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw_rim = ImageDraw.Draw(rim)
    rim_width = int(S * 0.005)
    draw_rim.rounded_rectangle([pad + 2, pad + 2, S - pad - 2, S - pad - 2], radius=radius - 2, outline=(255, 255, 255, 75), width=rim_width)
    img = Image.alpha_composite(img, rim)
    
    # 4. Draw White Package Geometry (Identical to BrandLogo Package icon)
    # Stroke width: ~2 units in 24x24 space
    stroke_w = int(1.85 * icon_scale)
    
    # Outer 3D Hexagon Vertices
    # In 24-grid: (12, 2.3), (20.5, 6.8), (20.5, 15.8), (12, 21.7), (3.5, 15.8), (3.5, 6.8)
    p_top = transform_pt(12.0, 2.3)
    p_top_right = transform_pt(20.4, 6.8)
    p_bot_right = transform_pt(20.4, 15.8)
    p_bot = transform_pt(12.0, 21.7)
    p_bot_left = transform_pt(3.6, 15.8)
    p_top_left = transform_pt(3.6, 6.8)
    p_center = transform_pt(12.0, 11.9)
    
    draw = ImageDraw.Draw(img)
    
    # Draw outer hexagon outline
    hex_points = [p_top, p_top_right, p_bot_right, p_bot, p_bot_left, p_top_left, p_top]
    for i in range(len(hex_points) - 1):
        pt1 = hex_points[i]
        pt2 = hex_points[i + 1]
        draw.line([pt1, pt2], fill=(255, 255, 255, 255), width=stroke_w)
        # Smooth joints
        r_joint = stroke_w / 2.0
        draw.ellipse([pt1[0] - r_joint, pt1[1] - r_joint, pt1[0] + r_joint, pt1[1] + r_joint], fill=(255, 255, 255, 255))
        
    # Center vertical fold line: (12, 12) -> (12, 22)
    p_center_fold_end = transform_pt(12.0, 21.5)
    draw.line([p_center, p_center_fold_end], fill=(255, 255, 255, 255), width=stroke_w)
    
    # Top flaps crease: (3.3, 7.0) -> (12, 12) -> (20.7, 7.0)
    p_crease_left = transform_pt(3.6, 6.9)
    p_crease_right = transform_pt(20.4, 6.9)
    draw.line([p_crease_left, p_center], fill=(255, 255, 255, 255), width=stroke_w)
    draw.line([p_center, p_crease_right], fill=(255, 255, 255, 255), width=stroke_w)
    
    # Center point cap
    r_joint = stroke_w / 2.0
    draw.ellipse([p_center[0] - r_joint, p_center[1] - r_joint, p_center[0] + r_joint, p_center[1] + r_joint], fill=(255, 255, 255, 255))
    
    # Top diagonal tape strip: (7.5, 4.27) -> (16.5, 9.42)
    p_tape_start = transform_pt(7.5, 4.3)
    p_tape_end = transform_pt(16.5, 9.45)
    draw.line([p_tape_start, p_tape_end], fill=(255, 255, 255, 255), width=stroke_w)
    draw.ellipse([p_tape_start[0] - r_joint, p_tape_start[1] - r_joint, p_tape_start[0] + r_joint, p_tape_start[1] + r_joint], fill=(255, 255, 255, 255))
    draw.ellipse([p_tape_end[0] - r_joint, p_tape_end[1] - r_joint, p_tape_end[0] + r_joint, p_tape_end[1] + r_joint], fill=(255, 255, 255, 255))

    # 5. Downsample with Lanczos to Ultra-HD 1024x1024 master
    print("Downsampling 4096px -> 1024px with Lanczos...")
    im_1024 = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    im_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    im_256 = img.resize((256, 256), Image.Resampling.LANCZOS)
    
    os.makedirs('assets', exist_ok=True)
    
    # Save High-Resolution Master PNGs
    im_1024.save('assets/icon.png', format='PNG', optimize=True)
    im_512.save('assets/icon-512.png', format='PNG', optimize=True)
    im_256.save('assets/icon-256.png', format='PNG', optimize=True)
    print("Saved assets/icon.png (1024x1024)")
    print("Saved assets/icon-512.png (512x512)")
    print("Saved assets/icon-256.png (256x256)")
    
    # Save High-Definition Multi-Resolution Windows ICO
    # Contains all standard Windows icon mipmaps: 16, 24, 32, 48, 64, 128, 256
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    im_256.save('assets/icon.ico', format='ICO', sizes=ico_sizes)
    print("Saved assets/icon.ico with mipmap resolutions: 16, 24, 32, 48, 64, 128, 256")
    
    # Also copy to client/public so web favicon and brand assets have crystal clarity
    os.makedirs('client/public', exist_ok=True)
    im_1024.save('client/public/icon.png', format='PNG', optimize=True)
    im_256.save('client/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("Updated client/public/icon.png and favicon.ico")

if __name__ == '__main__':
    create_high_res_icons()
