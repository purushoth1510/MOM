import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AIChatWidget from "../components/AIChatWidget";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMeetings, fetchWithAuth, getScheduledMeetings, deleteScheduledMeeting, finishScheduledMeeting, createNotification } from "../services/api";
import ScheduleMeetingModal from "../components/ScheduleMeetingModal";
import ViewScheduledMeetingModal from "../components/ViewScheduledMeetingModal";
import { UserContext } from "../context/UserContext";



const API_URL = "http://localhost:8000";


function Dashboard() {


  const navigate = useNavigate();
  const location = useLocation(); 
  const { user, searchQuery } = useContext(UserContext);


  const [meetings, setMeetings] =
    useState([]);


  const [tasks, setTasks] =
    useState([]);


  const [stats, setStats] =
    useState([]);


  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduledMeeting, setSelectedScheduledMeeting] = useState(null);
  const [remindedMeetingIds, setRemindedMeetingIds] = useState([]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");



  const displayName =
    (localStorage.getItem("username") || "")
      .split("@")[0];




  useEffect(() => {


    const loadDashboard = async () => {


      try {


        setLoading(true);

        setError("");



        // GET MEETINGS

        const response =
          await getMeetings(1,5);



        const recentMeetings =
          response.data || [];



        setMeetings(recentMeetings);





        // GET TASKS FROM MONGODB

        const taskResponse =
          await fetchWithAuth(
            `${API_URL}/api/tasks`
          );



        if(!taskResponse.ok){

          throw new Error(
            "Failed to fetch tasks"
          );

        }



        const taskData =
          await taskResponse.json();



        setTasks(
          taskData.data || []
        );

        const scheduledResponse = await getScheduledMeetings();
        setScheduledMeetings(scheduledResponse.data || []);






        // STATS

        setStats([

          {
            title:"Total Meetings",
            value: response.total || 0,
          },


          {
            title:"Completed Meetings",
            value:
              recentMeetings.filter(
                (meeting)=>
                  (meeting.status || "Processed")
                  ===
                  "Processed"
              ).length,
          },


          {
            title:"Pending Action Items",
            value:
              recentMeetings.reduce(
                (total,meeting)=>
                  total +
                  (meeting.action_items || []).length,
                0
              ),
          },


          {
            title:"Recent Meetings",
            value:
              recentMeetings.length,
          }

        ]);



      }
      catch(err){


        console.log(
          "Dashboard error:",
          err
        );


        setError(
          err.message
        );


      }
      finally{


        setLoading(false);


      }


    };



    loadDashboard();


  }, [location]);


  useEffect(() => {

  const reloadTasks = async () => {

    try {

      const response = await fetchWithAuth(`${API_URL}/api/tasks`);

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      setTasks(result.data || []);

    } catch (err) {

      console.log("Dashboard task reload error:", err);

    }

  };

  window.addEventListener("tasksUpdated", reloadTasks);

  return () => {

    window.removeEventListener("tasksUpdated", reloadTasks);

  };

}, []);


  const toggleTaskComplete = async (task) => {

    if (task.completed) {
      return;
    }

    try {

      const response = await fetchWithAuth(
        `${API_URL}/api/tasks/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: true,
            status: "Completed",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks((current) =>
        current.map((item) =>
          item._id === task._id
            ? { ...item, completed: true, status: "Completed" }
            : item
        )
      );

      window.dispatchEvent(new Event("tasksUpdated"));

    } catch (err) {

      console.log("Dashboard task update error:", err);

      setError(err.message || "Failed to update task");

    }

  };



  const todayDateString = new Date().toISOString().split('T')[0];

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hourStr, minuteStr] = timeString.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 
    return `${hour}:${minuteStr} ${ampm}`;
  };

  const upcomingScheduledMeetings = scheduledMeetings.filter(meeting => {
    if (meeting.date < todayDateString || meeting.status === 'Finished') return false;
    if (searchQuery && !meeting.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredMeetings = meetings.filter(meeting => {
    if (!searchQuery) return true;
    const title = meeting.title || meeting.meeting_title || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingTasks = tasks.filter((t) => t.status !== "Completed" && t.status !== "Archived");
  const filteredTasks = pendingTasks.filter(task => {
    if (!searchQuery) return true;
    const title = task.title || task.task || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    const checkUpcomingMeetings = () => {
      const now = new Date();
      upcomingScheduledMeetings.forEach(async (meeting) => {
        if (remindedMeetingIds.includes(meeting.id)) return;
        
        const meetingDate = new Date(`${meeting.date}T${meeting.time}:00`);
        const timeDiffMs = meetingDate - now;
        const timeDiffMins = timeDiffMs / (1000 * 60);

        // Notify if meeting is within the next 15 minutes, or started up to 5 minutes ago
        if (timeDiffMins >= -5 && timeDiffMins <= 15) {
          try {
            await createNotification({
              title: "Upcoming Meeting Reminder",
              message: `Your meeting "${meeting.title}" is starting in ${Math.max(0, Math.ceil(timeDiffMins))} minutes!`,
              target_email: user?.email || localStorage.getItem("email")
            });
            setRemindedMeetingIds(prev => [...prev, meeting.id]);
          } catch (e) {
            console.error("Failed to send reminder notification", e);
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingMeetings, 60000); 
    // Run once immediately
    checkUpcomingMeetings();
    return () => clearInterval(interval);
  }, [upcomingScheduledMeetings, remindedMeetingIds, user]);

  const getDynamicStatus = (meeting) => {
    if (meeting.status === 'Finished') return 'Finished';
    
    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.time}:00`);
    const diffMins = (now - meetingDate) / (1000 * 60);

    if (diffMins >= 0 && diffMins <= 15) {
      return "Time for meeting";
    } else if (diffMins > 15) {
      return "Ended";
    }
    return meeting.status || 'Upcoming';
  };

  return (


    <div className="flex min-h-screen bg-[#edf4f1]">


      <Sidebar />



      <div className="flex-1">


        <Topbar />



        <div className="p-8">




          {/* HEADER */}


          <div className="flex justify-between items-end mb-10 w-full">
            <div>
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-gray-500 mt-2 text-lg">Here's what's happened across your meetings.</p>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-2xl"
            >
              + New Meeting
            </button>
          </div>







          {
            loading &&

            <p className="text-gray-500 mt-8">

              Loading dashboard...

            </p>

          }



          {
            error &&

            <p className="text-red-500 mt-8">

              {error}

            </p>

          }








          {/* STATS */}


          <div className="grid grid-cols-4 gap-6 mt-10">


            {
              stats.map(
                (item,index)=>(


                <div

                  key={index}

                  className="bg-white p-8 rounded-3xl shadow-sm"

                >


                  <h3 className="text-gray-500">

                    {item.title}

                  </h3>



                  <h1 className="text-5xl font-bold mt-5">

                    {item.value}

                  </h1>


                </div>


              ))

            }


          </div>









          {/* CONTENT */}



          <div className="grid grid-cols-3 gap-6 mt-10">





            {/* MEETINGS */}



            <div className="col-span-2 bg-white rounded-3xl p-6 shadow-sm">


              <div className="flex justify-between items-center mb-6">


                <h2 className="text-2xl font-bold">

                  Recent Meetings

                </h2>



                <button

                  onClick={() =>
                    navigate("/meetings")
                  }

                  className="text-green-600 font-semibold"

                >

                  View all

                </button>


              </div>





              <div className="space-y-4 mt-4">
                {filteredMeetings.map((meeting) => (
                  <div
                    key={meeting.id || meeting.meeting_id}
                    onClick={() => navigate(`/meetings/${meeting.id || meeting.meeting_id}`)}
                    className="flex justify-between items-center border-b py-5 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div>
                      <h3 className="font-bold text-lg">{meeting.title || meeting.meeting_title}</h3>
                      <p className="text-gray-500">{meeting.date} at {meeting.time}</p>
                    </div>
                    <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                      {meeting.status || "Upcoming"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TASKS */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Tasks</h2>
                <button
                  onClick={() => navigate("/tasks")}
                  className="text-green-600 text-sm font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4 mt-2">
                {filteredTasks.slice(0,5).map((task) => (
                  <div key={task._id} className="flex items-start gap-4 mb-6">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTaskComplete(task)}
                      className="mt-1 cursor-pointer"
                    />
                    <div>
                      <h3 className="font-medium">{task.task}</h3>
                      <p className="text-gray-500 text-sm">
                        <span
                          className={
                            task.priority === "High"
                              ? "text-red-600 font-semibold"
                              : task.priority === "Medium"
                              ? "text-yellow-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          {task.priority}
                        </span>
                        {" • "} Due{" "}
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "No Date"}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <p className="text-gray-500">No pending tasks</p>
                )}
              </div>
            </div>
          </div>

          {/* SCHEDULED MEETINGS BOX */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mt-10">
            <h2 className="text-2xl font-bold mb-6">Scheduled Meetings</h2>
            {upcomingScheduledMeetings.length === 0 ? (
              <p className="text-gray-500">No upcoming meetings scheduled.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingScheduledMeetings.map((meeting) => {
                  const status = getDynamicStatus(meeting);
                  return (
                    <div 
                      key={meeting.id} 
                      className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-[#fafafa]"
                      onClick={() => setSelectedScheduledMeeting(meeting)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-800">{meeting.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          status === 'Time for meeting' ? 'bg-green-100 text-green-700' : 
                          status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <span className="font-semibold text-gray-700">{meeting.date}</span> at <span className="font-semibold text-gray-700">{formatTime(meeting.time)}</span>
                      </p>
                      <p className="text-gray-500 text-sm line-clamp-2">{meeting.agenda}</p>
                      {meeting.creator_role && meeting.user_email !== (user?.email || localStorage.getItem('email')) && (
                        <p className="mt-3 text-[11px] font-bold text-purple-600 bg-purple-100 inline-block px-2 py-1 rounded-md uppercase tracking-wider">
                          Assigned by {meeting.creator_role.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Floating AI Chat Widget */}
      <AIChatWidget />

      {showScheduleModal && (
        <ScheduleMeetingModal 
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            getScheduledMeetings().then(res => setScheduledMeetings(res.data || [])).catch(console.error);
          }}
        />
      )}

      {selectedScheduledMeeting && (
        <ViewScheduledMeetingModal 
          meeting={selectedScheduledMeeting}
          onClose={() => setSelectedScheduledMeeting(null)}
          onDelete={async (meetingId) => {
            try {
              await deleteScheduledMeeting(meetingId);
              setSelectedScheduledMeeting(null);
              // Refresh list
              getScheduledMeetings().then(res => setScheduledMeetings(res.data || [])).catch(console.error);
            } catch (err) {
              setError(err.message || "Failed to delete meeting");
              setSelectedScheduledMeeting(null);
            }
          }}
          onFinish={async (meetingId) => {
            try {
              await finishScheduledMeeting(meetingId);
              setSelectedScheduledMeeting(null);
              // Refresh list
              getScheduledMeetings().then(res => setScheduledMeetings(res.data || [])).catch(console.error);
            } catch (err) {
              setError(err.message || "Failed to mark meeting as finished");
              setSelectedScheduledMeeting(null);
            }
          }}
        />
      )}

    </div>
  );



}



export default Dashboard;