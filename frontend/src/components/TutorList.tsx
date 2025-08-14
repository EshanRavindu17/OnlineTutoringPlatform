import { useEffect, useState } from 'react';
import axios from 'axios';

interface Tutor {
  id: number;
  name: string;
  expertise: string;
}

const TutorList = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    axios.get<Tutor[]>('http://127.0.0.1:8000/api/tutors/')
      .then(response => {
        setTutors(response.data);
      })
      .catch(error => {
        console.error('Error fetching tutors:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Available Tutors</h1>
      <ul>
        {tutors.map(tutor => (
          <li key={tutor.id} className="mb-2 p-2 border rounded">
            <p><strong>ID:</strong> {tutor.id}</p>
            <p><strong>Name:</strong> {tutor.name}</p>
            <p><strong>Expertise:</strong> {tutor.expertise}</p>
            {/* Add more fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TutorList;
