import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '../utils/fetcher';

const basePath = process.env.API_PATH || '/api';

export const classifyDocument = async (uuid, files, availableClasses, documentNames = []) => {
  const formData = new FormData();
  files.forEach((f, index) => {
    formData.append(`documents`, f);
    if (documentNames[index] && documentNames[index].trim()) {
      formData.append(`documentNames`, documentNames[index].trim());
    }
  });

  availableClasses.map((availableClass) => formData.append(`availableClasses`, availableClass));

  const result = await fetch(`${basePath}/classifications/${uuid}`, {
    method: 'PUT',
    headers: {
      accept: '*/*'
    },
    body: formData
  });

  if (result.ok) {
    return { ok: true };
  } else {
    return { ok: false };
  }
};

export const uploadPages = async (uuid, document, files, documentName) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append(`documents`, f);
  });

  if (documentName) {
    formData.append(`documentName`, documentName);
  }

  const result = await fetch(`${basePath}/classifications/${uuid}/documents/${document}`, {
    method: 'PUT',
    headers: {
      accept: '*/*'
    },
    body: formData
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
    method: 'DELETE'
  });

  if (result.ok) {
    return { ok: true };
  } else {
    return { ok: false };
  }
};

export const correctDocuments = async (uuid, from, to) => {
  const res = await fetch(`${basePath}/classifications/${uuid}/documents/correction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify([{ from, to }])
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

export const usePages = (uuid, documentName) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: pages, mutate } = useSWR(
    documentName ? `${basePath}/classifications/${uuid}/documents/${documentName}/index` : null,
    fetcher,
    {
      fallbackData: []
    }
  );
  return {
    pages,
    mutatePages: mutate,
    revalidatePages: () =>
      mutateGlobal(
        documentName ? `${basePath}/classifications/${uuid}/documents/${documentName}/index` : null
      )
  };
};

export const useDocuments = (uuid) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: documents, mutate } = useSWR(
    `${basePath}/classifications/${uuid}/documents`,
    fetcher,
    {
      fallbackData: {}
    }
  );
  return {
    documents,
    mutateDocuments: mutate,
    correctDocuments: (from, to) => correctDocuments(uuid, from, to),
    revalidateDocuments: () => mutateGlobal(`${basePath}/classifications/${uuid}/documents`)
  };
};

export const useTasks = (uuid) => {
  const { data: tasks } = useSWR(`${basePath}/classifications/${uuid}`, fetcher, {
    fallbackData: [],
    refreshInterval: 5000
  });
  return { tasks };
};
