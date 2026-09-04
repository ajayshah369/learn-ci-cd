import { Router } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { todoService } from '../services/todo.service';

export const todoRouter = Router();

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'id must be a positive integer');
  }
  return id;
}

todoRouter.get('/todos', (_req, res) => {
  const items = todoService.list();
  res.json({ count: items.length, items });
});

todoRouter.get('/todos/:id', (req, res) => {
  const todo = todoService.find(parseId(req.params.id));
  if (!todo) throw new HttpError(404, 'Todo not found');
  res.json(todo);
});

todoRouter.post('/todos', (req, res) => {
  const { title } = req.body ?? {};
  if (typeof title !== 'string' || title.trim() === '') {
    throw new HttpError(400, 'title is required and must be a non-empty string');
  }
  res.status(201).json(todoService.create(title.trim()));
});

todoRouter.patch('/todos/:id', (req, res) => {
  const { title, done } = req.body ?? {};
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    throw new HttpError(400, 'title must be a non-empty string');
  }
  if (done !== undefined && typeof done !== 'boolean') {
    throw new HttpError(400, 'done must be a boolean');
  }

  const updated = todoService.update(parseId(req.params.id), {
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(done !== undefined ? { done } : {}),
  });
  if (!updated) throw new HttpError(404, 'Todo not found');
  res.json(updated);
});

todoRouter.delete('/todos/:id', (req, res) => {
  if (!todoService.remove(parseId(req.params.id))) {
    throw new HttpError(404, 'Todo not found');
  }
  res.status(204).send();
});
