import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '../utils/fetcher';

const basePath = process.env.API_PATH || '/api';
const dossierCorePath = process.env.DOSSIER_CORE_PATH || 'http://localhost:3001';

export const classifyDocument = async (uuid, files, availableClasses) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append(`documents`, f);
  });

  availableClasses.map((availableClass) => formData.append(`availableClasses`, availableClass));

  const result = await fetch(`${dossierCorePath}/classifier/api/${uuid}`, {
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

export const uploadPages = async (uuid, document, files) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append(`documents`, f);
  });

  const result = await fetch(`${dossierCorePath}/dossiercore/api/${uuid}/documents/${document}`, {
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

export const correctDocuments = async (uuid, documents) => {
  const res = await fetch(`${dossierCorePath}/dossiercore/api/${uuid}/documents/correction`, {
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

export const getSchema = async (project) => {
  const res = fetch(`${dossierCoreUrl}/dossiercore/api/schema/${project}`, {
    method: 'GET',
  });

  if (res.ok) {
    const schema = await res.json();
    return schema;
  } else {
    throw Error(`Не удалось полуичть схему`);
  }
};

export const usePages = (uuid, documentName) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: pages, mutate } = useSWR(
    documentName ? `${dossierCorePath}/dossiercore/api/${uuid}/documents/${documentName}` : null,
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
        documentName
          ? `${dossierCorePath}/dossiercore/api/${uuid}/documents/${documentName}`
          : null,
      ),
  };
};

export const useDocuments = (uuid) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: documents, mutate } = useSWR(
    `${dossierCorePath}/dossiercore/api/${uuid}/documents`,
    fetcher,
    {
      fallbackData: {},
    },
  );
  return {
    documents,
    mutateDocuments: mutate,
    correctDocuments: (from, to) => correctDocuments(uuid, from, to),
    revalidateDocuments: () => mutateGlobal(`${dossierCorePath}/dossiercore/api/${uuid}/documents`),
  };
};

export const useTasks = (uuid) => {
  const { data: tasks } = useSWR(`${basePath}/classifications/${uuid}`, fetcher, {
    fallbackData: [],
    refreshInterval: 5000,
  });
  return { tasks };
};
