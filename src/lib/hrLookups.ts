"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { Department, Employee, JobTitle } from "./types";

export interface EmployeeOption {
  id: number;
  label: string;
}

export interface HrLookupOption {
  id: number;
  name: string;
}

const FALLBACK: EmployeeOption[] = [{ id: 1, label: "EMP-001 · Sarah Bakery" }];

export function useEmployeeLookups() {
  const [employees, setEmployees] = useState<EmployeeOption[]>(FALLBACK);

  useEffect(() => {
    api
      .get<Employee[]>("/hr/employees")
      .then((rows) =>
        setEmployees(rows.map((e) => ({ id: e.id, label: `${e.employee_number} · ${e.first_name} ${e.last_name}` })))
      )
      .catch(() => setEmployees(FALLBACK));
  }, []);

  return { employees };
}

const FALLBACK_DEPARTMENTS: Department[] = [
  { id: 1, name: "Operations" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Human Resources" },
];

const FALLBACK_JOB_TITLES: JobTitle[] = [
  { id: 1, name: "HR Admin" },
  { id: 2, name: "Accountant" },
  { id: 3, name: "Operations Manager" },
];

function useHrLookup<T extends HrLookupOption>(path: string, fallback: T[]) {
  const [options, setOptions] = useState<T[]>(fallback);

  useEffect(() => {
    api
      .get<T[]>(path)
      .then(setOptions)
      .catch(() => setOptions(fallback));
  }, [path]);

  return options;
}

export function useDepartmentLookups() {
  return useHrLookup<Department>("/hr/departments", FALLBACK_DEPARTMENTS);
}

export function useJobTitleLookups() {
  return useHrLookup<JobTitle>("/hr/job-titles", FALLBACK_JOB_TITLES);
}
