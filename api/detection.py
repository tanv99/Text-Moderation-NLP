import re
import string


def preprocess(text):
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = re.split("\W+", text)
    text = " ".join(tokens).strip().lower()
    return text


import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import sentencepiece as spm
import tensorflow.compat.v1 as tf

tf.disable_v2_behavior()
import tensorflow_hub as hub

graph = tf.get_default_graph()


def use_lite_embed():
    module = hub.Module("https://tfhub.dev/google/universal-sentence-encoder-lite/2")
    global graph
    with graph.as_default():
        input_placeholder = tf.sparse_placeholder(tf.int64, shape=[None, None])
        encodings = module(
            inputs=dict(
                values=input_placeholder.values,
                indices=input_placeholder.indices,
                dense_shape=input_placeholder.dense_shape,
            )
        )

    with tf.Session() as sess:
        spm_path = sess.run(module(signature="spm_path"))
    sp = spm.SentencePieceProcessor()
    sp.Load(spm_path)

    def process_to_IDs_in_sparse_format(sp, sentences):
        ids = [sp.EncodeAsIds(x) for x in sentences]
        max_len = max(len(x) for x in ids)
        dense_shape = (len(ids), max_len)
        values = [item for sublist in ids for item in sublist]
        indices = [
            [row, col] for row in range(len(ids)) for col in range(len(ids[row]))
        ]
        return (values, indices, dense_shape)

    def embed(msgs):
        values, indices, dense_shape = process_to_IDs_in_sparse_format(sp, msgs)
        global graph
        with graph.as_default(), tf.Session() as session:
            session.run([tf.global_variables_initializer(), tf.tables_initializer()])
            return session.run(
                encodings,
                feed_dict={
                    input_placeholder.values: values,
                    input_placeholder.indices: indices,
                    input_placeholder.dense_shape: dense_shape,
                },
            )

    return embed


import pickle

from sklearn.ensemble import VotingClassifier


def load_model():
    model_path = "api/models/USEL-Voting.model"
    with open(model_path, "rb") as model_file:
        model = pickle.load(model_file)
    return model


def make_pipeline(preprocess, embed, model):
    def predict(data):
        preprocessed = (preprocess(datum) for datum in data)
        embedded = embed(preprocessed)
        result = model.predict(embedded)
        return result

    return predict


model = load_model()
embed = use_lite_embed()

predict = make_pipeline(preprocess, embed, model)

if __name__ == "__main__":
    print(predict(["a beautiful day", "you are a piece of shit"]))
