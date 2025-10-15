#!/usr/bin/env python3
"""
PARTY FLYER GENERATOR
Production-ready system for promoters to create custom party flyers
Each party gets unique branding with the same wild aesthetic
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import argparse
import random
import json
from pathlib import Path
from datetime import datetime
from wild_generator import WildTextGenerator

class PartyFlyerGenerator:
    def __init__(self, width=1080, height=1350):
        """Instagram Story dimensions by default"""
        self.width = width
        self.height = height
        self.text_gen = WildTextGenerator(width, height)
        self.output_dir = Path("flyers")
        self.output_dir.mkdir(exist_ok=True)
        self.templates_dir = Path("templates")
        self.templates_dir.mkdir(exist_ok=True)
        
    def load_party_config(self, config_path):
        """Load party configuration from JSON"""
        with open(config_path, 'r') as f:
            return json.load(f)
    
    def create_party_flyer(self, party_name, headline, date, venue, style='particle', 
                          seed=None, lineup=None, bottom_text=None):
        """Generate complete party flyer with all info"""
        print(f"🎉 Creating flyer for: {party_name}")
        
        if seed is None:
            seed = random.randint(0, 999999)
        
        # Generate main headline visual
        headline_img = self.text_gen.generate(headline, style, seed, output_path=None)[0]
        
        # Create full flyer canvas
        flyer = Image.new('RGB', (self.width, self.height), (0, 0, 0))
        
        # Paste headline in upper portion
        headline_resized = headline_img.resize((self.width, int(self.height * 0.4)))
        flyer.paste(headline_resized, (0, 50))
        
        # Add party details
        draw = ImageDraw.Draw(flyer)
        
        # Try to load fonts
        try:
            title_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 60)
            info_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 40)
            detail_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 35)
            small_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 28)
        except:
            title_font = info_font = detail_font = small_font = ImageFont.load_default()
        
        # Party name
        y_pos = int(self.height * 0.5)
        name_bbox = draw.textbbox((0, 0), party_name, font=title_font)
        name_width = name_bbox[2] - name_bbox[0]
        draw.text(((self.width - name_width) // 2, y_pos), party_name, 
                 fill=(255, 255, 255), font=title_font)
        
        # Date and venue
        y_pos += 100
        date_text = f"{date}"
        date_bbox = draw.textbbox((0, 0), date_text, font=info_font)
        date_width = date_bbox[2] - date_bbox[0]
        draw.text(((self.width - date_width) // 2, y_pos), date_text,
                 fill=(200, 200, 255), font=info_font)
        
        y_pos += 80
        venue_bbox = draw.textbbox((0, 0), venue, font=detail_font)
        venue_width = venue_bbox[2] - venue_bbox[0]
        draw.text(((self.width - venue_width) // 2, y_pos), venue,
                 fill=(180, 180, 180), font=detail_font)
        
        # Lineup if provided
        if lineup:
            y_pos += 100
            lineup_title = "LINEUP"
            title_bbox = draw.textbbox((0, 0), lineup_title, font=info_font)
            title_width = title_bbox[2] - title_bbox[0]
            draw.text(((self.width - title_width) // 2, y_pos), lineup_title,
                     fill=(255, 255, 255), font=info_font)
            
            y_pos += 70
            for artist in lineup:
                artist_bbox = draw.textbbox((0, 0), artist, font=detail_font)
                artist_width = artist_bbox[2] - artist_bbox[0]
                draw.text(((self.width - artist_width) // 2, y_pos), artist,
                         fill=(200, 200, 200), font=detail_font)
                y_pos += 50
        
        # Bottom text (tickets, website, etc)
        if bottom_text:
            bottom_y = self.height - 120
            for text in bottom_text:
                text_bbox = draw.textbbox((0, 0), text, font=small_font)
                text_width = text_bbox[2] - text_bbox[0]
                draw.text(((self.width - text_width) // 2, bottom_y), text,
                         fill=(150, 150, 150), font=small_font)
                bottom_y += 40
        
        # Save flyer
        safe_name = party_name.replace(' ', '_').replace('/', '_')
        output_path = self.output_dir / f"{safe_name}_flyer_seed{seed}.png"
        flyer.save(output_path, 'PNG', quality=95)
        
        print(f"✅ Flyer saved: {output_path}")
        return flyer, output_path, seed
    
    def save_party_template(self, party_name, style, seed, config_data):
        """Save party config as reusable template"""
        template = {
            'party_name': party_name,
            'style': style,
            'seed': seed,
            'created': datetime.now().isoformat(),
            **config_data
        }
        
        safe_name = party_name.replace(' ', '_').replace('/', '_')
        template_path = self.templates_dir / f"{safe_name}_template.json"
        
        with open(template_path, 'w') as f:
            json.dump(template, f, indent=2)
        
        print(f"💾 Template saved: {template_path}")
        return template_path

def main():
    parser = argparse.ArgumentParser(
        description='🎉 PARTY FLYER GENERATOR - Custom flyers for every event',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Quick flyer
  python3 flyer_generator.py --party "NEXT LEVEL" --headline "NEXT LEVEL" --date "FRI DEC 20" --venue "CLUB ZERO"
  
  # Full featured flyer
  python3 flyer_generator.py --party "GENIUS PARTY" --headline "GENIUS" --date "SAT DEC 21" --venue "WAREHOUSE 89" --style holographic --lineup "DJ SHADOW" "MC FLOW" "PRODUCER X"
  
  # Generate variations
  python3 flyer_generator.py --party "VIBES" --headline "VIBES" --date "DEC 25" --venue "ROOFTOP" --batch 5
        """
    )
    
    parser.add_argument('--party', required=True, help='Party name')
    parser.add_argument('--headline', required=True, help='Main headline text for visual')
    parser.add_argument('--date', required=True, help='Event date')
    parser.add_argument('--venue', required=True, help='Venue name')
    parser.add_argument('--style', default='particle', choices=['particle', 'holographic', 'liquid'],
                       help='Visual style for headline')
    parser.add_argument('--seed', type=int, default=None, help='Random seed for reproducibility')
    parser.add_argument('--lineup', nargs='+', help='Artist lineup')
    parser.add_argument('--info', nargs='+', help='Additional info lines (tickets, website, etc)')
    parser.add_argument('--batch', type=int, default=1, help='Generate multiple variations')
    parser.add_argument('--save-template', action='store_true', help='Save as reusable template')
    
    args = parser.parse_args()
    
    print("🎉 PARTY FLYER GENERATOR 🎉")
    print(f"Party: {args.party}")
    print(f"Headline: {args.headline}")
    print(f"Style: {args.style}")
    print("=" * 50)
    
    generator = PartyFlyerGenerator()
    
    results = []
    for i in range(args.batch):
        print(f"\n[{i+1}/{args.batch}]")
        
        if args.seed is not None:
            seed = args.seed + i
        else:
            seed = random.randint(0, 999999)
        
        flyer, path, seed = generator.create_party_flyer(
            party_name=args.party,
            headline=args.headline,
            date=args.date,
            venue=args.venue,
            style=args.style,
            seed=seed,
            lineup=args.lineup,
            bottom_text=args.info
        )
        results.append((flyer, path, seed))
        
        # Save template on first iteration if requested
        if i == 0 and args.save_template:
            config = {
                'headline': args.headline,
                'date': args.date,
                'venue': args.venue,
                'lineup': args.lineup,
                'info': args.info
            }
            generator.save_party_template(args.party, args.style, seed, config)
    
    print("\n" + "=" * 50)
    print("🎉 FLYERS COMPLETE!")
    print(f"Generated {len(results)} flyer(s):")
    for _, path, seed in results:
        print(f"  • {path.name} (seed: {seed})")
    print("=" * 50)

if __name__ == '__main__':
    main()
