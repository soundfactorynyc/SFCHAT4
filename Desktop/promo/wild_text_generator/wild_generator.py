#!/usr/bin/env python3
"""
WILD TEXT GENERATOR
Generates jaw-dropping, hypnotic text visuals for social media
Party in 14 days - let's make some magic
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import argparse
import random
import math
from pathlib import Path
import colorsys

class WildTextGenerator:
    def __init__(self, width=1080, height=1080):
        self.width = width
        self.height = height
        self.output_dir = Path("output")
        self.output_dir.mkdir(exist_ok=True)
        
    def create_melted_text_mask(self, text, font_size=200):
        """Create the melted/liquid text style mask"""
        mask = Image.new('L', (self.width, self.height), 0)
        draw = ImageDraw.Draw(mask)
        
        # Try to use a bold font
        try:
            font_paths = [
                '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
                '/System/Library/Fonts/Helvetica.ttc',
                '/Library/Fonts/Arial Bold.ttf',
            ]
            font = None
            for path in font_paths:
                try:
                    font = ImageFont.truetype(path, font_size)
                    break
                except:
                    continue
            if font is None:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()
        
        # Center text
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (self.width - text_width) // 2
        y = (self.height - text_height) // 2
        
        draw.text((x, y), text, fill=255, font=font)
        mask_array = np.array(mask)
        
        return mask, mask_array
    
    def generate_particle_field(self, seed, density=5000):
        """Generate particle positions"""
        random.seed(seed)
        np.random.seed(seed)
        
        particles = []
        for _ in range(density):
            x = np.random.randint(0, self.width)
            y = np.random.randint(0, self.height)
            size = np.random.uniform(1, 4)
            brightness = np.random.uniform(0.3, 1.0)
            hue = np.random.uniform(0, 1)
            particles.append((x, y, size, brightness, hue))
        
        return particles
    
    def create_energy_field(self, seed, text_mask_array):
        """Create flowing energy field"""
        random.seed(seed)
        img = Image.new('RGB', (self.width, self.height), (0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        num_flows = 200
        for _ in range(num_flows):
            x = random.randint(0, self.width)
            y = random.randint(0, self.height)
            angle = random.uniform(0, math.pi * 2)
            length = random.randint(50, 200)
            
            end_x = x + math.cos(angle) * length
            end_y = y + math.sin(angle) * length
            
            hue = random.uniform(0.5, 0.8)
            r, g, b = colorsys.hsv_to_rgb(hue, 0.8, 0.9)
            color = (int(r * 255), int(g * 255), int(b * 255))
            
            width = random.randint(1, 3)
            draw.line([(x, y), (end_x, end_y)], fill=color, width=width)
        
        img = img.filter(ImageFilter.GaussianBlur(radius=5))
        return img
    
    def create_holographic_effect(self, base_color=(180, 100, 255)):
        """Create holographic color shifts"""
        img = Image.new('RGB', (self.width, self.height), (0, 0, 0))
        pixels = img.load()
        
        for y in range(self.height):
            for x in range(self.width):
                wave1 = math.sin((x + y) * 0.01) * 0.5 + 0.5
                wave2 = math.cos((x - y) * 0.008) * 0.5 + 0.5
                
                hue = (wave1 * 0.3 + wave2 * 0.2) % 1.0
                r, g, b = colorsys.hsv_to_rgb(hue, 0.7, wave1 * 0.5)
                
                pixels[x, y] = (int(r * 255), int(g * 255), int(b * 255))
        
        return img
    
    def create_liquid_metal_bg(self, seed):
        """Create liquid metal background"""
        random.seed(seed)
        img = Image.new('RGB', (self.width, self.height), (10, 10, 15))
        
        for i in range(100):
            x = random.randint(-100, self.width + 100)
            y = random.randint(-100, self.height + 100)
            radius = random.randint(50, 300)
            brightness = random.uniform(0.3, 0.9)
            base = int(brightness * 255)
            
            temp_img = Image.new('RGB', (self.width, self.height), (0, 0, 0))
            draw = ImageDraw.Draw(temp_img)
            
            for r in range(radius, 0, -5):
                alpha = (r / radius) * brightness
                gray = int(alpha * base)
                color = (gray, gray + 20, gray + 40)
                draw.ellipse([x - r, y - r, x + r, y + r], fill=color)
            
            img = Image.blend(img, temp_img, 0.3)
        
        img = img.filter(ImageFilter.GaussianBlur(radius=15))
        return img
    
    def add_chromatic_aberration(self, img, strength=2):
        """Add RGB split effect"""
        r, g, b = img.split()
        r = r.transform(img.size, Image.AFFINE, (1, 0, -strength, 0, 1, 0))
        b = b.transform(img.size, Image.AFFINE, (1, 0, strength, 0, 1, 0))
        return Image.merge('RGB', (r, g, b))
    
    def shift_mask(self, mask, offset):
        """Shift mask for glitch effect"""
        return mask.transform(mask.size, Image.AFFINE, (1, 0, offset[0], 0, 1, offset[1]))
    
    def add_scan_lines(self, img, seed):
        """Add scan line effect"""
        overlay = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        random.seed(seed)
        
        for y in range(0, self.height, 4):
            opacity = random.randint(10, 30)
            draw.line([(0, y), (self.width, y)], fill=(255, 255, 255, opacity), width=1)
        
        img = img.convert('RGBA')
        img = Image.alpha_composite(img, overlay)
        return img.convert('RGB')
    
    def add_drip_effect(self, mask, seed):
        """Add dripping effect"""
        random.seed(seed)
        mask_array = np.array(mask)
        
        for x in range(self.width):
            column = mask_array[:, x]
            text_pixels = np.where(column > 128)[0]
            
            if len(text_pixels) > 0:
                bottom = text_pixels[-1]
                
                if random.random() > 0.7:
                    drip_length = random.randint(20, 80)
                    drip_width = random.randint(3, 10)
                    
                    for dy in range(drip_length):
                        y = bottom + dy
                        if y < self.height:
                            for dx in range(-drip_width // 2, drip_width // 2):
                                nx = x + dx
                                if 0 <= nx < self.width:
                                    fade = 1 - (dy / drip_length)
                                    mask_array[y, nx] = int(255 * fade)
        
        return Image.fromarray(mask_array)
    
    def add_reflections(self, img, mask):
        """Add reflection effect"""
        reflection = img.copy().transpose(Image.FLIP_TOP_BOTTOM)
        reflection_array = np.array(reflection)
        
        for y in range(self.height):
            fade = 1 - (y / self.height) * 0.7
            reflection_array[y] = (reflection_array[y] * fade).astype(np.uint8)
        
        reflection = Image.fromarray(reflection_array)
        result = Image.blend(img, reflection, 0.2)
        return result
    
    def generate_particle_style(self, text, seed):
        """STYLE 1: Particle Energy Field"""
        print(f"🔮 Generating PARTICLE style for '{text}' (seed: {seed})")
        
        text_mask, mask_array = self.create_melted_text_mask(text)
        
        # Create energy field background
        energy_bg = self.create_energy_field(seed, mask_array)
        
        # Generate particle field
        particles = self.generate_particle_field(seed, density=8000)
        
        # Create particle overlay
        particle_img = Image.new('RGBA', (self.width, self.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(particle_img)
        
        for x, y, size, brightness, hue in particles:
            if mask_array[int(y), int(x)] > 50:
                r, g, b = colorsys.hsv_to_rgb(hue, 0.8, brightness)
                color = (int(r * 255), int(g * 255), int(b * 255), int(brightness * 255))
                draw.ellipse([x - size, y - size, x + size, y + size], fill=color)
        
        # Composite
        energy_bg = energy_bg.convert('RGBA')
        result = Image.alpha_composite(energy_bg, particle_img)
        result = result.convert('RGB')
        
        # Add glow
        enhancer = ImageEnhance.Brightness(result)
        result = enhancer.enhance(1.3)
        
        # Add chromatic aberration
        result = self.add_chromatic_aberration(result, strength=3)
        
        print("✅ Particle style complete")
        return result
    
    def generate_holographic_style(self, text, seed):
        """STYLE 2: Holographic Glitch"""
        print(f"🌈 Generating HOLOGRAPHIC style for '{text}' (seed: {seed})")
        
        text_mask, mask_array = self.create_melted_text_mask(text)
        
        # Create holographic background
        holo_bg = self.create_holographic_effect()
        
        # Create glitched text layers
        mask_rgb = Image.new('RGB', (self.width, self.height), (0, 0, 0))
        
        # Create RGB split effect
        r_mask = self.shift_mask(text_mask, (-5, 0))
        g_mask = text_mask
        b_mask = self.shift_mask(text_mask, (5, 0))
        
        # Apply masks to background
        r, g, b = holo_bg.split()
        r_array = np.array(r)
        g_array = np.array(g)
        b_array = np.array(b)
        
        r_mask_array = np.array(r_mask)
        g_mask_array = np.array(g_mask)
        b_mask_array = np.array(b_mask)
        
        # Boost channels where text is
        r_array = np.where(r_mask_array > 128, np.minimum(r_array + 100, 255), r_array).astype(np.uint8)
        g_array = np.where(g_mask_array > 128, np.minimum(g_array + 80, 255), g_array).astype(np.uint8)
        b_array = np.where(b_mask_array > 128, np.minimum(b_array + 120, 255), b_array).astype(np.uint8)
        
        result = Image.merge('RGB', (Image.fromarray(r_array), Image.fromarray(g_array), Image.fromarray(b_array)))
        
        # Add glitch lines
        random.seed(seed)
        for _ in range(20):
            y = random.randint(0, self.height)
            offset = random.randint(-10, 10)
            height = random.randint(2, 8)
            crop = result.crop((0, y, self.width, min(y + height, self.height)))
            result.paste(crop, (offset, y))
        
        # Add scan lines
        result = self.add_scan_lines(result, seed)
        
        # Enhance saturation
        enhancer = ImageEnhance.Color(result)
        result = enhancer.enhance(1.5)
        
        print("✅ Holographic style complete")
        return result
    
    def generate_liquid_metal_style(self, text, seed):
        """STYLE 3: Liquid Metal Chrome"""
        print(f"💧 Generating LIQUID METAL style for '{text}' (seed: {seed})")
        
        text_mask, mask_array = self.create_melted_text_mask(text, font_size=220)
        
        # Add drip effect to mask
        text_mask = self.add_drip_effect(text_mask, seed)
        mask_array = np.array(text_mask)
        
        # Create liquid metal background
        bg = self.create_liquid_metal_bg(seed)
        
        # Create chrome/mercury effect
        chrome_img = Image.new('RGB', (self.width, self.height), (0, 0, 0))
        chrome_array = np.array(chrome_img)
        bg_array = np.array(bg)
        
        # Apply metallic gradient to text
        for y in range(self.height):
            for x in range(self.width):
                if mask_array[y, x] > 50:
                    # Metallic gradient
                    gradient = (y / self.height) * 0.6 + 0.4
                    base = int(gradient * 200)
                    chrome_array[y, x] = [base + 40, base + 50, base + 60]
        
        chrome_img = Image.fromarray(chrome_array)
        
        # Composite text over background
        text_alpha = Image.fromarray(mask_array)
        chrome_img.putalpha(text_alpha)
        bg = bg.convert('RGBA')
        result = Image.alpha_composite(bg, chrome_img)
        result = result.convert('RGB')
        
        # Add reflections
        result = self.add_reflections(result, text_mask)
        
        # Add subtle glow
        glow = result.filter(ImageFilter.GaussianBlur(radius=10))
        result = Image.blend(result, glow, 0.3)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(result)
        result = enhancer.enhance(1.4)
        
        print("✅ Liquid metal style complete")
        return result
    
    def generate(self, text, style='particle', seed=None, output_path=None):
        """Main generation function"""
        if seed is None:
            seed = random.randint(0, 999999)
        
        # Generate based on style
        if style == 'particle':
            result = self.generate_particle_style(text, seed)
        elif style == 'holographic':
            result = self.generate_holographic_style(text, seed)
        elif style == 'liquid':
            result = self.generate_liquid_metal_style(text, seed)
        else:
            raise ValueError(f"Unknown style: {style}. Use 'particle', 'holographic', or 'liquid'")
        
        # Save output
        if output_path is None:
            safe_text = text.replace(' ', '_').replace('/', '_')[:20]
            output_path = self.output_dir / f"{safe_text}_{style}_seed{seed}.png"
        
        result.save(output_path, 'PNG', quality=95)
        print(f"💾 Saved: {output_path}")
        
        return result, output_path

def main():
    parser = argparse.ArgumentParser(
        description='🔥 WILD TEXT GENERATOR - Create jaw-dropping text visuals',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 wild_generator.py --text "NEXT LEVEL" --style particle
  python3 wild_generator.py --text "GENIUS" --style holographic --batch 5
  python3 wild_generator.py --text "WILD" --style liquid --seed 42
        """
    )
    
    parser.add_argument('--text', required=True, help='Text to generate')
    parser.add_argument('--style', default='particle', choices=['particle', 'holographic', 'liquid'],
                        help='Visual style (default: particle)')
    parser.add_argument('--seed', type=int, default=None, help='Random seed for reproducibility')
    parser.add_argument('--batch', type=int, default=1, help='Number of variations to generate')
    parser.add_argument('--width', type=int, default=1080, help='Output width (default: 1080)')
    parser.add_argument('--height', type=int, default=1080, help='Output height (default: 1080)')
    
    args = parser.parse_args()
    
    print("🔥 WILD TEXT GENERATOR 🔥")
    print(f"Text: '{args.text}'")
    print(f"Style: {args.style}")
    print(f"Batch: {args.batch}")
    print("=" * 50)
    
    generator = WildTextGenerator(width=args.width, height=args.height)
    
    results = []
    for i in range(args.batch):
        print(f"\n[{i+1}/{args.batch}]")
        
        # Use provided seed or generate random one
        if args.seed is not None:
            seed = args.seed + i
        else:
            seed = random.randint(0, 999999)
        
        result, path = generator.generate(args.text, args.style, seed)
        results.append((result, path, seed))
    
    print("\n" + "=" * 50)
    print("🎉 GENERATION COMPLETE!")
    print(f"Generated {len(results)} image(s):")
    for _, path, seed in results:
        print(f"  • {path.name} (seed: {seed})")
    print("=" * 50)

if __name__ == '__main__':
    main()
