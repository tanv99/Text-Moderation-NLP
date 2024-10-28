from flask import Blueprint, request

from .detection import predict

api = Blueprint("api", __name__)


@api.route("/", methods=["GET"])
def status():
    return {"hello": "world"}, 200


@api.route("/check", methods=["POST"])
def check():
    text = request.json.get("text", "")
    return {"text": text, "toxic": int(predict([text])[0])}
