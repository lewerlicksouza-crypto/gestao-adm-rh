export interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  company?: string;
  status: "active" | "inactive";
}

export interface Vacation {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  type: "30" | "20+10" | "15+15";
  status: "pending" | "approved" | "rejected";
  notes?: string;
}
