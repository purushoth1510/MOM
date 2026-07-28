function TaskList({ taskList, toggleTask }) {

  return (
    <div className="bg-white rounded-3xl mt-10 overflow-hidden">

      {taskList.map((task) => (

        <div
          key={task.id}
          className="flex justify-between items-center p-6 border-b"
        >

          <div className="flex gap-5">

            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
            />

            <div>

              <h2
                className={
                  task.done
                    ? "line-through text-gray-400"
                    : "font-bold"
                }
              >
                {task.task}
              </h2>

              <p className="text-gray-500">
                {task.user} • due {task.due}
              </p>

            </div>

          </div>

          <div>
            {task.done ? "Completed" : "Open"}
          </div>

        </div>

      ))}

    </div>
  );
}

export default TaskList;