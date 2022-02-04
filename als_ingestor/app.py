import json

from flask import Flask, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/event', methods=['POST'])
@cross_origin()
def event():
    print(request.data)
    record = json.loads(request.data)
    with open("event.json", "w") as outfile:
        json.dump(record, outfile, indent=4)
    return {"result": "success"}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8822)
