import Button1 from '../components/Button1';
import { useState, useEffect } from 'react';
import api from '../api/api';

const ListOfCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api
      .get('/public/question_sets')
      .then((response) => {
        setCourses(response.data);
      })
      .catch(() => {
        // Handle error silently or show user message
      });
  }, []);
  return (
    <div className="container">
      <div className="publicBlock">
        <div className="coursesBlock">
          <Button1 to="/home" text="BACK" className="backBtn" />
          <h2 className="coursesTitle">Available Courses</h2>
          <div className='Forms-qSets-expanded'>
              {courses && courses.length > 0 ? (
              courses.map((course) => {
                 return (
                  <div
                    key={course.id}
                    className="courseCard-view"
                  >
                  <div className="courseTitle">{course.title}</div>
                  <div className="courseDescription">{course.description}</div>
                  </div>
                 );
            })
          ) : (
            <div className="noItemsMessage">No courses available.</div>
          )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ListOfCourses;
