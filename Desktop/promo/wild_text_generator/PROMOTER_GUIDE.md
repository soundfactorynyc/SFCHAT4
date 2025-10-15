# 🎉 PARTY FLYER SYSTEM - PROMOTER GUIDE

## 🚀 THE SYSTEM

Every party gets **unique branding** with the **same wild aesthetic**.

You control:
- ✅ Party name & headline
- ✅ Visual style (particle/holo/liquid)
- ✅ Date, venue, lineup
- ✅ Generate infinite variations
- ✅ Lock in your favorite look

---

## 🎯 QUICK START

### 1. Setup (One Time)
```bash
bash promoter_setup.sh
```

### 2. Generate Your First Flyer
```bash
python3 flyer_generator.py \
  --party "YOUR PARTY NAME" \
  --headline "BIG TEXT" \
  --date "FRI DEC 20 • 10PM" \
  --venue "YOUR VENUE" \
  --style particle
```

Check `flyers/` folder. DONE.

---

## 🎨 VISUAL STYLES

Pick the vibe that matches your party:

### **particle** - Energy/Tech Vibe
Millions of particles + holographic energy flows
Best for: Electronic, Bass, Techno events

### **holographic** - Cyber/Future Vibe  
RGB glitch effects + chromatic aberration
Best for: House, Future Bass, Experimental events

### **liquid** - Premium/Luxury Vibe
Chrome/mercury liquid metal aesthetic
Best for: Upscale clubs, VIP events, Underground events

---

## 💥 REAL EXAMPLES

### Example 1: Basic Flyer
```bash
python3 flyer_generator.py \
  --party "NEXT LEVEL" \
  --headline "NEXT LEVEL" \
  --date "FRI DEC 20" \
  --venue "CLUB ZERO"
```

### Example 2: Full Featured Flyer
```bash
python3 flyer_generator.py \
  --party "GENIUS PARTY" \
  --headline "GENIUS" \
  --date "SAT DEC 21 • 11PM" \
  --venue "WAREHOUSE 89" \
  --style holographic \
  --lineup "DJ SHADOW" "MC FLOW" "PRODUCER X" \
  --info "TICKETS: LINK.COM/GENIUS" "21+ • $25 DOOR"
```

### Example 3: Generate 10 Variations (Pick Best One)
```bash
python3 flyer_generator.py \
  --party "VIBES" \
  --headline "VIBES" \
  --date "DEC 25" \
  --venue "ROOFTOP" \
  --style liquid \
  --batch 10
```

Browse the 10 variations, find your favorite seed number.

### Example 4: Lock In Your Favorite
```bash
# Found seed 5432 is perfect? Lock it in:
python3 flyer_generator.py \
  --party "VIBES" \
  --headline "VIBES" \
  --date "DEC 25" \
  --venue "ROOFTOP" \
  --style liquid \
  --seed 5432
```

Now you can regenerate that EXACT look anytime.

---

## 🎯 WORKFLOW: PARTY IN 14 DAYS

### Week 1 (Days 1-7)
**Goal: Find your signature look**

1. Generate 10 variations with different styles
2. Pick your top 3 favorites
3. Note the seed numbers
4. Show to your team/promoters

### Week 2 (Days 8-13)  
**Goal: Create all promotional materials**

1. Use winning seed to generate flyers
2. Adjust text for different platforms
3. Create variations for stories, posts, etc.

### Day 14
🎉 **PARTY TIME**

---

## 📐 DIMENSIONS

Default: **1080 x 1350** (Instagram Story)

For other formats:
```bash
# Square (Instagram Post)
--width 1080 --height 1080

# Vertical (TikTok)
--width 1080 --height 1920

# Horizontal (Twitter/Facebook)
--width 1920 --height 1080
```

---

## 🔄 UPDATING A FLYER

Party details changed? Just regenerate with same seed:

```bash
# Original flyer
python3 flyer_generator.py --party "NEXT LEVEL" --headline "NEXT LEVEL" \
  --date "DEC 20" --venue "CLUB A" --seed 42

# Update venue but keep same visual
python3 flyer_generator.py --party "NEXT LEVEL" --headline "NEXT LEVEL" \
  --date "DEC 20" --venue "CLUB B" --seed 42
```

Same wild visual, updated info.

---

## 💡 PRO TIPS

### 1. Headline = Big Visual Impact
Keep it short (1-3 words) for maximum impact:
- ✅ "NEXT LEVEL"
- ✅ "WILD"  
- ✅ "GENIUS"
- ❌ "COME TO OUR AMAZING PARTY TONIGHT"

### 2. Generate Variations First
Always generate 5-10 variations before committing:
```bash
--batch 10
```

### 3. Match Style to Music Genre
- Electronic/Bass → particle
- House/Future → holographic
- Upscale/Underground → liquid

### 4. Save Your Templates
Found a perfect setup? Save it:
```bash
--save-template
```

Now it's in `templates/` for reuse.

### 5. Consistent Branding Across Events
Same party series? Use same seed + style:
```bash
# February event
--seed 1989 --style particle

# March event  
--seed 1989 --style particle

# April event
--seed 1989 --style particle
```

Same visual brand, different dates/info.

---

## 🚨 TROUBLESHOOTING

### "Command not found"
Make sure you ran:
```bash
bash promoter_setup.sh
```

### Fonts look weird
System uses Mac fonts by default. Works out of box on Mac.

### Want different fonts?
Edit `flyer_generator.py` lines 55-59 to use your font paths.

---

## 🎯 PARTY CHECKLIST

- [ ] Run setup script
- [ ] Generate 10 test variations
- [ ] Pick favorite seed
- [ ] Create main flyer
- [ ] Create story version (1080x1920)
- [ ] Create post version (1080x1080)
- [ ] Export all formats
- [ ] 🎉 PROMOTE & PARTY

---

## 🔥 EXAMPLES OF REAL COMMAND

```bash
# Minimal
python3 flyer_generator.py --party "FIRE" --headline "FIRE" --date "DEC 30" --venue "WAREHOUSE"

# Standard  
python3 flyer_generator.py --party "NEXT LEVEL" --headline "NEXT LEVEL" \
  --date "FRI DEC 20 • 10PM" --venue "CLUB ZERO" --style particle

# Full Featured
python3 flyer_generator.py --party "GENIUS NIGHTS" --headline "GENIUS" \
  --date "SAT DEC 21 • 11PM-4AM" --venue "WAREHOUSE 89" \
  --style holographic --seed 777 \
  --lineup "DJ SHADOW" "MC FLOW" "VISUAL ARTIST X" "SPECIAL GUEST" \
  --info "PRESALE: LINK.COM/GENIUS" "21+ • $20 EARLY / $30 DOOR" "SINCE 1989"
```

---

**NOW GO PROMOTE SOME WILD PARTIES. 🔥**
