from flask import Flask, request, send_file, render_template
from flask_cors import CORS
import boto3
import tempfile
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load .env
load_dotenv()
    
# Ambil credential dari environment
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Debug (jika perlu)
print("ID:", repr(AWS_ACCESS_KEY_ID))
print("KEY:", repr(AWS_SECRET_ACCESS_KEY))

# Buat client Polly
polly_client = boto3.client(
    "polly",
    region_name="ap-southeast-1",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    text = data.get('text', '')
    voice_id = data.get('voice_id', 'Ida')

    if not text.strip():
        return {"error": "Teks kosong"}, 400

    try:
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,  
            Engine='neural'  
        )

        if "AudioStream" in response:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response['AudioStream'].read())
                temp_file.flush()
                return send_file(temp_file.name, as_attachment=True, download_name="voicegen.mp3")

        return {"error": "Gagal menghasilkan audio"}, 500

    except Exception as e:
        print(e)
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True)
