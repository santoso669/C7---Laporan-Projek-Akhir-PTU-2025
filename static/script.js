const textToSpeak = document.getElementById("textToSpeak");
const speakButton = document.getElementById("speakButton");
const stopSpeakingButton = document.getElementById("stopSpeakingButton");
const saveAudioButton = document.getElementById("saveAudioButton");
const rate = document.getElementById("rate");
const rateValue = document.getElementById("rateValue");
const statusMessage = document.getElementById("statusMessage");
const charCount = document.querySelector(".char-count");

let speechSynthesisUtterance = null;

function updateCharCount() {
  const count = textToSpeak.value.length;
  charCount.textContent = `${count}/5000 karakter`;
  charCount.style.color = count > 5000 ? "#f72585" : "#6c757d";
}

function speakText() {
  const text = textToSpeak.value.trim();
  if (!text)
    return updateStatus("Silakan masukkan teks terlebih dahulu.", "error");

  if (speechSynthesis.speaking) speechSynthesis.cancel();

  speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
  speechSynthesisUtterance.lang = "id-ID";
  speechSynthesisUtterance.rate = parseFloat(rate.value);

  speechSynthesisUtterance.onstart = () => {
    updateStatus("Sedang membacakan teks...", "info");
    toggleButtons(true);
  };

  speechSynthesisUtterance.onend = () => {
    updateStatus("Pembacaan selesai.", "success");
    toggleButtons(false);
  };

  speechSynthesisUtterance.onerror = (e) => {
    updateStatus("Terjadi kesalahan saat membacakan teks.", "error");
    toggleButtons(false);
  };

  speechSynthesis.speak(speechSynthesisUtterance);
}

function stopSpeaking() {
  speechSynthesis.cancel();
  updateStatus("Pembacaan dihentikan.", "warning");
  toggleButtons(false);
}

function toggleButtons(speaking) {
  speakButton.disabled = speaking;
  stopSpeakingButton.disabled = !speaking;
  saveAudioButton.disabled = speaking;
}

function updateStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";
  switch (type) {
    case "success":
      statusMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
      statusMessage.style.color = "#2ecc71";
      break;
    case "error":
      statusMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      statusMessage.style.color = "#f72585";
      break;
    case "warning":
      statusMessage.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
      statusMessage.style.color = "#ff9f1c";
      break;
    default:
      statusMessage.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
      statusMessage.style.color = "#4361ee";
  }
}

async function saveAudio() {
  const text = textToSpeak.value.trim();
  if (!text)
    return updateStatus("Silakan masukkan teks terlebih dahulu.", "error");

  updateStatus("Menghasilkan file MP3...", "info");

  try {
    const res = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        lang: "id",
        speed: parseFloat(rate.value) < 1 ? "slow" : "normal",
      }),
    });

    if (!res.ok) throw new Error("Server gagal memproses permintaan");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voicegen_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    updateStatus("Berhasil menyimpan audio MP3.", "success");
  } catch (err) {
    console.error(err);
    updateStatus("Gagal menyimpan audio: " + err.message, "error");
  }
}

textToSpeak.addEventListener("input", updateCharCount);
speakButton.addEventListener("click", speakText);
stopSpeakingButton.addEventListener("click", stopSpeaking);
saveAudioButton.addEventListener("click", saveAudio);
window.addEventListener("load", () =>
  updateStatus("Aplikasi siap digunakan.", "info")
);
