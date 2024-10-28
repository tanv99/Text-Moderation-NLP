import os

from flask import Blueprint, send_from_directory

client = Blueprint("client", __name__, static_folder="build")


@client.route("/", defaults={"path": ""})
@client.route("/<path:path>")
def serve(path):
    print(path)
    if path != "" and os.path.exists(client.static_folder + "/" + path):
        return send_from_directory(client.static_folder, path)
    else:
        return send_from_directory(client.static_folder, "index.html")


@client.route("/static/<string:foldername>/<string:filename>")
def serve_static(foldername, filename):
    print(foldername, filename)
    return send_from_directory(client.static_folder + "/static/" + foldername, filename)
