import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '../utils/fetcher';

const basePath = process.env.API_PATH || '/api';

export const classifyDocument = async (uuid, files, availableClasses, dossierUrl) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append(`documents`, f);
  });

  availableClasses.map((availableClass) => formData.append(`availableClasses`, availableClass));

  const result = await fetch(`${dossierUrl}/classifier/api/${uuid}`, {
    method: 'PUT',
    headers: {
      accept: '*/*',
    },
    body: formData,
  });

  if (result.ok) {
    return { ok: true };
  } else {
    return { ok: false };
  }
};

export const uploadPages = async (uuid, document, files, dossierUrl) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append(`documents`, f);
  });

  const result = await fetch(`${dossierUrl}/dossiercore/api/${uuid}/documents/${document}`, {
    method: 'PUT',
    headers: {
      accept: '*/*',
    },
    body: formData,
  });

  if (result.ok) {
    return { ok: true };
  } else {
    return { ok: false, ...(await result.json()) };
  }
};

export const deletePage = async (pageSrc) => {
  const url = pageSrc.path.slice(0, pageSrc.path.lastIndexOf('/')) + `/${pageSrc.uuid}`;
  const result = await fetch(url, {
    method: 'DELETE',
  });

  if (result.ok) {
    return { ok: true };
  } else {
    return { ok: false };
  }
};

export const correctDocuments = async (uuid, documents, dossierUrl) => {
  const res = await fetch(`${dossierUrl}/dossiercore/api/${uuid}/documents/correction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    body: JSON.stringify({ documents }),
  });

  if (res.ok) {
    return { ok: true };
  } else {
    const error = new Error('An error occured while correcting the documents');
    error.info = res.text();
    error.status = res.status;
    throw error;
  }
};

export const getSchema = async (project, dossierUrl) => {
  const res = fetch(`${dossierUrl}/dossiercore/api/schema/${project}`, {
    method: 'GET',
  });

  if (res.ok) {
    return await res.json();
  } else {
    throw Error(`Не удалось получить схему`);
  }
};

export const usePages = (uuid, documentName, dossierUrl) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: pages, mutate } = useSWR(
    documentName ? `${dossierUrl}/dossiercore/api/${uuid}/documents/${documentName}` : null,
    fetcher,
    {
      fallbackData: [],
    },
  );
  return {
    pages,
    mutatePages: mutate,
    revalidatePages: () =>
      mutateGlobal(
        documentName ? `${dossierUrl}/dossiercore/api/${uuid}/documents/${documentName}` : null,
      ),
  };
};

export const useDocuments = (uuid, dossierUrl) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: documents, mutate } = useSWR(
    `${dossierUrl}/dossiercore/api/${uuid}/documents`,
    fetcher,
    {
      fallbackData: {},
    },
  );
  return {
    documents,
    mutateDocuments: mutate,
    correctDocuments: (documents) => correctDocuments(uuid, documents, dossierUrl),
    revalidateDocuments: () => mutateGlobal(`${dossierUrl}/dossiercore/api/${uuid}/documents`),
    classifyDocument: (uuid, files, availableClasses) =>
      classifyDocument(uuid, files, availableClasses, dossierUrl),
    uploadPages: (uuid, document, files) => uploadPages(uuid, document, files, dossierUrl),
    deletePage: (pageSrc) => deletePage(pageSrc),
  };
};

export const useTasks = (uuid, dossierUrl) => {
  const { data: tasks } = useSWR(`${dossierUrl}/classifier/api/${uuid}`, fetcher, {
    fallbackData: [],
    refreshInterval: 5000,
  });
  return { tasks };
};
