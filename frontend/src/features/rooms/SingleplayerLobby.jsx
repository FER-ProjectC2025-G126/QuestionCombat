import Button1 from '../../components/Button1';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import api from '../../api/api';
import useSocket from "../socket/useSocket"
import Background from "../../components/Background.jsx";

function SingleplayerLobby() {
  const { isConnected, isLoading, appState, createRoom } = useSocket();
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

  const onSubmitClicked = (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Not connected to server!');
      return;
    }

    createRoom({
      maxPlayers: 1,
      visibility: "private",
      questionSetIds: selectedCourses,
    });
  };

  if (isLoading || !appState) {
    return <div className="loader">Connecting to server...</div>;
  }

  if (appState.type === 'room') {
    return <Navigate to="/lobby" />;
  }

  return (
    <Background>
      <form className="block2" onSubmit={onSubmitClicked}>
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="gameName">SINGLEPLAYER ROOM</div>
        <div className="block7">
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
    </Background>
  );
}

export default SingleplayerLobby;
