from flask import Flask, request, send_file, render_template
from flask_cors import CORS
from gtts import gTTS
import tempfile

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    text = data.get('text', '')
    lang = data.get('lang', 'id')
    speed = data.get('speed', 'normal')

    if not text.strip():
        return {"error": "Teks kosong"}, 400

    tts = gTTS(text=text, lang=lang, slow=(speed == 'slow'))
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
    tts.save(temp_file.name)
    return send_file(temp_file.name, as_attachment=True, download_name="voicegen.mp3")

if __name__ == '__main__':
    app.run(debug=True)
