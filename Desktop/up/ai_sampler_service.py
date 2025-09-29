"""
Sound Factory AI Audio Sampler Service
Modal endpoint for AI audio processing
"""

import modal
import numpy as np
import librosa
import soundfile as sf
import io
from typing import Dict, Any
import json

# Create Modal app
app = modal.App("sf-ai-audio-sampler")

# Define the image with required dependencies
image = modal.Image.debian_slim().pip_install([
    "librosa",
    "soundfile", 
    "numpy",
    "scipy",
    "scikit-learn"
])

@app.function(
    image=image,
    timeout=300,
    allow_concurrent_inputs=10
)
@modal.web_endpoint(method="POST")
def process_audio(audio_data: bytes, bars: int = 4) -> Dict[str, Any]:
    """
    Process audio with AI for loop creation and beat matching
    
    Args:
        audio_data: Raw audio bytes
        bars: Number of bars for loop (1, 2, 4, or 8)
    
    Returns:
        Dict containing processed audio data and metadata
    """
    try:
        # Load audio from bytes
        audio_io = io.BytesIO(audio_data)
        y, sr = librosa.load(audio_io, sr=48000)
        
        # Basic audio analysis
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        key = estimate_key(y, sr)
        
        # Create loop based on bars
        loop_length = int(bars * (60 / tempo) * sr * 4)  # 4/4 time
        if len(y) > loop_length:
            y_loop = y[:loop_length]
        else:
            # Pad with silence if too short
            y_loop = np.pad(y, (0, loop_length - len(y)), mode='constant')
        
        # AI processing: Beat matching and tempo adjustment
        y_processed = match_tempo(y_loop, sr, target_tempo=120)
        
        # Generate harmonic content
        y_harmonic = add_harmonic_content(y_processed, sr)
        
        # Apply AI effects
        y_effects = apply_ai_effects(y_harmonic, sr)
        
        # Convert back to bytes
        output_io = io.BytesIO()
        sf.write(output_io, y_effects, sr, format='WAV')
        processed_audio = output_io.getvalue()
        
        return {
            "success": True,
            "processed_audio": processed_audio,
            "metadata": {
                "original_tempo": float(tempo),
                "detected_key": key,
                "bars": bars,
                "duration": len(y_effects) / sr,
                "sample_rate": sr
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def estimate_key(y: np.ndarray, sr: int) -> str:
    """Estimate musical key using chroma features"""
    try:
        # Extract chroma features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = np.mean(chroma, axis=1)
        
        # Key profiles (simplified)
        major_profile = np.array([1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1])  # C major
        minor_profile = np.array([1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0])  # A minor
        
        # Calculate correlation with major and minor profiles
        major_corr = np.corrcoef(chroma_mean, major_profile)[0, 1]
        minor_corr = np.corrcoef(chroma_mean, minor_profile)[0, 1]
        
        if major_corr > minor_corr:
            return "C MAJ"
        else:
            return "A MIN"
            
    except:
        return "C MAJ"  # Default fallback

def match_tempo(y: np.ndarray, sr: int, target_tempo: float = 120) -> np.ndarray:
    """Match audio tempo to target BPM"""
    try:
        # Calculate current tempo
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # Calculate stretch factor
        stretch_factor = target_tempo / tempo
        
        # Apply time stretching
        y_stretched = librosa.effects.time_stretch(y, rate=stretch_factor)
        
        return y_stretched
        
    except:
        return y  # Return original if stretching fails

def add_harmonic_content(y: np.ndarray, sr: int) -> np.ndarray:
    """Add AI-generated harmonic content"""
    try:
        # Extract harmonic and percussive components
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        
        # Generate additional harmonic layers
        y_harmonic_octave = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=12)  # Octave up
        y_harmonic_fifth = librosa.effects.pitch_shift(y_harmonic, sr=sr, n_steps=7)   # Perfect fifth
        
        # Mix harmonic layers
        y_enhanced = y_harmonic + 0.3 * y_harmonic_octave + 0.2 * y_harmonic_fifth + 0.5 * y_percussive
        
        return y_enhanced
        
    except:
        return y  # Return original if harmonic processing fails

def apply_ai_effects(y: np.ndarray, sr: int) -> np.ndarray:
    """Apply AI-generated effects"""
    try:
        # Subtle reverb using convolution
        reverb_ir = generate_reverb_impulse(sr)
        y_reverb = np.convolve(y, reverb_ir, mode='same')
        
        # Mix dry and wet signals
        y_processed = 0.7 * y + 0.3 * y_reverb
        
        # Apply subtle compression
        y_compressed = apply_compression(y_processed)
        
        return y_compressed
        
    except:
        return y  # Return original if effects fail

def generate_reverb_impulse(sr: int, length: float = 2.0) -> np.ndarray:
    """Generate a simple reverb impulse response"""
    n_samples = int(sr * length)
    t = np.linspace(0, length, n_samples)
    
    # Simple exponential decay
    impulse = np.exp(-t * 3) * np.random.randn(n_samples) * 0.1
    
    return impulse

def apply_compression(y: np.ndarray, threshold: float = 0.5, ratio: float = 4.0) -> np.ndarray:
    """Apply simple compression"""
    try:
        # Simple compression algorithm
        y_abs = np.abs(y)
        y_compressed = np.where(
            y_abs > threshold,
            threshold + (y_abs - threshold) / ratio,
            y_abs
        )
        
        # Preserve original sign
        y_compressed = y_compressed * np.sign(y)
        
        return y_compressed
        
    except:
        return y

@app.function(
    image=image,
    timeout=60
)
@modal.web_endpoint(method="GET")
def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy", "service": "sf-ai-audio-sampler"}

# CORS headers for web integration
@app.function(
    image=image,
    timeout=60
)
@modal.web_endpoint(method="OPTIONS")
def handle_cors():
    """Handle CORS preflight requests"""
    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    }

if __name__ == "__main__":
    # For local testing
    print("AI Audio Sampler Service ready for deployment to Modal")
    print("Deploy with: modal deploy ai_sampler_service.py")