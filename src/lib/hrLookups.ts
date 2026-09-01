"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { Employee } from "./types";

export interface EmployeeOption {
  id: number;
  label: string;
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
