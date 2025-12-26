import React from 'react';
import Button1 from '../components/Button1';
import '../styles/SingleplayerLobby.css';
import { useState, useEffect } from 'react';
import api from '../api/api';

function SingleplayerLobby() {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const onCourseSelectClicked = (courseId) => {
    setSelectedCourses((prevSelected) =>
      prevSelected.includes(courseId)
        ? prevSelected.filter((id) => id !== courseId)
        : [...prevSelected, courseId]
    );
  };

  useEffect(() => {
    api
      .get('/public/question_sets')
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  return (
    <div className="container">
      <form className="block2">
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="gameName">SINGLEPLAYER ROOM</div>
        <div className="block4">
          <div className="elementOfBlock4">
            <h2 className="elmHeader">CHOOSE COURSES</h2>
            <div className="Forms-qSets-expanded">
              {courses && courses.length > 0 ? (
                courses.map((course) => {
                  const isSelected = selectedCourses.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`courseCard ${isSelected ? 'selected' : ''}`}
                      onClick={() => onCourseSelectClicked(course.id)}
                    >
                      <div className="courseTitle">{course.title}</div>
                      <div className="courseDescription">{course.description}</div>
                    </div>
                  );
                })
              ) : (
                <div className="noItemsMessage">No courses available. </div>
              )}
            </div>
          </div>
          <div className="start">
            <h2 className="elmHeader">READY?</h2>
            <button type="submit" className="startBtn">
              START!
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SingleplayerLobby;
