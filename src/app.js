const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: `Invalid repository id: ${id}` });
  }
  return next();
}

app.use("/repositories/:id", validateRepositoryId);

const repositories = [];

function findRepositoryIndexById(id) {
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );
  return repositoryIndex;
}

app.get("/repositories", (request, response) => {
  const { title } = request.query;

  const results = title
    ? repositories.filter((repository) => repository.title.includes(title))
    : repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(200).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndexById(id);

  if (repositoryIndex < 0) {
    return response
      .status(404)
      .json({ error: `Repository not found. id: ${id}` });
  }

  const { title, url, techs } = request.body;

  const repository = {
    id,
    title,
    url,
    techs,
  };
  repositories[repositoryIndex] = {
    ...repositories[repositoryIndex],
    ...repository,
  };

  return response.json(repositories[repositoryIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndexById(id);
  if (repositoryIndex < 0) {
    return response
      .status(404)
      .json({ error: `Repository not found. id: ${id}` });
  }
  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = findRepositoryIndexById(id);
  if (repositoryIndex < 0) {
    return response
      .status(404)
      .json({ error: `Repository not found. id: ${id}` });
  }

  const repository = repositories[repositoryIndex];

  repository.likes++;
  return response.json(repository);
});

module.exports = app;
