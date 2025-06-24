/**
 * Revalidate documents with retry mechanism to handle race conditions
 * @param {Function} revalidateDocuments Function to revalidate documents
 * @param {number} maxRetries Maximum number of retry attempts
 * @param {number} baseDelay Base delay in milliseconds (will be doubled each attempt)
 * @param {Object} previousDocuments Previous documents state to compare against
 * @returns {Promise<Object>} Document data
 */
export const revalidateDocumentsWithRetry = async (
  revalidateDocuments,
  maxRetries = 3,
  baseDelay = 1000,
  previousDocuments = {}
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const documents = await revalidateDocuments();

    // Calculate total pages in current and previous documents
    const currentPageCount = Object.values(documents).reduce(
      (total, docArray) => total + (Array.isArray(docArray) ? docArray.length : 0),
      0
    );

    const previousPageCount = Object.values(previousDocuments).reduce(
      (total, docArray) => total + (Array.isArray(docArray) ? docArray.length : 0),
      0
    );

    // Return if page count increased OR this is the last attempt
    if (currentPageCount > previousPageCount || attempt === maxRetries - 1) {
      return documents;
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = baseDelay * Math.pow(2, attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return await revalidateDocuments();
};