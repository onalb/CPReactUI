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

type Photo = {
  name: string
  encodedPhoto: string
  directory: string
  content: string
};

function Home() {

  const [tasks, setTasks] = useState([])
  const [numberOfTasks, setNumberOfTasks] = useState<number>(0)
  const [isTaskEdited, setTaskEdited] = useState(false)
  const [photoList, setPhotoList] = useState([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const folder = 
  // null;
  // `C%3A%5CUsers%5Cburak%5CPictures%5C%2722%20Istanbul%5C4%5C`
  // 'C:\\Users\\burak\\Pictures\\\'22 Istanbul\\edited\\'
  // 'C:\\Users\\burak\\Pictures\\topaz\\raw\\'
  'C:\\Users\\burak\\Pictures\\sell\\90d\\'
  // `C:\\Users\\burak\\Pictures\\'23 tattoo convention\\`
  // `C:\\Users\\burak\\Pictures\\'23 philly\\`

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

  var photoService = new PhotoService();
  // useEffect(() => {
  //   if(folder) {
  //     photoService.getPhotoListFromFolder(folder).then(photoList => {
  //       console.log(photoList)
  //       setPhotoList(photoList)

  //       var bar = new Promise<void>((resolve, reject) => {
  //         var _photos: any[] = []
  //         photoList.forEach(async (_photo: any, index: number, array: string | any[]) => {
  //             console.log(_photo);
  //             var p = await photoService.getPhotoFromFolder(_photo.directory, _photo.name)
  //             _photos.push(p);
  //             if (index === array.length -1)
  //             {
  //               setPhotos(_photos);
  //               resolve();
  //             } 
  //         });

  //       }
  //       );
      
  //     bar.then((p) => {
  //         console.log('All done!');
  //     });
  //   });
  //   }

  // }, [])
  
  return (
    <>
    <Photos photos={ photos }></Photos>
    {
    /* <div className="container mrgnbtm">
      <div className="row">
        <div className="col-md-12">
          <CreateTask taskCreated={taskCreated}></CreateTask>
        </div>
      </div>
    </div>
    <div className="container mrgnbtm">
      <Tasks tasks={tasks} deleteTask={delTask} taskEdited={taskEdited}></Tasks>
    </div> */
    }    
    </>




  );
}

export default Home;
