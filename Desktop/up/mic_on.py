import os, sys, time, queue, threading
import sounddevice as sd
import numpy as np
import tkinter as tk

# Certs hint (harmless if not needed)
try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
except Exception:
    pass

# Whisper (make sure you installed: pip3 install --upgrade openai-whisper sounddevice numpy)
import whisper

MODEL_NAME = os.environ.get("WHISPER_MODEL", "tiny")  # tiny is fast; change to "base" if you prefer
SAMPLE_RATE = 16000
BLOCKSIZE = 4096
CHANNELS = 1

model = whisper.load_model(MODEL_NAME)
audio_q = queue.Queue(maxsize=50)
stop_flag = threading.Event()

# --- Audio capture thread ---
def audio_loop():
    while not stop_flag.is_set():
        try:
            with sd.RawInputStream(
                samplerate=SAMPLE_RATE,
                channels=CHANNELS,
                dtype='int16',
                blocksize=BLOCKSIZE,
                callback=lambda indata, frames, time_info, status: (
                    status and print(f"[Audio] {status}", file=sys.stderr),
                    audio_q.put(bytes(indata))
                )[1],
            ):
                while not stop_flag.is_set():
                    time.sleep(0.05)
        except Exception as e:
            print(f"[Stream error] {e}. Reopening…", file=sys.stderr)
            time.sleep(1)

# --- Transcription thread ---
def transcribe_loop(push_text):
    buf = bytearray()
    chunk_ms = 2500
    bytes_per_ms = SAMPLE_RATE * 2 // 1000  # int16 mono

    while not stop_flag.is_set():
        try:
            data = audio_q.get(timeout=0.5)
            buf.extend(data)
            if len(buf) >= bytes_per_ms * chunk_ms:
                pcm16 = np.frombuffer(buf, dtype=np.int16).astype(np.float32) / 32768.0
                result = model.transcribe(pcm16, fp16=False, language="en")
                text = (result.get("text") or "").strip()
                if text:
                    push_text(text)
                buf.clear()
        except queue.Empty:
            pass
        except Exception as e:
            print(f"[Transcribe error] {e}", file=sys.stderr)

# --- UI (always on top) ---
root = tk.Tk()
root.title("🎤 Live Transcript")
root.attributes("-topmost", True)  # keep above other apps
root.geometry("520x220+40+40")
root.configure(bg="black")

txt = tk.Text(root, wrap="word", bg="black", fg="white", insertbackground="white")
txt.pack(fill="both", expand=True)
txt.insert("end", "Mic live… speak (Ctrl+C in terminal to stop)\n")

def push_text_ui(s):
    def _append():
        txt.insert("end", "You: " + s + "\n")
        txt.see("end")
    root.after(0, _append)

t_audio = threading.Thread(target=audio_loop, daemon=True)
t_trans = threading.Thread(target=transcribe_loop, args=(push_text_ui,), daemon=True)
t_audio.start()
t_trans.start()

try:
    root.mainloop()
finally:
    stop_flag.set()
    time.sleep(0.5)