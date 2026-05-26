import {
  fetchTeachers as apiFetchTeachers,
  createTeacher as apiCreateTeacher,
  deleteTeacherById as apiDeleteTeacherById,
  fetchTeacherAssignments as apiFetchTeacherAssignments,
  createTeacherAssignment as apiCreateTeacherAssignment,
  deleteTeacherAssignmentById as apiDeleteTeacherAssignmentById
} from "./api/teachers.api"

export const fetchTeachers = apiFetchTeachers;
export const createTeacher = apiCreateTeacher;
export const deleteTeacherById = apiDeleteTeacherById;
export const fetchTeacherAssignments = apiFetchTeacherAssignments;
export const createTeacherAssignment = apiCreateTeacherAssignment;
export const deleteTeacherAssignmentById = apiDeleteTeacherAssignmentById;
