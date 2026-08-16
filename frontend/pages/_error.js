import React from 'react';

function Error({ statusCode }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {statusCode
            ? `An error ${statusCode} occurred`
            : 'An error occurred'}
        </h1>
        <p className="text-gray-600">
          Please try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;