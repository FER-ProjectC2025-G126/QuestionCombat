import Button1 from '../components/Button1';
import { useState, useEffect } from 'react';
import api from '../api/api';

const Public = () => {
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
      <div id="q1" className="falling-question" style={{ left: '5vw' }}>?</div>
      <div id="q2" className="falling-question" style={{ left: '15vw' }}>?</div>
      <div id="q3" className="falling-question" style={{ left: '83vw' }}>?</div>
      <div id="q4" className="falling-question" style={{ left: '93vw' }}>?</div>
      <div className="publicBlock">
        <div className="publicTitle">Welcome to Question Combat</div>
        <div className="coursesBlock">
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
        <Button1 to="/login" text="To start playing please Log In!" className="btn" />
      </div>
    </div>
  );
};

export default Public;
