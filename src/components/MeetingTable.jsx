function MeetingTable({ meetings }) {

  return (
    <div className="bg-white rounded-3xl mt-10 overflow-hidden">

      <div className="grid grid-cols-5 p-5 font-semibold text-gray-500 border-b">
        <p>MEETING</p>
        <p>DATE</p>
        <p>PLATFORM</p>
        <p>STATUS</p>
        <p>ACTION</p>
      </div>

      {meetings.map((meeting) => (

        <div
          key={meeting.id}
          className="grid grid-cols-5 p-6 border-b items-center"
        >

          <div>

            <h2 className="font-bold text-lg">
              {meeting.title}
            </h2>

            <p className="text-gray-500">
              {meeting.duration}
            </p>

          </div>

          <p>{meeting.date}</p>

          <p>{meeting.platform}</p>

          <p>

            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
              {meeting.status}
            </span>

          </p>

          <button className="text-green-600 font-semibold">
            Open
          </button>

        </div>

      ))}

    </div>
  );
}

export default MeetingTable;