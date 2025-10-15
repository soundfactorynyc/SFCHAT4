# 🔥 WILD TEXT GENERATOR - COMPLETE SETUP & USAGE GUIDE

## 📍 LOCATION
```
/Users/jpwesite/Desktop/promo/wild_text_generator/
```

---

## 🎯 WHAT YOU HAVE

A complete AI-powered party flyer generation system that creates wild, professional promotional graphics in seconds.

### Features
- ✅ 3 unique visual styles (particle, holographic, liquid)
- ✅ Infinite variations via random seeds
- ✅ Reproducible outputs (save your favorites)
- ✅ Batch generation (10+ variations at once)
- ✅ Complete flyer layouts with party details
- ✅ Instagram Story dimensions (1080x1350)
- ✅ Command-line interface for speed

### Status: 100% PRODUCTION READY
- All code complete and tested
- 14+ example images generated
- All 3 styles working perfectly
- Ready to use immediately

---

## 🚀 SETUP INSTRUCTIONS (5 MINUTES)

### Step 1: Open Terminal
1. Press `Cmd + Space`
2. Type "Terminal"
3. Press Enter

### Step 2: Navigate to Your System
```bash
cd /Users/jpwesite/Desktop/promo/wild_text_generator
```

### Step 3: Run One-Command Setup
```bash
bash promoter_setup.sh
```

This automated script will:
- ✅ Install Python dependencies (numpy, Pillow)
- ✅ Create output directories
- ✅ Generate a test flyer
- ✅ Verify everything works

### Step 4: Verify Success
Check the `flyers/` folder - you should see a test flyer!

---

## 💥 GENERATE YOUR FIRST REAL FLYER (2 MINUTES)

### Basic Command Structure
```bash
python3 flyer_generator.py \
  --party "YOUR PARTY NAME" \
  --headline "MAIN TEXT" \
  --date "EVENT DATE" \
  --venue "VENUE NAME" \
  --style particle
```

### Real Example
```bash
python3 flyer_generator.py \
  --party "NEXT LEVEL" \
  --headline "NEXT LEVEL" \
  --date "FRI DEC 20 • 10PM" \
  --venue "CLUB ZERO" \
  --style particle
```

### Where To Find It
Your flyer saves to: `flyers/NEXT_LEVEL_particle_SEED.png`

---

## 🎨 THREE VISUAL STYLES

### 1. **PARTICLE** - Energy/Tech Vibe
```bash
--style particle
```
- Millions of holographic particles forming text
- Energy flows and light trails
- Best for: Electronic, Bass, Techno events

### 2. **HOLOGRAPHIC** - Cyber/Future Vibe
```bash
--style holographic
```
- RGB chromatic aberration
- Glitch effects and scan lines
- Best for: House, Future Bass, Experimental

### 3. **LIQUID** - Premium/Luxury Vibe
```bash
--style liquid
```
- Chrome/mercury liquid metal
- Dripping and flowing effects
- Best for: Upscale clubs, VIP events, Underground

---

## 🔥 COMPLETE COMMAND EXAMPLES

### Example 1: Quick Basic Flyer
```bash
python3 flyer_generator.py \
  --party "VIBES FRIDAY" \
  --headline "VIBES" \
  --date "FRI DEC 20" \
  --venue "THE SPOT"
```

### Example 2: Full-Featured Flyer with Lineup
```bash
python3 flyer_generator.py \
  --party "GENIUS NIGHTS" \
  --headline "GENIUS" \
  --date "SAT DEC 21 • 11PM" \
  --venue "WAREHOUSE 89" \
  --style holographic \
  --lineup "DJ SHADOW" "MC FLOW" "PRODUCER X" \
  --info "TICKETS: GENIUS.LINK" "21+ • $25 DOOR"
```

### Example 3: Generate 10 Variations```bash
python3 flyer_generator.py \
  --party "BASS DROP" \
  --headline "BASS DROP" \
  --date "DEC 25" \
  --venue "ROOFTOP" \
  --style liquid \
  --batch 10
```
This creates 10 different variations. Pick your favorite!

### Example 4: Lock In Your Favorite Seed
```bash
python3 flyer_generator.py \
  --party "BASS DROP" \
  --headline "BASS DROP" \
  --date "DEC 25" \
  --venue "ROOFTOP" \
  --style liquid \
  --seed 5432
```
Now you can regenerate this exact look anytime!

---

## 📋 ALL COMMAND OPTIONS

| Option | Required? | Description | Example |
|--------|-----------|-------------|---------|
| `--party` | YES | Party series name | "NEXT LEVEL" |
| `--headline` | YES | Main visual text | "NEXT LEVEL" |
| `--date` | YES | Event date/time | "FRI DEC 20 • 10PM" |
| `--venue` | YES | Venue name | "CLUB ZERO" |
| `--style` | No | Visual style | particle/holographic/liquid |
| `--seed` | No | Lock specific visual | 5432 |
| `--batch` | No | Generate variations | 10 |
| `--lineup` | No | Artist names | "DJ 1" "DJ 2" |
| `--info` | No | Bottom info lines | "LINK.COM" "21+" |
| `--width` | No | Custom width | 1080 |
| `--height` | No | Custom height | 1920 |

---

## 🎯 RECOMMENDED WORKFLOW

### Phase 1: DISCOVER YOUR LOOK (1 Hour)
1. Generate 20 variations across all styles
2. Show to your team
3. Pick top 3 favorites
4. Note the seed numbers

**Commands:**
```bash
# Generate 10 particle variations
python3 flyer_generator.py --party "TEST" --headline "TEST" --date "TBD" --venue "TBD" --style particle --batch 10

# Generate 10 holographic variations
python3 flyer_generator.py --party "TEST" --headline "TEST" --date "TBD" --venue "TBD" --style holographic --batch 10

# Generate 10 liquid variations
python3 flyer_generator.py --party "TEST" --headline "TEST" --date "TBD" --venue "TBD" --style liquid --batch 10
```

### Phase 2: LOCK IN YOUR BRAND (30 Minutes)
1. Choose winning style + seed
2. Generate all materials with that seed
3. Create consistent brand across platforms

**Command:**
```bash
python3 flyer_generator.py \
  --party "YOUR PARTY" \
  --headline "YOUR PARTY" \
  --date "DEC 20" \
  --venue "YOUR VENUE" \
  --style holographic \
  --seed 7891
```

### Phase 3: MULTI-PLATFORM EXPORT (30 Minutes)
```bash
# Instagram Story (1080x1920)
python3 flyer_generator.py --party "PARTY" --headline "PARTY" --date "DATE" --venue "VENUE" --seed 7891 --width 1080 --height 1920

# Instagram Post (1080x1080)
python3 flyer_generator.py --party "PARTY" --headline "PARTY" --date "DATE" --venue "VENUE" --seed 7891 --width 1080 --height 1080

# Twitter/Facebook (1920x1080)
python3 flyer_generator.py --party "PARTY" --headline "PARTY" --date "DATE" --venue "VENUE" --seed 7891 --width 1920 --height 1080
```

---

## 🎉 14-DAY PARTY PROMOTION TIMELINE

### Days 1-3: BRANDING
- [ ] Run setup script
- [ ] Generate 30+ variations (10 per style)
- [ ] Team picks winner
- [ ] Lock in seed number

### Days 4-7: CONTENT CREATION
- [ ] Generate flyers for all platforms
- [ ] Create story templates
- [ ] Generate teaser graphics
- [ ] Export high-res versions

### Days 8-11: PROMOTION PHASE 1
- [ ] Announce event (use locked seed)
- [ ] Daily stories
- [ ] Share lineup reveals
- [ ] Post venue details

### Days 12-13: PROMOTION PHASE 2
- [ ] "2 days away" posts
- [ ] Final lineup announcement
- [ ] Ticket links
- [ ] Last call posts

### Day 14: EVENT DAY 🎉
- [ ] "Tonight" story posts
- [ ] Live updates
- [ ] Photo recaps
- [ ] Thank you posts

---

## 💾 FILE STRUCTURE

```
/Users/jpwesite/Desktop/promo/wild_text_generator/
│
├── wild_generator.py         ← Core text visual engine
├── flyer_generator.py        ← Complete flyer system (USE THIS)
├── promoter_setup.sh         ← One-command setup (RUN FIRST)
├── requirements.txt          ← Python dependencies
├── README.md                 ← Technical documentation
├── PROMOTER_GUIDE.md         ← Complete user guide
├── PRODUCTION_STATUS.md      ← System overview
│
├── output/                   ← Raw text visuals (for testing)
├── flyers/                   ← YOUR COMPLETE FLYERS SAVE HERE ⭐
└── templates/                ← Saved party configurations
```

**All your flyers appear in: `flyers/` folder**

---

## 🔧 TROUBLESHOOTING

### Issue: "No module named PIL"
**Solution:**
```bash
pip3 install Pillow
```

### Issue: "No module named numpy"
**Solution:**
```bash
pip3 install numpy
```

### Issue: "Command not found: python3"
**Solution:**
```bash
python flyer_generator.py --party "TEST" --headline "TEST" --date "TBD" --venue "TBD"
```
(Try `python` instead of `python3`)

### Issue: Permission denied
**Solution:**
```bash
chmod +x promoter_setup.sh
bash promoter_setup.sh
```

### Issue: Can't find files
**Solution:** Make sure you're in the right directory:
```bash
cd /Users/jpwesite/Desktop/promo/wild_text_generator
pwd  # Should show the path above
ls   # Should show all the .py files
```

### Issue: Flyer looks different than expected
**Solution:** Use the `--seed` option to lock in specific visuals:
```bash
--seed 5432
```
Same seed = same visual every time!

---

## 💡 PRO TIPS

### Tip 1: Batch Generate, Then Choose
Don't create one at a time. Generate 10+ and pick the best:
```bash
--batch 10
```

### Tip 2: Lock Your Favorite
Once you find a look you love, note the seed number and reuse it:
```bash
--seed 5432
```

### Tip 3: Consistent Branding
Use the same seed for all materials for one party = cohesive brand

### Tip 4: Different Parties, Different Seeds
Each party can have its own unique visual identity
### Tip 5: Test Early
Run the setup and generate a test flyer TODAY. Don't wait until you need it.

### Tip 6: Save Your Commands
Keep a text file with your working commands for quick reuse:
```bash
# My go-to command for GENIUS NIGHTS
python3 flyer_generator.py --party "GENIUS NIGHTS" --headline "GENIUS" --date "SATURDAYS • 11PM" --venue "WAREHOUSE 89" --style holographic --seed 5432 --lineup "DJ SHADOW" "MC FLOW" --info "TICKETS: GENIUS.LINK" "21+ • $25"
```

---

## 🎨 STYLE SELECTION GUIDE

### Use PARTICLE when:
- Electronic, Bass, Dubstep, Drum & Bass events
- You want high energy, intense vibes
- Tech-focused crowd
- Festival/rave aesthetic

### Use HOLOGRAPHIC when:
- House, Future Bass, Experimental events
- You want cyber/futuristic vibes
- Trendy, fashion-forward crowd
- Modern club aesthetic

### Use LIQUID when:
- Upscale clubs, VIP events
- Deep House, Underground Techno
- You want premium, luxury vibes
- Sophisticated, mature crowd

### Still not sure?
Generate 10 of each style and let the visuals decide!

---

## 📱 SOCIAL MEDIA DIMENSIONS

### Instagram Story
```bash
--width 1080 --height 1920
```
**Best for:** Stories, Reels

### Instagram Post (Square)
```bash
--width 1080 --height 1080
```
**Best for:** Feed posts

### Instagram Post (Portrait)
```bash
--width 1080 --height 1350
```
**Best for:** Feed posts (DEFAULT)

### Twitter/Facebook (Landscape)
```bash
--width 1920 --height 1080
```
**Best for:** Twitter posts, Facebook cover

### TikTok
```bash
--width 1080 --height 1920
```
**Best for:** TikTok videos

---

## 🚀 QUICK START CHECKLIST

Complete this in order:

- [ ] Open Terminal
- [ ] Navigate to folder: `cd /Users/jpwesite/Desktop/promo/wild_text_generator`
- [ ] Run setup: `bash promoter_setup.sh`
- [ ] Check `flyers/` folder for test flyer
- [ ] Generate 10 variations: `--batch 10`
- [ ] Pick your favorite seed number
- [ ] Generate final flyer with that seed
- [ ] Export for all platforms
- [ ] Post and promote! 🎉

---

## 📚 ADDITIONAL RESOURCES

### In The wild_text_generator/ Folder:
- **PROMOTER_GUIDE.md** - Detailed how-to guide for promoters
- **README.md** - Technical documentation
- **PRODUCTION_STATUS.md** - Complete system overview

### Need Help?
All documentation is in your folder. Read the guides!

---

## 🔥 REAL WORLD EXAMPLES

### Weekly Party Series
```bash
# Week 1
python3 flyer_generator.py --party "FRIDAY VIBES" --headline "VIBES" --date "FRI DEC 20" --venue "CLUB ZERO" --seed 1234

# Week 2 (SAME SEED = consistent branding)
python3 flyer_generator.py --party "FRIDAY VIBES" --headline "VIBES" --date "FRI DEC 27" --venue "CLUB ZERO" --seed 1234

# Week 3
python3 flyer_generator.py --party "FRIDAY VIBES" --headline "VIBES" --date "FRI JAN 3" --venue "CLUB ZERO" --seed 1234
```

### Special Event (Different Seed)
```bash
python3 flyer_generator.py --party "NEW YEARS EVE" --headline "2026" --date "TUE DEC 31 • 9PM" --venue "CLUB ZERO" --style holographic --seed 9999 --lineup "HEADLINER" "OPENER" --info "TICKETS: $100" "LIMITED CAPACITY"
```

### Multiple Events Same Night
```bash
# Main Room
python3 flyer_generator.py --party "DUAL ROOMS" --headline "MAIN ROOM" --date "SAT DEC 21" --venue "WAREHOUSE" --seed 5555

# Side Room  
python3 flyer_generator.py --party "DUAL ROOMS" --headline "SIDE ROOM" --date "SAT DEC 21" --venue "WAREHOUSE" --seed 6666
```

---

## 💡 KEY CONCEPTS

### Seeds Control Visuals
- **Same seed** = exact same visual
- **Different seed** = different visual
- **No seed specified** = random (changes every time)

### Styles Define Aesthetic
- **particle** = energy/tech
- **holographic** = cyber/future
- **liquid** = premium/luxury

### Batch Mode = Exploration
```bash
--batch 10
```
Generates 10 variations. Pick the best!

### Locked Seeds = Consistency
```bash
--seed 5432
```
Use the same seed for consistent branding across all your materials.

---

## ⚡ SPEED TIPS

### For Quick Testing
```bash
# Minimal command
python3 flyer_generator.py --party "TEST" --headline "TEST" --date "TBD" --venue "TBD"
```

### For Final Production
```bash
# Full command with all details
python3 flyer_generator.py \
  --party "PARTY NAME" \
  --headline "MAIN TEXT" \
  --date "FULL DATE INFO" \
  --venue "VENUE NAME" \
  --style STYLE_NAME \
  --seed SEED_NUMBER \
  --lineup "ARTIST 1" "ARTIST 2" "ARTIST 3" \
  --info "TICKETS: LINK" "AGE RESTRICTION" "PRICE"
```

### For Bulk Export
Create a script file `generate_all.sh`:
```bash
#!/bin/bash
SEED=5432

# Story version
python3 flyer_generator.py --party "PARTY" --headline "PARTY" --date "DATE" --venue "VENUE" --seed $SEED --width 1080 --height 1920

# Post version
python3 flyer_generator.py --party "PARTY" --headline "PARTY" --date "DATE" --venue "VENUE" --seed $SEED --width 1080 --height 1080

# Banner version
python3 flyer_generator.py --party "PARTY" --headline "PARTY" --date "DATE" --venue "VENUE" --seed $SEED --width 1920 --height 1080
```

Then run:
```bash
bash generate_all.sh
```

---

## 📊 SUCCESS METRICS

After setup, you should be able to:
- ✅ Generate a flyer in under 30 seconds
- ✅ Create 10 variations in under 2 minutes
- ✅ Export for all platforms in under 5 minutes
- ✅ Maintain consistent branding across all materials
- ✅ Reproduce exact visuals anytime via seeds

---

## 🎯 PRODUCTION READY STATUS

✅ **Code:** 100% complete and tested
✅ **Features:** All working perfectly  
✅ **Documentation:** Complete guides
✅ **Setup:** One-command installation
✅ **Examples:** 14+ generated and validated
✅ **Styles:** All 3 tested and production-ready

**SYSTEM STATUS: READY TO DEPLOY**

---

## 🚀 YOUR FIRST 5 MINUTES

1. **Open Terminal** (Cmd + Space, type "Terminal")
2. **Navigate:** `cd /Users/jpwesite/Desktop/promo/wild_text_generator`
3. **Setup:** `bash promoter_setup.sh`
4. **Test:** Check `flyers/` folder for your test flyer
5. **Generate:** Run your first real command with your party info

**That's it. You're live.** 🔥

---

## 📞 NEED HELP?

1. Read `PROMOTER_GUIDE.md` in the wild_text_generator folder
2. Check `README.md` for technical details
3. Review `PRODUCTION_STATUS.md` for system overview
4. All files are in: `/Users/jpwesite/Desktop/promo/wild_text_generator/`

---

## 🎉 FINAL WORDS

**You have a professional-grade party flyer generator.**

- No design skills needed
- No expensive software needed
- Infinite unique variations
- Reproducible results
- Command-line speed
- Production-quality output

**Just run the setup and start generating.** 

Your next party flyer is 30 seconds away. 🚀🔥

---

**Document Created:** October 15, 2025
**System Version:** 1.0 Production
**Status:** READY TO USE