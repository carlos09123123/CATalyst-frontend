import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdInput } from "react-icons/md";
import { useGroup } from "../../../context/GroupContext.jsx";
import { getGapsByGroupAPI } from "../../../api/workflow.gap.js";
import { getTopicsByGroupIdAPI } from "../../../api/workflow.topic.js";
import { generateObjectivesAPI } from "../../../api/workflow.objective.js";
import { useFeedbackModal } from "../../../hooks/useFeedbackModel";
import FeedbackModal from "../../modals/FeedbackModal";

export default function ObjectiveInput({ setResult }) {
  const group_id = useGroup().groupId;

  const [gaps, setGaps] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedGap, setSelectedGap] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const { config, showFeedback } = useFeedbackModal();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [gapsRes, topicsRes] = await Promise.all([
          getGapsByGroupAPI(group_id),
          getTopicsByGroupIdAPI(group_id)
        ]);
        setGaps(gapsRes.data || []);
        setTopics(topicsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch gaps/topics:", err);
      } finally {
        setLoading(false);
      }
    }

    if (group_id) fetchData();
  }, [group_id]);

  const handleGenerate = async () => {
    if (!selectedGap || !selectedTopic) {
      showFeedback({
        type: "error",
        title: "Missing Selection",
        message: "Please select both a gap and a topic.",
      });
      return;
    }

    try {
      setRunning(true);
      const response = await generateObjectivesAPI(group_id, selectedGap, selectedTopic);
      
      setResult({ refreshed: Date.now() });

      showFeedback({
        type: "success",
        title: "Objectives Generated",
        message: "Successfully generated SMART objectives.",
      });
    } catch (err) {
      console.error(err);
      showFeedback({
        type: "error",
        title: "Generation Failed",
        message: "Failed to generate objectives.",
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
            <h5 className="fw-bold mb-0 text-white">SMART Objectives Input</h5>
            <small style={{ color: "#a1a1b5" }}>
              Select a gap and a topic to generate objectives
            </small>
          </div>
          <MdInput size={22} />
        </div>

        <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
          
          <div className="mb-4">
            <small style={{ color: "#a1a1b5", display: "block", marginBottom: "8px" }}>
              Select Research Gap
            </small>
            <select 
              className="form-select"
              value={selectedGap}
              onChange={(e) => setSelectedGap(e.target.value)}
              style={{ backgroundColor: "#25253a", color: "#fff", border: "1px solid #3a3a55" }}
            >
              <option value="">-- Choose a Gap --</option>
              {gaps.map(g => (
                <option key={g.id} value={g.id}>{g.title || `Gap Analysis ${g.id.substring(0, 8)}`}</option>
              ))}
            </select>
          </div>

          <div>
            <small style={{ color: "#a1a1b5", display: "block", marginBottom: "8px" }}>
              Select Research Topic
            </small>
            <select 
              className="form-select"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ backgroundColor: "#25253a", color: "#fff", border: "1px solid #3a3a55" }}
            >
              <option value="">-- Choose a Topic --</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.title || `Suggested Topics ${t.id.substring(0, 8)}`}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="text-end mt-3">
          <button
            onClick={handleGenerate}
            disabled={running || !selectedGap || !selectedTopic}
            className="btn"
            style={{
              backgroundColor: "#5b5bd6",
              color: "#fff",
              border: "none",
            }}
          >
            <FaPlay className="me-1" />
            {running ? "Generating..." : "Generate Objectives"}
          </button>
        </div>
      </div>

      <FeedbackModal {...config} />
    </>
  );
}
