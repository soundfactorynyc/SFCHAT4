# 🔥 WILD TEXT GENERATOR 🔥

Generate jaw-dropping, hypnotic text visuals for social media in seconds.

## 🚀 QUICK START

### 1. Install Dependencies
```bash
pip3 install -r requirements.txt
```

### 2. Generate Your First Visual
```bash
python3 wild_generator.py --text "NEXT LEVEL" --style particle
```

**BOOM.** Check the `output/` folder.

---

## 🎨 STYLES

### **particle** - Energy Field Particles
Millions of particles forming your text with holographic energy flows.

### **holographic** - Glitch & Holographic
RGB chromatic aberration with holographic color shifts and scan lines.

### **liquid** - Liquid Metal
Chrome/mercury aesthetic with dripping effects and metallic reflections.

---

## 💥 USAGE EXAMPLES

### Generate Single Image
```bash
python3 wild_generator.py --text "GENIUS" --style holographic
```

### Generate with Specific Seed (Reproducible)
```bash
python3 wild_generator.py --text "SINCE 1989" --style liquid --seed 42
```

### Generate 10 Variations at Once
```bash
python3 wild_generator.py --text "TICKETS" --style particle --batch 10
```

### Custom Dimensions
```bash
python3 wild_generator.py --text "WILD" --style holographic --width 1920 --height 1080
```

---

## 🎯 WORKFLOW FOR PARTY (14 DAYS)

### Week 1: Generate & Select
```bash
# Generate a bunch of variations
python3 wild_generator.py --text "NEXT LEVEL" --style particle --batch 20
python3 wild_generator.py --text "SINCE 1989" --style holographic --batch 20
python3 wild_generator.py --text "GENIUS" --style liquid --batch 20
```

Browse the `output/` folder, pick your favorites.

### Week 2: Refine Winners
Once you find a seed you love:
```bash
# Regenerate at higher quality or different sizes
python3 wild_generator.py --text "WINNER TEXT" --style particle --seed 12345
```

---

## 🔧 COMMAND LINE OPTIONS

| Option | Description | Default |
|--------|-------------|---------|
| `--text` | Text to render (required) | - |
| `--style` | Visual style (particle/holographic/liquid) | particle |
| `--seed` | Random seed for reproducibility | random |
| `--batch` | Generate multiple variations | 1 |
| `--width` | Output width in pixels | 1080 |
| `--height` | Output height in pixels | 1080 |

---

## 📸 OUTPUT

All images saved to `output/` folder with naming format:
```
TEXT_style_seedNUMBER.png
```

Example:
```
NEXT_LEVEL_particle_seed42.png
GENIUS_holographic_seed777.png
SINCE_1989_liquid_seed12345.png
```

---

## 🎨 TIPS FOR BEST RESULTS

### Text Length
- **Short text (1-2 words)**: Bigger, more impact
- **Longer text**: Still works but reduce font size

### Style Selection
- **particle**: Best for energy/tech vibes
- **holographic**: Best for futuristic/cyber vibes
- **liquid**: Best for premium/luxury vibes

### Finding Winners
- Generate 10-20 variations per message
- Seeds are random, some will be 🔥, some will be meh
- When you find one you love, note the seed number
- Regenerate with that seed for consistency

---

## 🚨 TROUBLESHOOTING

### "No module named 'PIL'"
```bash
pip3 install Pillow
```

### "No module named 'numpy'"
```bash
pip3 install numpy
```

### Font issues?
Script uses system fonts. On Mac, should work out of the box.

---

## 🎯 PARTY CHECKLIST

- [ ] Install dependencies
- [ ] Generate 50+ variations (Week 1)
- [ ] Select 10-15 winners
- [ ] Regenerate winners at final quality
- [ ] Export for Instagram (1080x1080)
- [ ] Export for TikTok (1080x1920 - use --height 1920)
- [ ] Schedule posts
- [ ] 🎉 PARTY TIME

---

## 🔮 WHAT MAKES THIS WILD

✅ **Procedural generation** - infinite variations
✅ **Melted text aesthetic** - matches your SI logo vibe
✅ **Cutting-edge effects** - particles, holograms, liquid metal
✅ **High quality** - 1080x1080 ready for social
✅ **Fast iteration** - generate in seconds, not hours
✅ **Reproducible** - save seeds for your favorites

---

## 🚀 ADVANCED

### Generate Video Frames
Want animation? Generate frames with different seeds:
```bash
for i in {1..30}; do
  python3 wild_generator.py --text "ANIMATED" --style particle --seed $i
done
```

Then compile with ffmpeg:
```bash
ffmpeg -framerate 30 -pattern_type glob -i 'output/ANIMATED_particle_seed*.png' -c:v libx264 output_video.mp4
```

---

**NOW GO MAKE SOME WILD SHIT. 🔥**

Party in 14 days. Let's gooooo.
