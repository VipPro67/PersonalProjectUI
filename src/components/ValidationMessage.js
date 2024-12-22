import React from "react";

const ValidationMessage = ({ errors, field }) => {
  if (!errors || !errors[field]) {
    return null;
  }

  const renderError = (error) => (
    <p key={error} className="text-red-500 text-xs italic">
      {error}
    </p>
  );

  return Array.isArray(errors[field])
    ? errors[field].map(renderError)
    : renderError(errors[field]);
};

export default ValidationMessage;
