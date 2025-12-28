import Button1 from '../../components/Button1';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import useSocket from '../socket/useSocket';
import api from '../../api/api';

function CreateNewGame() {
  const { isConnected, isLoading, appState, createRoom } = useSocket();
  const [numOfPlayers, setNumOfPlayers] = useState('');
  const [gameType, setGameType] = useState('');
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);


  const onNumOfPlayersChange = (e) => setNumOfPlayers(e.target.value);
  const onGameTypeChange = (e) => setGameType(e.target.value);
  const onCourseSelectClicked = (courseId) => {
    setSelectedCourses((prevSelected) =>
    prevSelected.includes(courseId)
      ? prevSelected.filter((id) => id !== courseId) 
      : [...prevSelected, courseId]                
  );
  }

  const onSubmitClicked = (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Not connected to server!');
      return;
    }

    if (!numOfPlayers) {
      setError('Please select number of players');
      return;
    }

    if (!gameType) {
      setError('Please select game type');
      return;
    }

    setError('');

    createRoom({
      maxPlayers: Number(numOfPlayers),
      visibility: gameType,
      questionSetIds: selectedCourses,
    });
  };

  useEffect(() => {
    api
      .get('/public/question_sets')
      .then((response) => {
        setCourses(response.data);
        console.log(response.data)
      })
      .catch((error) => {
       console.log(error.message);
      });
  }, []);

  if (isLoading || !appState) {
    return <div className="loader">Connecting to server...</div>;
  }

  if (appState.type === 'room') {
    return <Navigate to="/lobby" />;
  }

  return (
    <div className="container">
      <form className="block2" onSubmit={onSubmitClicked}>
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="gameName">NEW ROOM</div>
        <div className="block3">
          <div className="elementOfBlock3">
            <h2 className="elmHeader">CHOOSE NUMBER OF PLAYERS</h2>
            <div className="Forms">
              <label className="Labels">
                <span>2 players</span>
                <input type="radio" name="players" value="2" onChange={onNumOfPlayersChange} />
              </label>

              <label className="Labels">
                <span>3 players</span>
                <input type="radio" name="players" value="3" onChange={onNumOfPlayersChange} />
              </label>

              <label className="Labels">
                <span>4 players</span>
                <input type="radio" name="players" value="4" onChange={onNumOfPlayersChange} />
              </label>
            </div>
          </div>
          <div className="elementOfBlock3">
            <h2 className="elmHeader">CHOOSE COURSES</h2>
            <div className='Forms-qSets'>
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
            <div className="noItemsMessage">No courses available.</div>
          )}
            </div>
          </div>
          <div className="elementOfBlock3">
            <h2 className="elmHeader">PRIVATE OR PUBLIC?</h2>
            <div className="Forms">
              <label className="Labels">
                <span>private</span>
                <input type="radio" name="gameType" value="private" onChange={onGameTypeChange} />
              </label>

              <label className="Labels">
                <span>public</span>
                <input type="radio" name="gameType" value="public" onChange={onGameTypeChange} />
              </label>
            </div>
          </div>
          <div className="elementOfBlock3">
            <h2 className="elmHeader">READY?</h2>
            <button type="submit" className="startBtn">
              START!
            </button>
            {error && <div className="error">{error}</div>}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateNewGame;
