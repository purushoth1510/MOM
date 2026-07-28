import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AIChatWidget from "../components/AIChatWidget";

import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteMeetingApi,
  getMeetings,
  updateMeeting,
} from "../services/api";

function Meetings() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "employee";
  const canEditMeetings =
    role === "admin" || role === "super_admin";
  const canDeleteMeetings = role === "super_admin";
  const canManageMeetings =
    canEditMeetings || canDeleteMeetings;

  const [meetings, setMeetings] =
    useState([]);

  const [filter, setFilter] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editId, setEditId] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [date, setDate] =
    useState("");

  const [platform, setPlatform] =
    useState("Google Meet");

  const [status, setStatus] =
    useState("Processed");

  const [duration, setDuration] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadMeetings = useCallback(async () => {

      try {

        setLoading(true);

        setError("");

        const response =
          await getMeetings(page, 10);

        setMeetings(
          response.data || []
        );

        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          total_pages:
            response.total_pages,
        });

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
  }, [page]);

  useEffect(() => {

    loadMeetings();

  }, [loadMeetings]);

  // FORMAT DATE

  const formatDate = (date) => {

    if (!date) return "No Date";

    const options = {
      month: "short",
      day: "numeric",
    };

    return new Date(date).toLocaleDateString(
      "en-US",
      options
    );
  };

  // ADD / SAVE

  const saveMeeting = async () => {

    if (editId) {

      await updateMeeting(
        editId,
        {
          meeting_title: title,
          status,
        }
      );

      await loadMeetings();
    }

    closeModal();
  };

  // EDIT

  const editMeeting = (meeting) => {

    setEditId(meeting.meeting_id);

    setTitle(
      meeting.meeting_title || ""
    );

    setDuration(
      meeting.duration || ""
    );

    setDate(
      meeting.uploaded_at
        ? meeting.uploaded_at.slice(0, 10)
        : ""
    );

    setPlatform(
      meeting.platform || "Uploaded Audio"
    );

    setStatus(
      meeting.status || "Processed"
    );

    setShowModal(true);
  };

  // DELETE

  const deleteMeeting = async (id) => {

    await deleteMeetingApi(id);

    await loadMeetings();
  };

  // CLOSE MODAL

  const closeModal = () => {

    setShowModal(false);

    setEditId(null);

    setTitle("");

    setDuration("");

    setDate("");

    setPlatform("Google Meet");

    setStatus("Processed");
  };

  // FILTER

  const filteredMeetings =
    meetings.filter((meeting) => {

      const meetingStatus =
        meeting.status || "Processed";

      const matchesFilter =
        filter === "All"
          ? true
          : meetingStatus === filter;

      const matchesSearch =
        (meeting.meeting_title || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchesFilter &&
        matchesSearch
      );
    });

  return (
    <div className="flex bg-[#edf4f1] min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <div className="p-10">

          {/* HEADER */}

          <div className="flex justify-between items-center">

            <div>

              <h1 className="text-5xl font-bold">
                Meetings
              </h1>

              <p className="text-gray-500 mt-2">
                Every meeting captured by MinutesAI
              </p>

            </div>

          </div>

          {/* SEARCH + FILTER */}

          <div className="flex gap-5 mt-10">

            <input
              type="text"
              placeholder="Search meetings"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="border border-gray-200 p-4 rounded-2xl w-[500px] bg-white outline-none"
            />

            <div className="flex gap-3 bg-white p-2 rounded-full">

              {[
                "All",
                "Processed",
                "Processing",
                "Draft",
              ].map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    setFilter(item)
                  }
                  className={
                    filter === item
                      ? "bg-green-600 text-white px-5 py-2 rounded-full"
                      : "px-5 py-2 rounded-full"
                  }
                >
                  {item}
                </button>

              ))}

            </div>

          </div>

          {/* TABLE */}

          <div className="bg-white rounded-3xl mt-10 overflow-hidden shadow-sm">

            {/* HEADER */}

            <div
              className={`grid ${
                canManageMeetings ? "grid-cols-6" : "grid-cols-5"
              } p-6 text-gray-500 border-b font-medium`}
            >
              <p className="pl-2">MEETING</p>

              <p className="text-center">
                DATE
              </p>

              <p className="text-center">
                PLATFORM
              </p>

              <p className="text-center">
                STATUS
              </p>

              <p className="text-center">
                ACTION
              </p>

              {canManageMeetings && (
                <p className="text-center">
                  MANAGE
                </p>
              )}
            </div>

            {/* DATA */}

            {loading && (

              <div className="p-6 text-gray-500">
                Loading meetings...
              </div>

            )}

            {error && (

              <div className="p-6 text-red-500">
                {error}
              </div>

            )}

            {!loading &&
              !error &&
              filteredMeetings.map((meeting) => (

              <div
          key={meeting.meeting_id}
          className={`grid ${
            canManageMeetings ? "grid-cols-6" : "grid-cols-5"
          } items-center p-6 border-b`}
        >

          <div className="pl-2">

            <h2 className="font-semibold text-lg">
              {meeting.meeting_title}
            </h2>

            {(role === "admin" || role === "super_admin") && (meeting.owner_email || meeting.email) && (
              <p className="text-sm text-gray-500 mt-1">
                Uploaded By: {meeting.owner_email || meeting.email}
              </p>
            )}

          </div>

          <p className="text-center">
            {formatDate(meeting.uploaded_at)}
          </p>

          <p className="text-center">
            {meeting.platform || "Uploaded Audio"}
          </p>

          <div className="flex justify-center">

            <span
              className={
                meeting.status === "Processed"
                  ? "bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm"
                  : meeting.status === "Processing"
                  ? "bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full text-sm"
                  : "bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm"
              }
            >
              {meeting.status || "Processed"}
            </span>

          </div>

          <div className="flex justify-center">

            <button
              onClick={() =>
                navigate(`/meetings/${meeting.meeting_id}`)
              }
              className="text-green-600 font-medium"
            >
              Open
            </button>

          </div>

          {canManageMeetings && (
            <div className="flex justify-center gap-2">
              {canEditMeetings && (
                <button
                  onClick={() =>
                    editMeeting(meeting)
                  }
                  className="border px-4 py-2 rounded-xl text-sm hover:bg-gray-100"
                >
                  Edit
                </button>
              )}

              {canDeleteMeetings && (
                <button
                  onClick={() =>
                    deleteMeeting(meeting.meeting_id)
                  }
                  className="border border-red-300 text-red-500 px-4 py-2 rounded-xl text-sm hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          )}

        </div>

            ))}

          </div>

          <div className="flex justify-center items-center gap-3 mt-6">

            <button
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1)
                )
              }
              disabled={page === 1}
              className="bg-white px-4 py-2 rounded-xl border disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from(
              {
                length:
                  pagination.total_pages,
              },
              (_, index) => index + 1
            ).map((pageNumber) => (

              <button
                key={pageNumber}
                onClick={() =>
                  setPage(pageNumber)
                }
                className={
                  page === pageNumber
                    ? "bg-green-600 text-white px-4 py-2 rounded-xl"
                    : "bg-white px-4 py-2 rounded-xl border"
                }
              >
                {pageNumber}
              </button>

            ))}

            <button
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    current + 1,
                    pagination.total_pages || 1
                  )
                )
              }
              disabled={
                page >=
                pagination.total_pages
              }
              className="bg-white px-4 py-2 rounded-xl border disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      <AIChatWidget />

      {/* MODAL */}

      {showModal && canEditMeetings && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl w-[500px] shadow-xl">

            <h2 className="text-2xl font-semibold mb-6">

              {editId
                ? "Edit Meeting"
                : "Add Meeting"}

            </h2>

            <div className="space-y-5">

              <input
                type="text"
                placeholder="Meeting Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full border p-4 rounded-xl outline-none"
              />

              <input
                type="text"
                placeholder="Duration (48 min)"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                className="w-full border p-4 rounded-xl outline-none"
              />

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="w-full border p-4 rounded-xl outline-none"
              />

              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value)
                }
                className="w-full border p-4 rounded-xl outline-none"
              >

                <option>
                  Google Meet
                </option>

                <option>
                  Zoom
                </option>

                <option>
                  Teams
                </option>

              </select>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full border p-4 rounded-xl outline-none"
              >

                <option>
                  Processed
                </option>

                <option>
                  Processing
                </option>

                <option>
                  Draft
                </option>

              </select>

            </div>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-xl border"
              >
                Cancel
              </button>

              <button
                onClick={saveMeeting}
                className="bg-green-600 text-white px-5 py-2 rounded-xl"
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Meetings;