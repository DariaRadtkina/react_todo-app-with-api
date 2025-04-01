/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  deleteTodo: (id: number) => void;
  loadingTodo: number[];
  updateTodo: (todo: Todo) => void;
  isEditing: boolean;
  newTitleTodo: string;
  setNewTitleTodo: (title: string) => void;
  startEditing: (todo: Todo) => void;
  cancelEditing: () => void;
  toggleTodo: (todo: Todo) => void;
};

export const Todos: React.FC<Props> = ({
  todo,
  deleteTodo,
  loadingTodo,
  updateTodo,
  isEditing,
  newTitleTodo,
  setNewTitleTodo,
  startEditing,
  cancelEditing,
  toggleTodo,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateTodo({ ...todo, title: newTitleTodo.trim() });
  };

  const handleBlur = () => {
    updateTodo({ ...todo, title: newTitleTodo.trim() });
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div data-cy="Todo" className={`todo ${todo.completed && 'completed'}`}>
      <label
        className="todo__status-label"
        onClick={() => toggleTodo({ ...todo, completed: !todo.completed })}
      >
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
        />
      </label>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            data-cy="TodoTitleField"
            className="todo todo__title"
            value={newTitleTodo}
            onChange={event => setNewTitleTodo(event.target.value)}
            onBlur={handleBlur}
            onKeyUp={handleKeyUp}
            autoFocus
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => startEditing(todo)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal', 'overlay', {
          'is-active': loadingTodo.includes(todo.id),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
