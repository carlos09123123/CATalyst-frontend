import { useEffect, useState } from "react";
import { FaLayerGroup } from "react-icons/fa";
import { MdInput } from "react-icons/md";
import { useGroup } from "../../../context/GroupContext.jsx";
import { getGapsByGroupAPI } from "../../../api/workflow.gap.js";
import { consolidateGapsAPI } from "../../../api/workflow.integration.js";
import { useFeedbackModal } from "../../../hooks/useFeedbackModel";
import FeedbackModal from "../../modals/FeedbackModal";

export default function IntegrationInput({ setResult }) {
  const group_id = useGroup().groupId;

  const [gaps, setGaps] = useState([]);
  const [selectedGaps, setSelectedGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const { config, showFeedback } = useFeedbackModal();

  useEffect(() => {
    async function fetchGaps() {
      try {
        setLoading(true);
        const res = await getGapsByGroupAPI(group_id);
        
        // Filter out already integrated gaps so we don't consolidate the consolidations
        const filteredGaps = (res.data || []).filter(g => !g.title?.includes("Integrated"));
        setGaps(filteredGaps);
      } catch (err) {
        console.error("Failed to fetch gaps:", err);
      } finally {
        setLoading(false);
      }
    }

    if (group_id) fetchGaps();
  }, [group_id]);

  const toggleGap = (id) => {
    setSelectedGaps((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        if (prev.length >= 3) {
          showFeedback({
            type: "warning",
            title: "Limit Reached",
            message: "You can only select up to 3 gaps for integration.",
          });
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleIntegrate = async () => {
    if (selectedGaps.length < 2) {
      showFeedback({
        type: "error",
        title: "Selection Error",
        message: "Please select at least 2 gaps to integrate.",
      });
      return;
    }

    try {
      setRunning(true);
      const res = await consolidateGapsAPI(group_id, selectedGaps);
      
      showFeedback({
        type: "success",
        title: "Integration Successful",
        message: "The gaps have been successfully consolidated into a single research gap.",
      });
      
      setResult({ refreshed: Date.now(), data: res.data });
      setSelectedGaps([]);
      
    } catch (err) {
      console.error(err);
      
      let errorMsg = err.message || "Failed to integrate the selected gaps.";
      if (errorMsg.includes("429 Too Many Requests") || errorMsg.includes("Quota exceeded")) {
        errorMsg = "Google AI quota exceeded (Free Tier Limit). Please wait 1 minute and try again.";
      } else if (errorMsg.length > 200) {
        errorMsg = "An unexpected error occurred. Please try again.";
      }
      
      showFeedback({
        type: "error",
        title: "Integration Failed",
        message: errorMsg,
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
            <h5 className="fw-bold mb-0 text-white">Data Integration Input</h5>
            <small style={{ color: "#a1a1b5" }}>
              Select 2-3 gaps to consolidate into a single research gap.
            </small>
          </div>
          <MdInput size={22} />
        </div>

        <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
          <small style={{ color: "#a1a1b5", display: "block", marginBottom: "8px" }}>
            Available Gaps ({selectedGaps.length}/3 selected)
          </small>

          <div className="d-flex flex-column gap-2">
            {loading && <div style={{ color: "#a1a1b5" }}>Loading gaps...</div>}
            
            {!loading && gaps.length === 0 && (
              <div style={{ color: "#a1a1b5" }}>No gaps available. Run the Gap Extractor first.</div>
            )}

            {!loading &&
              gaps.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-3 d-flex align-items-start gap-2"
                  style={{
                    backgroundColor: "#25253a",
                    border: "1px solid #3a3a55",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleGap(item.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedGaps.includes(item.id)}
                    readOnly
                    style={{ marginTop: "4px" }}
                  />
                  <div>
                    <div className="small text-white fw-semibold">
                      {item.title || `Gap Analysis ${item.id.substring(0, 8)}`}
                    </div>
                    <div style={{ fontSize: "12px", color: "#a1a1b5" }}>
                       Created: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="text-end mt-3">
          <button
            onClick={handleIntegrate}
            disabled={running || selectedGaps.length < 2}
            className="btn"
            style={{
              backgroundColor: "#5b5bd6",
              color: "#fff",
              border: "none",
            }}
          >
            <FaLayerGroup className="me-2" />
            {running ? "Consolidating..." : "Integrate Gaps"}
          </button>
        </div>
      </div>

      <FeedbackModal {...config} />
    </>
  );
}
