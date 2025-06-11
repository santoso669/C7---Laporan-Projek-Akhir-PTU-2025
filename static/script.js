document.addEventListener("DOMContentLoaded", function () {
  const generateBtn = document.getElementById("generateBtn");
  const textInput = document.getElementById("text");
  const voiceSelect = document.getElementById("voice");
  const statusText = document.getElementById("status");

  generateBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    const voice = voiceSelect.value;

    if (!text) {
      alert("Teks tidak boleh kosong.");
      return;
    }

    fetch('/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text, voice_id: voice })
    })
      .then(response => {
        if (!response.ok) throw new Error("Gagal menghasilkan suara");
        return response.blob();
      })
      .then(blob => {
        const audioUrl = URL.createObjectURL(blob);

        // Atur pemutaran
        const audio = new Audio(audioUrl);
        const speed = parseFloat(document.getElementById('speed').value);
        audio.playbackRate = speed;
        audio.play();

        // Tampilkan status
        statusText.innerText = `Sedang diputar (kecepatan ${speed}x)...`;

        // Tampilkan tombol download
        const downloadLink = document.getElementById("downloadLink");
        downloadLink.href = audioUrl;
        downloadLink.style.display = 'inline';

        audio.onended = () => {
          statusText.innerText = 'Selesai diputar.';
        };
      })

    .catch (error => {
      alert("Gagal menghasilkan suara. Pastikan teks diisi.");
      console.error(error);
    });
});
});

