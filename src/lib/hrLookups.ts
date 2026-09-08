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

export function useEmployeeLookups() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  useEffect(() => {
    api
      .get<Employee[]>("/hr/employees")
      .then((rows) =>
        setEmployees(
          rows.map((e) => ({
            id: e.id,
            label: `${e.employee_number} · ${e.first_name} ${e.last_name}`,
          })),
        ),
      )
      .catch(() => setEmployees([]));
  }, []);

  return { employees };
}

function useHrLookup<T extends HrLookupOption>(path: string) {
  const [options, setOptions] = useState<T[]>([]);

  useEffect(() => {
    api
      .get<T[]>(path)
      .then(setOptions)
      .catch(() => setOptions([]));
  }, [path]);

  return options;
}

export function useDepartmentLookups() {
  return useHrLookup<Department>("/hr/departments");
}

export function useJobTitleLookups() {
  return useHrLookup<JobTitle>("/hr/job-titles");
}
