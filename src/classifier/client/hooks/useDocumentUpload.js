import { useCallback, useState } from 'react';
import { toast } from 'react-semantic-toasts';
import { classifyDocument, uploadPages } from './index';
import { compress } from '../utils/compressor';

/**
 * Hook for handling document upload functionality
 * @param {string} uuid Document UUID
 * @param {Function} revalidateDocuments Function to revalidate documents
 * @param {Function} showError Function to display errors
 * @returns {Object} Document upload utilities
 */
export const useDocumentUpload = (uuid, revalidateDocuments, showError) => {
  const [loading, setLoading] = useState(false);

  /**
   * Compress files before upload to optimize bandwidth
   * @param {Array} files Files to compress
   * @returns {Promise<Array>} Compressed files
   */
  const compressFiles = useCallback(async (files) => {
    return Promise.all(
      files.map(async (file) => {
        if (file.type.includes('image/')) {
          return compress(file, 500, Infinity, 1000, 0.9).then((blob) => {
            return new File([blob], file.name, { type: file.type });
          });
        } else {
          return file;
        }
      })
    );
  }, []);

  /**
   * Handle files dropped for classification
   * @param {Array} acceptedFiles Accepted files
   * @param {string} targetTab Target tab type
   * @param {Array} availableClasses Available classification types
   * @param {Function} onUpdate Callback after upload completes
   * @param {Object} selectedTab Current selected tab
   * @returns {Promise<void>}
   */
  const handleDocumentsDrop = useCallback(
    async (acceptedFiles, targetTab, availableClasses = [], onUpdate, selectedTab) => {
      if (!acceptedFiles || !acceptedFiles.length) {
        return showError?.('Файл выбранного типа не доступен для загрузки.');
      }

      // Compress the files before upload
      const compressedFiles = await compressFiles(acceptedFiles);

      if (targetTab === 'classifier') {
        // Classify document using AI
        setLoading(true);
        try {
          await classifyDocument(uuid, compressedFiles, availableClasses);
          await revalidateDocuments();
        } catch (error) {
          console.error('Classification error:', error);
          showError?.('Не удалось классифицировать документы.');
        } finally {
          setLoading(false);
        }
      } else {
        // Upload to specific document type
        setLoading(true);
        try {
          const result = await uploadPages(uuid, targetTab, compressedFiles);
          const documents = await revalidateDocuments();

          if (onUpdate) {
            onUpdate(selectedTab, documents);
          }

          if (result.error) {
            // Process errors from API
            if (result.error.description?.type === 'signatureError') {
              toast({
                type: 'info',
                title: result.error.description.info
              });
            } else {
              toast({
                type: 'error',
                title: result.error.description
              });
            }

            return { error: result.error, documents };
          }

          return { documents };
        } catch (error) {
          console.error('Upload error:', error);
          showError?.('Не удалось загрузить файлы.');
          return { error };
        } finally {
          setLoading(false);
        }
      }
    },
    [uuid, compressFiles, revalidateDocuments, showError]
  );

  return {
    loading,
    handleDocumentsDrop,
    compressFiles
  };
};
