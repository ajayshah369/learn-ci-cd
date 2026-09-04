import request from 'supertest';
import { createApp } from '../src/app';
import { todoService } from '../src/services/todo.service';

const app = createApp();

beforeEach(() => todoService.reset());

describe('POST /api/todos', () => {
  it('creates a todo', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Write a pipeline' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: 'Write a pipeline', done: false });
  });

  it('rejects a missing title', async () => {
    const res = await request(app).post('/api/todos').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/);
  });
});

describe('GET /api/todos', () => {
  it('lists todos with a count', async () => {
    await request(app).post('/api/todos').send({ title: 'one' });
    await request(app).post('/api/todos').send({ title: 'two' });

    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.items).toHaveLength(2);
  });

  it('404s for an unknown id', async () => {
    const res = await request(app).get('/api/todos/99');

    expect(res.status).toBe(404);
  });

  it('400s for a non-numeric id', async () => {
    const res = await request(app).get('/api/todos/abc');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/todos/:id', () => {
  it('marks a todo as done', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'ship it' });

    const res = await request(app).patch(`/api/todos/${created.body.id}`).send({ done: true });

    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and then 404s', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'remove me' });

    const del = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/todos/${created.body.id}`);
    expect(after.status).toBe(404);
  });
});
