/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from './Header'
import { Tasks } from './Tasks'
import { Photos } from './Photos'
import CreateTask from './CreateTask'
import { TaskService} from '../services/TaskService'
import { PhotoService } from '../services/PhotoService';
import { strict } from 'assert';
import { Button } from 'react-bootstrap';

// type Photo = {
//   name: string
//   encodedPhoto: string
//   folder: string
//   content: string
// };

function Home() {

  // const [tasks, setTasks] = useState([])
  // const [numberOfTasks, setNumberOfTasks] = useState<number>(0)
  // const [isTaskEdited, setTaskEdited] = useState(false)
  // const [photoList, setPhotoList] = useState([])
  // const [photos, setPhotos] = useState<Photo[]>([])
  const testfolder = 
  // null;
  // `C%3A%5CUsers%5Cburak%5CPictures%5C%2722%20Istanbul%5C4%5C`
  // 'C:\\Users\\burak\\Pictures\\\'22 Istanbul\\edited\\'
  // 'C:\\Users\\burak\\Pictures\\topaz\\raw\\'
  // 'C:\\Users\\burak\\Pictures\\sell\\90d\\'
  // `C:\\Users\\burak\\Pictures\\'23 tattoo convention\\`
  // `C:\\Users\\burak\\Pictures\\'23 philly\\`
  `C:\\Users\\burak\\Pictures\\\'23 Portland\\`

  // const taskService = new TaskService();

  // useEffect(() => {
  //   taskService.getAllTasks().then(tasks => {
  //       console.log(tasks)
  //       setTasks(tasks)
  //     });
  // }, [numberOfTasks, isTaskEdited])


  // function delTask(taskId: number) {
  //   taskService.deleteTask(taskId).then(response => {
  //       console.log(response)
  //       setNumberOfTasks(numberOfTasks - 1)
  //     });
  // }

  // function taskCreated() {
  //   setNumberOfTasks(numberOfTasks + 1)
  // }

  // function taskEdited(res: any) {
  //    setTaskEdited(res)
  // }

  const [folder, setFolder] = useState<string>('')
  useEffect(() => {
    console.log(folder);
  }, [folder])


  const changeFolder = (folder:string) => {
    setFolder(folder);
  };

  return (
    <>
    {/* <Button onClick={() => changeFolder('C:\\Users\\burak\\Pictures\\sell\\90d\\')}>Folder</Button> */}
    <Button onClick={() => changeFolder(testfolder)}>Folder</Button>
    {/* <Photos folder={ folder }></Photos> */}

    
    </>
  );
}

export default Home;
