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

export const uploadPages = async (uuid, document, files, documentParams = {}) => {
  const formData = new FormData();
  files.forEach((f) => {
    formData.append(`documents`, f);
  });

  if (documentParams.name) {
    formData.append(`name`, documentParams.name);
  }

  if (documentParams.isNewVersion) {
    formData.append(`isNewVersion`, documentParams.isNewVersion);
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

export const useDocuments = (uuid) => {
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data, mutate } = useSWR(`${basePath}/classifications/${uuid}/documents`, fetcher, {
    fallbackData: {}
  });

  const documents = [];
  const versions = [];

  Object.entries(data).forEach(([key, value]) => {
    documents[key] = value.pages;
    versions[key] = value.versions;
  });

  return {
    versions,
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
