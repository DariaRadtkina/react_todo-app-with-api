import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as clientData from './api/todos';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { TodoList } from './components/TodoList/TodoList';
import { Error, FilterBy, Todo } from './types/Todo';
import { ErrorNotification } from './components/Error/ErrorNotification';
import { TodoItem } from './components/TodoItem/TodoItem';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterTodo, setFilterTodo] = useState<string>(FilterBy.ALL);

  const [errorMessage, setErrorMessage] = useState(Error.DEFAULT);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingTodo, setLoadingTodo] = useState<number[]>([]);

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [newTitleTodo, setNewTitleTodo] = useState('');

  const catchErrors = (errorMessageForCatch: Error) => {
    setErrorMessage(errorMessageForCatch);
    setTimeout(() => setErrorMessage(Error.DEFAULT), 3000);
  };

  const errorDefault = () => setErrorMessage(Error.DEFAULT);

  function getClientData() {
    setIsLoading(true);

    clientData
      .getTodos()
      .then(data => {
        setTodos(data);
        errorDefault();
      })
      .catch(() => {
        catchErrors(Error.LOAD);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(getClientData, []);

  function addTodo(newTitle: string) {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      catchErrors(Error.TITLE);

      return;
    }

    const tempNewTodo: Todo = {
      id: 0,
      userId: clientData.USER_ID,
      title: trimmedTitle,
      completed: false,
    };

    setTempTodo(tempNewTodo);
    setIsInputDisabled(true);
    setLoadingTodo((prev: number[]) => [...prev, clientData.USER_ID]);
    errorDefault();

    clientData
      .addTodos({
        userId: clientData.USER_ID,
        title: trimmedTitle,
        completed: false,
      })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
        setTempTodo(null);
        setInputValue('');
      })
      .catch(() => {
        catchErrors(Error.ADD);
        setInputValue(trimmedTitle);
        setTempTodo(null);
      })
      .finally(() => {
        setLoadingTodo((prev: number[]) =>
          prev.filter(id => id !== clientData.USER_ID),
        );
        setIsInputDisabled(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      });
  }

  function deleteTodo(todoId: number) {
    setLoadingTodo((prev: number[]) => [...prev, todoId]);
    errorDefault();

    clientData
      .deleteTodos(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        catchErrors(Error.DELETE);
      })
      .finally(() => {
        setLoadingTodo((prev: number[]) => prev.filter(id => id !== todoId));
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      });
  }

  function updateTodo(todo: Todo) {
    const trimmedTitle = todo.title.trim();

    if (!trimmedTitle) {
      deleteTodo(todo.id);

      return;
    }

    const originalTodo = todos.find(oldTodo => oldTodo.id === todo.id);

    if (originalTodo && trimmedTitle === originalTodo.title) {
      setEditingTodoId(null);

      return;
    }

    setIsInputDisabled(true);
    setLoadingTodo((prev: number[]) => [...prev, todo.id]);
    errorDefault();

    clientData
      .updateTodos(todo)
      .then((updatedTodo: Todo) => {
        setTodos(currentTodos =>
          currentTodos.map(currTodos =>
            currTodos.id === updatedTodo.id ? updatedTodo : currTodos,
          ),
        );
      })
      .then(() => setEditingTodoId(null))
      .catch(() => {
        catchErrors(Error.UPDATE);
      })
      .finally(() => {
        setLoadingTodo((prev: number[]) => {
          return prev.filter(id => id !== todo.id);
        });
        setIsInputDisabled(false);
      });
  }

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setNewTitleTodo(todo.title);
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setNewTitleTodo('');
  };

  function toggleTodo(todo: Todo) {
    setLoadingTodo((prev: number[]) => [...prev, todo.id]);
    errorDefault();

    clientData
      .updateTodos(todo)
      .then((updatedTodo: Todo) => {
        setTodos(currentTodos =>
          currentTodos.map(currTodos =>
            currTodos.id === updatedTodo.id ? updatedTodo : currTodos,
          ),
        );
      })
      .catch(() => {
        catchErrors(Error.UPDATE);
      })
      .finally(() => {
        setLoadingTodo((prev: number[]) => {
          return prev.filter(id => id !== todo.id);
        });
      });
  }

  function toggleAllTodos() {
    const toggleAllCompleted = todos.filter((todo: Todo) => todo.completed);
    const toggleAllNotCompleted = todos.filter((todo: Todo) => !todo.completed);

    if (toggleAllCompleted.length === todos.length) {
      toggleAllCompleted.forEach((todo: Todo) =>
        toggleTodo({ ...todo, completed: !todo.completed }),
      );
    } else {
      toggleAllNotCompleted.forEach((todo: Todo) =>
        toggleTodo({ ...todo, completed: !todo.completed }),
      );
    }
  }

  function clearCompletedTodos() {
    const allCompleted = todos.filter((todo: Todo) => todo.completed);

    allCompleted.forEach((todo: Todo) => deleteTodo(todo.id));
  }

  const filteredByCompleted = todos.filter(todo => {
    switch (filterTodo) {
      case FilterBy.ACTIVE:
        return !todo.completed;

      case FilterBy.COMPLETED:
        return todo.completed;

      default:
        return true;
    }
  });

  const notCompletedTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodoCount = todos.filter(todo => todo.completed).length;
  const isTodosEmpty = todos.length;

  if (!clientData.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          notCompletedTodosCount={notCompletedTodosCount}
          addTodo={addTodo}
          inputRef={inputRef}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isInputDisabled={isInputDisabled}
          toggleAllTodos={toggleAllTodos}
          isTodosEmpty={isTodosEmpty}
        />
        {!isLoading ? (
          <TodoList
            todos={filteredByCompleted}
            deleteTodo={deleteTodo}
            loadingTodo={loadingTodo}
            updateTodo={updateTodo}
            editingTodoId={editingTodoId}
            newTitleTodo={newTitleTodo}
            setNewTitleTodo={setNewTitleTodo}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            toggleTodo={toggleTodo}
          />
        ) : (
          <div>Loading...</div>
        )}

        {tempTodo && (
          <TodoItem
            todo={tempTodo}
            loadingTodo={loadingTodo}
            isTemp
            deleteTodo={deleteTodo}
          />
        )}

        {todos.length > 0 && (
          <Footer
            notCompletedTodosCount={notCompletedTodosCount}
            completedTodoCount={completedTodoCount}
            setFilterTodo={setFilterTodo}
            filterTodo={filterTodo}
            clearCompletedTodos={clearCompletedTodos}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        setErrorMessage={errorDefault}
      />
    </div>
  );
};
