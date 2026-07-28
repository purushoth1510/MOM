import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AIChatWidget from "../components/AIChatWidget";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "../services/api";


const API_URL = "http://localhost:8000";



function Tasks() {
  const role = localStorage.getItem("role") || "employee";
  const canEditTasks = role === "admin" || role === "super_admin";
  const canDeleteTasks = role === "super_admin";


  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);


  const [filter, setFilter] = useState("all");


  const [newTask, setNewTask] = useState("");

  const [dueDate, setDueDate] = useState("");

  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

  const [newTaskDescription, setNewTaskDescription] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);



  // EDIT MODAL

  const [showEditModal, setShowEditModal] =
    useState(false);


  const [currentTaskId, setCurrentTaskId] =
    useState(null);


  const [editText, setEditText] =
    useState("");


  const [editTaskDate, setEditTaskDate] =
    useState("");

  const [taskError, setTaskError] = useState("");





  // =========================
  // GET TASKS FROM MONGODB
  // =========================

  const fetchTasks = async()=>{


    try{


      setLoading(true);


      const response = await fetchWithAuth(
        `${API_URL}/api/tasks`
      );


      const result = await response.json();


      setTasks(
        result.data || []
      );


    }
    catch(error){

      console.log(
        "Fetch tasks error:",
        error
      );

    }
    finally{

      setLoading(false);

    }

  };





  useEffect(()=>{

    fetchTasks();

  },[]);








  // =========================
  // ADD TASK
  // =========================


  const addTask = async () => {

  if (!newTask.trim()) {
    setTaskError("Please enter a task.");
    return;
  }

  setTaskError("");

  try {

    const response = await fetchWithAuth(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({

        meeting_id: null,        // Manual task
        task: newTask,
        description: newTaskDescription || null,
        owner: "You",
        deadline: dueDate || null,
        priority: newTaskPriority

      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    const result = await response.json();

    console.log(result);

    setNewTask("");
    setDueDate("");
    setNewTaskPriority("Medium");
    setNewTaskDescription("");
    setShowAddModal(false);

    fetchTasks();

    window.dispatchEvent(new Event("tasksUpdated"));

  } catch (error) {

    console.error("Add Task Error:", error);

  }
};








  // =========================
  // COMPLETE TASK
  // =========================


  const toggleTask = async(task)=>{


    try{


      await fetchWithAuth(

        `${API_URL}/api/tasks/${task._id}`,

        {

          method:"PUT",

          headers:{

            "Content-Type":
            "application/json"

          },


          body:JSON.stringify({

            completed:
            !task.completed,


            status:
            !task.completed
            ?
            "Completed"
            :
            "Open"

          })

        }

      );


      fetchTasks();
      window.dispatchEvent(new Event("tasksUpdated"));


    }
    catch(error){

      console.log(error);

    }


  };









  // =========================
  // DELETE TASK
  // =========================


  const deleteTask = async(id)=>{


    try{


      await fetchWithAuth(

        `${API_URL}/api/tasks/${id}`,

        {

          method:"DELETE"

        }

      );


      fetchTasks();


    }
    catch(error){

      console.log(error);

    }

  };









  // =========================
  // EDIT MODAL OPEN
  // =========================


  const openEditModal=(task)=>{


    setCurrentTaskId(
      task._id
    );


    setEditText(
      task.task
    );


    setEditTaskDate(
      task.deadline || ""
    );


    setShowEditModal(true);


  };









  // =========================
  // SAVE EDIT
  // =========================


  const saveEdit = async()=>{


    try{


      await fetchWithAuth(

        `${API_URL}/api/tasks/${currentTaskId}`,

        {

          method:"PUT",

          headers:{

            "Content-Type":
            "application/json"

          },


          body:JSON.stringify({

            task:editText,

            deadline:editTaskDate

          })

        }

      );


      setShowEditModal(false);


      fetchTasks();


    }
    catch(error){

      console.log(error);

    }


  };









  // DATE FORMAT

  const formatDate=(date)=>{


    if(!date)
      return "No Date";


    return new Date(date)
      .toLocaleDateString(

        "en-US",

        {

          month:"short",

          day:"numeric"

        }

      );

  };









  // FILTER

  const filteredTasks = tasks.filter(
    (task)=>{


      if(filter==="undone")
        return !task.completed;


      if(filter==="done")
        return task.completed;


      return true;


    }
  );









  if(loading){

    return (

      <div className="flex justify-center items-center h-screen">

        <h2 className="text-2xl font-semibold">

          Loading Tasks...

        </h2>

      </div>

    );

  }









  return (

    <div className="flex bg-[#edf4f1] min-h-screen">


      <Sidebar />


      <div className="flex-1">


        <Topbar />



        <div className="p-10">



          <h1 className="text-5xl font-bold">

            Tasks

          </h1>



          <p className="text-gray-500 mt-2">

            Auto-extracted from meetings

          </p>

          {taskError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {taskError}
            </div>
          )}










          <div className="mt-10 flex justify-end">
            <button
              onClick={() => {
                setTaskError("");
                setNewTask("");
                setDueDate("");
                setNewTaskPriority("Medium");
                setNewTaskDescription("");
                setShowAddModal(true);
              }}
              className="bg-green-600 text-white px-6 py-4 rounded-2xl"
            >
              + Add Task
            </button>
          </div>

          {/* FILTER */}
          <div className="flex gap-4 mt-10">
            {['all', 'undone', 'done'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={
                  filter === type
                    ? "bg-green-600 text-white px-6 py-3 rounded-full"
                    : "bg-white px-6 py-3 rounded-full"
                }
              >
                {type}
              </button>
            ))}
          </div>









          {/* TASK LIST */}


          <div className="bg-white rounded-3xl mt-10 overflow-hidden shadow-sm">


          {
            filteredTasks.length===0

            ?

            <div className="p-10 text-gray-500">

              No Tasks Found

            </div>


            :


            filteredTasks.map((task)=>(



              <div

              key={task._id}

              className="flex justify-between items-center p-6 border-b"

              >



                <div className="flex gap-5 items-start">



                  <input

                  type="checkbox"

                  checked={
                    task.completed
                  }

                  onChange={()=>
                    toggleTask(task)
                  }

                  className="mt-2"

                  />




                  <div>


                  <h2

                  className={

                  task.completed

                  ?

                  "line-through text-gray-400 font-semibold text-lg"

                  :

                  "font-semibold text-lg"

                  }

                  >

                  {task.task}

                  </h2>



                <p className="text-gray-500 text-sm mt-1">
                    {task.priority}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                    Assigned To: {task.owner || "Unassigned"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                    Due {formatDate(task.deadline)}
                </p>
                {(role === "admin" || role === "super_admin") && (task.owner_email || task.email) && (
                  <p className="text-sm text-gray-500 mt-1">
                    Uploaded By: {task.owner_email || task.email}
                  </p>
                )}


                  </div>



                </div>








                {(canEditTasks || canDeleteTasks) && (
                <div className="flex gap-3">



                {canEditTasks && (
                <button

                onClick={()=>
                  openEditModal(task)
                }

                className="border px-4 py-2 rounded-xl"

                >

                Edit

                </button>
                )}

                {canDeleteTasks && (
                  <button
                    onClick={()=>
                      deleteTask(task._id)
                    }
                    className="border border-red-300 text-red-500 px-4 py-2 rounded-xl"
                  >
                    Delete
                  </button>
                )}

                </div>
                )}






              </div>


            ))

          }


          </div>







        </div>


      </div>









      {/* ADD TASK MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-[420px]">
            <h2 className="text-2xl font-semibold mb-5">Add New Task</h2>

            {taskError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                {taskError}
              </div>
            )}

            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Task name"
              className="border p-4 w-full rounded-xl"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-4 w-full rounded-xl mt-4"
            />

            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description"
              rows="3"
              className="border p-4 w-full rounded-xl mt-4"
            />

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="border p-4 w-full rounded-xl mt-4"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setTaskError("");
                }}
                className="border px-5 py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={addTask}
                className="bg-green-600 text-white px-5 py-2 rounded-xl"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}



      {/* EDIT MODAL */}


      {
      showEditModal && canEditTasks && (


      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">


      <div className="bg-white p-8 rounded-3xl w-[420px]">


      <h2 className="text-2xl font-semibold mb-5">

      Edit Task

      </h2>




      <input

      value={editText}

      onChange={(e)=>
        setEditText(e.target.value)
      }

      className="border p-4 w-full rounded-xl"

      />





      <input

      type="date"

      value={editTaskDate}

      onChange={(e)=>
        setEditTaskDate(e.target.value)
      }

      className="border p-4 w-full rounded-xl mt-4"

      />





      <div className="flex justify-end gap-3 mt-6">


      <button

      onClick={()=>
        setShowEditModal(false)
      }

      className="border px-5 py-2 rounded-xl"

      >

      Cancel

      </button>





      <button

      onClick={saveEdit}

      className="bg-green-600 text-white px-5 py-2 rounded-xl"

      >

      Save

      </button>



      </div>





      </div>


      </div>


      )
      }








      <AIChatWidget />

    </div>

  );

}



export default Tasks;