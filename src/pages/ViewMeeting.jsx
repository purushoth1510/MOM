
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import SummaryCard from "../components/SummaryCard";
import TranscriptViewer from "../components/TranscriptViewer";
import { getMeeting, getSummary } from "../services/api";
import { jsPDF } from "jspdf";

const normalizeMeeting = (data) => {
  if (!data) return null;

  const nested =
    data.summary && typeof data.summary === "object"
      ? data.summary
      : {};

  return {
    ...data,
    meeting_title:
      data.meeting_title || data.title || nested.title || "",
    meeting_summary:
      data.meeting_summary || nested.meeting_summary || "",
    executive_summary:
      data.executive_summary || nested.executive_summary || "",
    key_decisions:
      data.key_decisions ?? nested.key_decisions ?? [],
    action_items:
      data.action_items ?? nested.action_items ?? [],
    risks: data.risks ?? nested.risks ?? [],
    next_steps: data.next_steps ?? nested.next_steps ?? [],
    transcript: data.transcript ?? nested.transcript ?? "",
  };
};

function ViewMeeting() {

  const { id } =
    useParams();

  const [meeting, setMeeting] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [meetingStatus, setMeetingStatus] =
    useState("Recording");

  const [generating, setGenerating] =
    useState(false);

  const [showSummary, setShowSummary] =
    useState(false);

  const [summaryError, setSummaryError] =
    useState("");

  const [uploadedFileName, setUploadedFileName] =
    useState("");

  useEffect(() => {

    const loadMeeting = async () => {

      try {

        setLoading(true);

        setError("");

        const response =
          await getMeeting(id);

        setMeeting(normalizeMeeting(response));

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    };

    loadMeeting();

  }, [id]);

  useEffect(() => {

    const interval =
      setInterval(() => {

        setMeetingStatus(
          localStorage.getItem(
            "meeting_status"
          ) || "Stopped"
        );

        setUploadedFileName(
          localStorage.getItem(
            "uploaded_file"
          ) || ""
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  const generateSummary = async () => {

    try {

      setGenerating(true);
      setSummaryError("");

      const result = await getSummary(id);

      setMeeting((current) =>
        normalizeMeeting({
          ...current,
          meeting_title:
            result.summary?.title || current?.meeting_title,
          meeting_summary: result.summary?.meeting_summary,
          executive_summary: result.summary?.executive_summary,
          key_decisions: result.summary?.key_decisions,
          action_items: result.summary?.action_items,
          risks: result.summary?.risks,
          next_steps: result.summary?.next_steps,
          transcript: result.transcript,
          summary: result.summary,
        })
      );

      const refreshed = await getMeeting(id);

      setMeeting(normalizeMeeting(refreshed));
      setShowSummary(true);

    } catch (err) {

      setSummaryError(
        err.message || "Unable to generate summary."
      );

    } finally {

      setGenerating(false);
    }

  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    const addText = (text, size, isBold, textColor = [0, 0, 0]) => {
      if (!text) return;
      doc.setFontSize(size);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      // Handle array items or string
      const textString = Array.isArray(text) ? text.join("\n") : text.toString();
      const splitText = doc.splitTextToSize(textString, 180);
      
      // Check page boundary
      if (y + (splitText.length * 6) > 280) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(splitText, margin, y);
      y += (splitText.length * 6) + 4;
    };

    // Title
    addText(meeting?.meeting_title || "Meeting Summary", 20, true);
    y += 6;

    // Summary Sections
    if (meeting?.meeting_summary) {
      addText("Meeting Summary", 14, true, [100, 100, 100]);
      addText(meeting.meeting_summary, 12, false);
      y += 4;
    }

    if (meeting?.executive_summary) {
      addText("Executive Summary", 14, true, [100, 100, 100]);
      addText(meeting.executive_summary, 12, false);
      y += 4;
    }

    if (meeting?.key_decisions && meeting.key_decisions.length > 0) {
      addText("Key Decisions", 14, true, [100, 100, 100]);
      const decisions = meeting.key_decisions.map(d => `• ${d.decision || d}`);
      addText(decisions, 12, false);
      y += 4;
    }
    
    if (meeting?.risks && meeting.risks.length > 0) {
      addText("Risks", 14, true, [100, 100, 100]);
      const risks = meeting.risks.map(r => `• ${r}`);
      addText(risks, 12, false);
      y += 4;
    }

    if (meeting?.next_steps && meeting.next_steps.length > 0) {
      addText("Next Steps", 14, true, [100, 100, 100]);
      const steps = meeting.next_steps.map(s => `• ${s}`);
      addText(steps, 12, false);
      y += 4;
    }

    if (meeting?.action_items && meeting.action_items.length > 0) {
      addText("Action Items", 14, true, [100, 100, 100]);
      meeting.action_items.forEach(item => {
        addText(`• Task: ${item.task}`, 12, true);
        addText(`  Owner: ${item.owner}  |  Due: ${item.due_date || 'No Date'}`, 11, false, [80, 80, 80]);
        y -= 2; // tight spacing
      });
      y += 6;
    }

    // Save automatically
    const filename = `${meeting?.meeting_title?.replace(/[^a-z0-9]/gi, '_') || 'Meeting'}_Summary.pdf`;
    doc.save(filename);
  };

  const formatList = (items, field) => {

    if (!items || !items.length)
      return "No items";

    return items
      .map((item) => {
        if (typeof item === "string")
          return item;

        return item[field] ||
          item.task ||
          item.decision ||
          JSON.stringify(item);
      })
      .join(", ");
  };

  const formatTranscript = (transcript) => {

    if (!transcript) return "";

    if (typeof transcript === "string")
      return transcript;

    return transcript.transcript ||
      JSON.stringify(transcript);
  };

  if (loading || !meeting) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <h1 className="text-2xl font-semibold">
          {error || "Loading Meeting..."}
        </h1>

      </div>

    );

  }

  return (

    <div className="flex bg-[#edf4f1] min-h-screen">

      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1">

        <div className="print:hidden">
          <Topbar />
        </div>

        <div className="p-10 print:p-0">

          {/* Meeting Title */}

          <h1 className="text-5xl font-bold">

            {meeting.meeting_title}

          </h1>

          {/* Meeting Status */}

          <div className="bg-white rounded-3xl p-6 mt-8 print:hidden">

            <h2 className="text-2xl font-bold">
              Meeting Status
            </h2>

            <p className="mt-4">

              Status:

              <span
                className={
                  meetingStatus === "Recording"
                    ? "text-green-600 font-bold ml-2"
                    : "text-red-500 font-bold ml-2"
                }
              >

                {meeting.status || meetingStatus}

              </span>

            </p>

            {uploadedFileName && (

              <p className="mt-4 text-gray-600">

                Uploaded Audio:

                <span className="font-semibold ml-2">

                  {uploadedFileName}

                </span>

              </p>

            )}

          </div>

          {/* Generate Summary */}

          <div className="mt-6 mb-6 flex gap-4 print:hidden">

            {summaryError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                {summaryError}
              </div>
            )}

            <button
              onClick={generateSummary}
              disabled={generating}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
            >

              {generating ? "Generating..." : "Generate AI Summary"}

            </button>
            
            {showSummary && (
              <button
                onClick={downloadPDF}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
              >
                Download as PDF
              </button>
            )}

          </div>

          {/* Summary + Decisions */}
          {showSummary && (
            <div id="summary-content" className="p-4 bg-[#edf4f1]">
              <div className="grid grid-cols-2 gap-6 mt-6">

                <SummaryCard
                  title="Meeting Summary"
                  content={meeting.meeting_summary}
                />

                <SummaryCard
                  title="Executive Summary"
                  content={meeting.executive_summary}
                />

                <SummaryCard
                  title="Key Decisions"
                  content={
                    formatList(
                      meeting.key_decisions,
                      "decision"
                    )
                  }
                />

                <SummaryCard
                  title="Risks"
                  content={
                    formatList(meeting.risks)
                  }
                />

                <SummaryCard
                  title="Next Steps"
                  content={
                    formatList(meeting.next_steps)
                  }
                />

              </div>

              {/* Transcript */}

              <div className="mt-10">

                <TranscriptViewer
                  transcript={
                    formatTranscript(
                      meeting.transcript
                    )
                  }
                />

              </div>

              {/* Action Items */}

              <div className="bg-white rounded-3xl p-6 mt-10">

                <h2 className="text-2xl font-bold mb-4">

                  Action Items

                </h2>

                {meeting.action_items?.length ? (
                  meeting.action_items.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="border-b py-4"
                      >

                        <p className="font-medium">
                          {item.task}
                        </p>

                        <p className="text-gray-500">
                          {item.owner}
                        </p>

                        <p className="text-gray-500">
                          {item.due_date}
                        </p>

                      </div>

                    )
                  )
                ) : (
                  <p className="text-gray-500">
                    No action items
                  </p>
                )}

              </div>
            </div>
          )}

        </div>

      </div>

    </div>

  );

}

export default ViewMeeting;