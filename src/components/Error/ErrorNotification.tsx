import React from 'react';
import { Error } from '../../types/index';
import classNames from 'classnames';

type Props = {
  errorMessage: Error;
  setErrorMessage: () => void;
};

export const ErrorNotification: React.FC<Props> = ({
  errorMessage,
  setErrorMessage,
}) => {
  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification',
        'is-danger',
        'is-light',
        'has-text-weight-normal',
        {
          hidden: !errorMessage,
        },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={() => setErrorMessage}
      />

      {errorMessage}
    </div>
  );
};
