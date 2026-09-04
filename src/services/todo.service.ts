export interface Todo {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

// Deliberately in-memory: the point of this project is the pipeline,
// not the database. Data resets on every restart.
let nextId = 1;
let todos: Todo[] = [];

export const todoService = {
  list(): Todo[] {
    return todos;
  },

  find(id: number): Todo | undefined {
    return todos.find((t) => t.id === id);
  },

  create(title: string): Todo {
    const todo: Todo = {
      id: nextId++,
      title,
      done: false,
      createdAt: new Date().toISOString(),
    };
    todos.push(todo);
    return todo;
  },

  update(id: number, changes: Partial<Pick<Todo, 'title' | 'done'>>): Todo | undefined {
    const todo = this.find(id);
    if (!todo) return undefined;
    if (changes.title !== undefined) todo.title = changes.title;
    if (changes.done !== undefined) todo.done = changes.done;
    return todo;
  },

  remove(id: number): boolean {
    const before = todos.length;
    todos = todos.filter((t) => t.id !== id);
    return todos.length < before;
  },

  reset(): void {
    todos = [];
    nextId = 1;
  },
};
