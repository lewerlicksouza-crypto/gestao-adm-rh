import { useEffect, useState } from "react";

type Employee = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then(setEmployees)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Funcionários</h1>

      {employees.map((emp) => (
        <div key={emp.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <strong>{emp.fullName}</strong>
          <p>{emp.jobTitle}</p>
          <p>{emp.email}</p>
        </div>
      ))}
    </div>
  );
}
