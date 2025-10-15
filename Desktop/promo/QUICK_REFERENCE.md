# 🔥 WILD TEXT GENERATOR - QUICK REFERENCE CARD

## 📍 SYSTEM LOCATION
```
/Users/jpwesite/Desktop/promo/wild_text_generator/
```

---

## ⚡ QUICK START (COPY & PASTE)

### 1. Setup (ONE TIME ONLY)
```bash
cd /Users/jpwesite/Desktop/promo/wild_text_generator
bash promoter_setup.sh
```

### 2. Generate Your First Flyer
```bash
python3 flyer_generator.py \
  --party "YOUR PARTY" \
  --headline "YOUR TEXT" \
  --date "YOUR DATE" \
  --venue "YOUR VENUE"
```

### 3. Check Output
```bash
open flyers/
```

---

## 🎨 THREE STYLES

```bash
--style particle      # Energy/Tech (Electronic/Bass/Techno)
--style holographic   # Cyber/Future (House/Experimental)
--style liquid        # Premium/Luxury (Upscale/Underground)
```

---

## 💥 COMMON COMMANDS

### Basic Flyer
```bash
python3 flyer_generator.py --party "VIBES" --headline "VIBES" --date "FRI DEC 20" --venue "CLUB"
```

### With Style
```bash
python3 flyer_generator.py --party "VIBES" --headline "VIBES" --date "FRI DEC 20" --venue "CLUB" --style holographic
```

### Generate 10 Variations
```bash
python3 flyer_generator.py --party "VIBES" --headline "VIBES" --date "FRI DEC 20" --venue "CLUB" --batch 10
```

### Lock Favorite Seed
```bash
python3 flyer_generator.py --party "VIBES" --headline "VIBES" --date "FRI DEC 20" --venue "CLUB" --seed 5432
```

### With Lineup
```bash
python3 flyer_generator.py --party "VIBES" --headline "VIBES" --date "FRI DEC 20" --venue "CLUB" --lineup "DJ 1" "DJ 2" "DJ 3"
```

### Full Command
```bash
python3 flyer_generator.py \
  --party "GENIUS NIGHTS" \
  --headline "GENIUS" \
  --date "SAT DEC 21 • 11PM" \
  --venue "WAREHOUSE 89" \
  --style holographic \
  --seed 5432 \
  --lineup "DJ SHADOW" "MC FLOW" "PRODUCER X" \
  --info "TICKETS: GENIUS.LINK" "21+ • $25"
```

---

## 📱 PLATFORM DIMENSIONS

```bash
# Instagram Story
--width 1080 --height 1920

# Instagram Post
--width 1080 --height 1080

# Instagram Default
--width 1080 --height 1350

# Twitter/Facebook
--width 1920 --height 1080
```

---

## 🔧 TROUBLESHOOTING

### Missing Module?
```bash
pip3 install Pillow numpy
```

### Can't Find Files?
```bash
cd /Users/jpwesite/Desktop/promo/wild_text_generator
ls
```

### Permission Error?
```bash
chmod +x promoter_setup.sh
```

---

## 💡 PRO WORKFLOW

1. **Generate variations:** `--batch 10`
2. **Pick favorite:** Note the seed number
3. **Lock it in:** `--seed 5432`
4. **Use for everything:** Same seed = consistent brand

---

## 📋 COMMAND OPTIONS

| Option | Example |
|--------|---------|
| `--party` | "NEXT LEVEL" |
| `--headline` | "NEXT LEVEL" |
| `--date` | "FRI DEC 20 • 10PM" |
| `--venue` | "CLUB ZERO" |
| `--style` | particle/holographic/liquid |
| `--seed` | 5432 |
| `--batch` | 10 |
| `--lineup` | "DJ 1" "DJ 2" |
| `--info` | "LINK" "AGE" |
| `--width` | 1080 |
| `--height` | 1920 |

---

## 📚 FULL DOCUMENTATION

- **FULL_SETUP_GUIDE.md** - Complete setup instructions
- **PROMOTER_GUIDE.md** - Detailed user guide
- **README.md** - Technical docs
- **CONTINUATION_PROMPT.md** - For continuing in new chat

All in: `/Users/jpwesite/Desktop/promo/wild_text_generator/`

---

## ✅ STATUS: READY TO USE

🔥 **System is 100% production ready.**
🔥 **Just run setup and start generating.**
🔥 **Your flyers are 30 seconds away.**

---

**Print this page and keep it handy!** 📄