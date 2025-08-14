import { useEffect, useState } from 'react';
import axios from 'axios';

interface Student {
  id: number;
  name: string;
  email: string;
}

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    axios.get<Student[]>('http://127.0.0.1:8000/api/students/')
      .then(response => {
        setStudents(response.data);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Students</h1>
      <ul>
        {students.map(student => (
          <li key={student.id} className="mb-2 p-2 border rounded">
            <p><strong>ID:</strong> {student.id}</p>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;
