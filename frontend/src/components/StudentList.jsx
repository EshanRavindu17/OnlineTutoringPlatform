import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TutorList = () => {
  const [students, setTutors] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/students/')
      .then(response => {
        setTutors(response.data);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4"> students</h1>
      <ul>
        {students.map(student => (
          <li key={student.id} className="mb-2 p-2 border rounded">
            <p><strong>ID:</strong> {student.id}</p>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Expertise:</strong> {student.email}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TutorList;
