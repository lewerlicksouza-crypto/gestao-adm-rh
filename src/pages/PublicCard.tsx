import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function PublicCard() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then(setEmployee)
      .catch(console.error);
  }, [id]);

  if (!employee) return <div>Carregando...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{employee.fullName}</h1>
      <p>{employee.jobTitle}</p>
      <p>{employee.email}</p>
      <p>{employee.phone}</p>
    </div>
  );
}
