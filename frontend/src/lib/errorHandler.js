export const handleApiError = (error) => {
  const message = error.response?.data?.error
    || error.response?.data?.message
    || error.message
    || 'Something went wrong';
  console.error('[API Error]', message);
  return message;
};
