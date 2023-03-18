/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from './Header'
import { Tasks } from './Tasks'
import CreateTask from './CreateTask'
import { TaskService} from '../services/TaskService'
import { PhotoService } from '../services/PhotoService';

function Home() {

  const [tasks, setTasks] = useState([])
  const [numberOfTasks, setNumberOfTasks] = useState<number>(0)
  const [isTaskEdited, setTaskEdited] = useState(false)

  const taskService = new TaskService();
  const photoService = new PhotoService();

  useEffect(() => {
    taskService.getAllTasks().then(tasks => {
        console.log(tasks)
        setTasks(tasks)
      });
  }, [numberOfTasks, isTaskEdited])

  function delTask(taskId: number) {
    taskService.deleteTask(taskId).then(response => {
        console.log(response)
        setNumberOfTasks(numberOfTasks - 1)
      });
  }

  function taskCreated() {
    setNumberOfTasks(numberOfTasks + 1)
  }

  function taskEdited(res: any) {
     setTaskEdited(res)
  }

  
  function getPhotoList(taskId: number) {
    photoService.getPhotoListFromFolder('C%3A%5CUsers%5Cburak%5CPictures%5C%2722%20Istanbul%5C4%5C').then(tasks => {
        console.log(tasks)

      });
    }
    
  return (
    <><img style={{ display: 'block', WebkitUserSelect: 'none', margin: 'auto', cursor: 'zoom-in', backgroundColor: 'hsl(0, 0%, 90%)', transition: 'background-color 300ms' }} src="http://localhost:3333/?image=0H7A9097.JPG" width={882} height={588} /><Header></Header><div className="container mrgnbtm">
      <div className="row">
        <div className="col-md-12">
          <CreateTask taskCreated={taskCreated}></CreateTask>
        </div>
      </div>
    </div><div className="container mrgnbtm">
        <Tasks tasks={tasks} deleteTask={delTask} taskEdited={taskEdited}></Tasks>
      </div></>
  );
}

export default Home;
