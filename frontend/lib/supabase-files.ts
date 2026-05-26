import {
  fetchSubjectFiles as apiFetchSubjectFiles,
  fetchSubjectFilesByFilter as apiFetchSubjectFilesByFilter,
  createSubjectFile as apiCreateSubjectFile,
  deleteSubjectFileById as apiDeleteSubjectFileById,
  uploadSubjectFileAsset as apiUploadSubjectFileAsset
} from "./api/files.api"

export const fetchSubjectFiles = apiFetchSubjectFiles;
export const fetchSubjectFilesByFilter = apiFetchSubjectFilesByFilter;
export const createSubjectFile = apiCreateSubjectFile;
export const deleteSubjectFileById = apiDeleteSubjectFileById;
export const uploadSubjectFileAsset = apiUploadSubjectFileAsset;
