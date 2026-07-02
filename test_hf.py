import requests

# Test mDeBERTa
url_zero = "https://api-inference.huggingface.co/models/MoritzLaurer/mDeBERTa-v3-base-mnli-xnli"
res_zero = requests.post(url_zero, json={"inputs": "Test", "parameters": {"candidate_labels": ["tehdit", "kaza"]}})
print("ZeroShot:", res_zero.status_code, res_zero.text)

# Test Sentiment
url_sent = "https://api-inference.huggingface.co/models/savasy/bert-base-turkish-sentiment-cased"
res_sent = requests.post(url_sent, json={"inputs": "Bugün çok kötü bir kaza oldu."})
print("Sentiment:", res_sent.status_code, res_sent.text)
