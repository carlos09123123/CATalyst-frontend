import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdInput } from "react-icons/md";
import { useGroup } from "../../../context/GroupContext.jsx";
import { getSummaryByGroupAPI } from "../../../api/workflow.summarizer.js";
import { runRRLAssessmentAPI } from "../../../api/workflow.rrl.js";
import { useFeedbackModal } from "../../../hooks/useFeedbackModel";
import FeedbackModal from "../../modals/FeedbackModal";

export default function RRLInput({ setResult }) {
  const group_id = useGroup().groupId;

  const [summaries, setSummaries] = useState([]);
  const [selectedSummaries, setSelectedSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const { config, showFeedback } = useFeedbackModal();

  useEffect(() => {
    async function fetchSummaries() {
      try {
        setLoading(true);
        const res = await getSummaryByGroupAPI(group_id);
        setSummaries(res.data || []);
      } catch (err) {
        console.error("Failed to fetch summaries:", err);
      } finally {
        setLoading(false);
      }
    }

    if (group_id) fetchSummaries();
  }, [group_id]);

  const toggleSummary = (id) => {
    setSelectedSummaries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRunAssessment = async () => {
    if (selectedSummaries.length === 0) {
      showFeedback({
        type: "error",
        title: "No Summary Selected",
        message: "Please select at least one summary before running the RRL Assessment.",
      });
      return;
    }

    try {
      setRunning(true);
      const response = await runRRLAssessmentAPI(group_id, selectedSummaries);
      
      setResult({ refreshed: Date.now() });

      showFeedback({
        type: "success",
        title: "RRL Assessment Complete",
        message: "Successfully generated evaluation for the selected summaries.",
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: "error",
        title: "Assessment Failed",
        message: "Failed to run RRL assessment workflow.",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      <div
        className="h-100 rounded-4 p-3 d-flex flex-column"
        style={{
          backgroundColor: "#1e1e2f",
          border: "1px solid #3a3a55",
          color: "#e4e4f0",
        }}
      >
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h5 className="fw-bold mb-0 text-white">RRL Assessment Input</h5>
            <small style={{ color: "#a1a1b5" }}>
              Select summaries to evaluate their relevance and alignment
            </small>
          </div>
          <MdInput size={22} />
        </div>

        <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
          <small style={{ color: "#a1a1b5", display: "block", marginBottom: "8px" }}>
            Available Summaries
          </small>

          <div className="d-flex flex-column gap-2">
            {loading && <div style={{ color: "#a1a1b5" }}>Loading summaries...</div>}
            
            {!loading && summaries.length === 0 && (
              <div style={{ color: "#a1a1b5" }}>No summaries found for this group.</div>
            )}

            {!loading &&
              summaries.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-3 d-flex align-items-start gap-2"
                  style={{
                    backgroundColor: "#25253a",
                    border: "1px solid #3a3a55",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleSummary(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedSummaries.includes(item.id)}
                    readOnly
                    style={{ marginTop: "4px" }}
                  />
                  <div>
                    <div className="small text-white fw-semibold">
                      {item.title || "Untitled Summary"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#a1a1b5" }}>
                      {item.filename || `Summary ${item.id.substring(0, 8)}`}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="text-end mt-3">
          <button
            onClick={handleRunAssessment}
            disabled={running}
            className="btn"
            style={{
              backgroundColor: "#5b5bd6",
              color: "#fff",
              border: "none",
            }}
          >
            <FaPlay className="me-1" />
            {running ? "Evaluating..." : "Run Assessment"}
          </button>
        </div>
      </div>

      <FeedbackModal {...config} />
    </>
  );
}
