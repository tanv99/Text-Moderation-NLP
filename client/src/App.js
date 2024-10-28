import React, { useState, useCallback } from "react";

import {
  Alert,
  Container,
  Card,
  CardBody,
  CardTitle,
  Collapse,
  FormTextarea,
  FormInput,
  Button,
  CardFooter,
} from "shards-react";

import ActivityIndicator from "./components/ActivityIndicator";
import "./App.css";

const emptyPost = { title: "", body: "" };
const initialPosts = [];

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [post, setPost] = useState(emptyPost);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setPost((post) => ({ ...post, [name]: value }));
  }, []);

  const handlePost = useCallback(() => {
    if (!post.title) {
      setError("Enter somthing to post!");
      return false;
    }
    setLoading(true);
    fetch("/api/check", {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: post.title + " " + post.body }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.toxic)
          setError(
            "The post has been blocked, since it contained inappropriate content."
          );
        else {
          setError(false);
          setPosts((posts) => [...posts, post]);
          setPost(emptyPost);
        }
      })
      .catch((reason) => {
        console.log(reason);
        setError("Some server error occured. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [post]);

  return (
    <Container>
      <h1>Clean Blogging Site</h1>
      <div id="postCard">
        <h4>New Post</h4>
        <Collapse open={!!error && !loading}>
          <Alert theme="danger">{error}</Alert>
        </Collapse>
        <FormInput
          autoFocus
          autoComplete="off"
          placeholder="Title"
          onChange={handleChange}
          value={post.title}
          name="title"
          disabled={loading}
        />
        <FormTextarea
          autoComplete="off"
          rows={3}
          placeholder="Write something nice to post..."
          onChange={handleChange}
          value={post.body}
          name="body"
          disabled={loading}
        />
        <Button theme="dark" onClick={handlePost} disabled={loading}>
          {loading ? <ActivityIndicator /> : "Post"}
        </Button>
      </div>
      <main>
        <h3>All Posts</h3>
        <Card>
          <CardBody>
            <CardTitle>About the Project</CardTitle>
            <p>
              This is a demonstration of our project,{" "}
              <b>Text Moderation using NLP</b>.
              <br />
              It uses natural language processing to block any inappropriate
              content.
              <br />
            </p>
          </CardBody>
          <CardFooter>
            A project by <b>Divya Jain</b>, <b>Gunjan Mistry</b>
            {" and "}
            <b>Tanvi Inchanalkar</b>
          </CardFooter>
        </Card>
        <Card>
          <CardBody>
            <CardTitle>Implementation</CardTitle>
            <p>
              It uses <b>Flask</b> backend for the api, along with{" "}
              <b>React.js</b> client for the frontend.
              <br />
              This code is hosted on a <b>Heroku</b> server with version control
              and automatic deployment from <b>Github</b>.
            </p>
          </CardBody>
          <CardFooter>
            <b>
              Source Code:{" "}
              <a target="blank" href="https://bit.ly/moderationdemosource">
                Github
              </a>
            </b>
          </CardFooter>
        </Card>
        <Card>
          <CardBody>
            <CardTitle>Design</CardTitle>
            <p>
              Various combinations of <b>embeddings</b> and <b>models</b> were
              tested to find the best one.
            </p>
          </CardBody>
          <CardFooter>
            <small>
              <b>
                Notebooks: <br />
                {"1) "}
                <a target="blank" href="https://bit.ly/embeddingmodels">
                  Embedding and Model Selection
                </a>
                <br />
                {"2) "}
                <a target="blank" href="https://bit.ly/ensembledtest">
                  Ensemble Model Testing
                </a>
                <br />
                {"3) "}
                <a target="blank" href="https://bit.ly/modelpipeline">
                  Pipelining for Deploying
                </a>
              </b>
            </small>
          </CardFooter>
        </Card>
        {posts.map((post, idx) => (
          <Card key={idx}>
            <CardBody>
              <CardTitle>{post.title}</CardTitle>
              <p>{post.body}</p>
            </CardBody>
          </Card>
        ))}
      </main>
    </Container>
  );
}

export default App;
