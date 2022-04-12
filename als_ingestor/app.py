import json

from flask import Flask, request, render_template, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/')
@cross_origin()
def index():
    return render_template('index.html')


@app.route('/ow_event', methods=['POST'])
@cross_origin()
def event():
    print(request.data)
    record = json.loads(request.data)
    with open("event.json", "w") as outfile:
        json.dump(record, outfile, indent=4)
    return {"result": "success"}


@app.route('/ow_ping')
@cross_origin()
def ow_ping():
    return jsonify({
        "status": "OK"
    }), 200


@app.route('/ow_user')
@cross_origin()
def ow_user():
    headers = request.headers
    auth = headers.get("X-Api-Key")
    if auth == 'test_token':
        return jsonify({
            "name": "GoshDarnedHero",
            "club": "DADS"
        }), 200
    else:
        return jsonify({"message": "ERROR: Unauthorized"}), 401


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8822)
