/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';

type Props = {
  todo: Todo;
  loadingTodo: number[];
  isTemp?: boolean;
  deleteTodo: (id: number) => void;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  loadingTodo,
  isTemp = false,
  deleteTodo,
}) => {
  const { id, userId, title, completed } = todo;
  const loadingAll = isTemp
    ? loadingTodo.includes(userId)
    : loadingTodo.includes(id);

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: completed && !isTemp })}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          disabled={isTemp || loadingAll}
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {title}
      </span>

      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => deleteTodo(id)}
      >
        ×
      </button>

      <div
        data-cy="TodoLoader"
        className={`modal overlay ${loadingAll ? 'is-active' : ''}`}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
